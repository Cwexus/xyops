// OpsRocket API Layer - Auth0 Integration
// Copyright (c) 2021 - 2024 Joseph Huckaby

const fs = require('fs');
const assert = require("assert");
const async = require('async');
const Tools = require("pixl-tools");

class Auth0 {
	
	api_auth0_login(args, callback) {
		// validate auth0 token using a secure server-to-server call
		var self = this;
		var params = args.params;
		var usermgr = this.usermgr;
		
		if (!this.requireMaster(args, callback)) return;
		if (!this.requireParams(params, {
			token: /^\S+$/
		}, callback)) return;
		
		// do not cache this API response
		this.forceNoCacheResponse(args);
		
		var opts = {
			headers: {
				'Authorization': 'Bearer ' + params.token,
				'Content-Type': "application/json"
			}
		};
		var url = 'https://' + this.config.getPath('auth0.params.domain') + '/userinfo';
		this.logDebug(6, "Validating auth0 login token: " + url, params);
		
		this.request.json( url, false, opts, function(err, resp, data, perf) {
			if (err) return self.doError('user', "Failed to access auth0: " + errm, callback);
			self.logDebug(5, "User successfully logged in via auth0", data);
			
			// {"sub":"auth0|627dbcde5b321c006fe4fb0d","nickname":"damian.lewis","name":"damian.lewis@example.com","picture":"https://s.gravatar.com/avatar/c89844ab187fe88c2957a5661885a12e?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fda.png","updated_at":"2022-05-14T00:49:03.963Z","email":"damian.lewis@example.com","email_verified":false}
			if (!data.nickname && !data.email) return self.doError('auth0', "External user has no nickname nor email.  Cannot sync accounts.", callback);
			
			// cleanup / massage fields
			var username = (data.nickname || data.email).replace(/\@.+$/, '').replace(/[^\w\-\.]+/g, '').toLowerCase();
			
			if (!username.match(usermgr.usernameMatch)) {
				return self.doError('user', "Username contains illegal characters: " + username, callback);
			}
			
			// user found in response!  update our records and create a local session
			var path = 'users/' + usermgr.normalizeUsername(username);
			
			self.logDebug(7, "Testing if user exists: " + path, { username });
			
			self.storage.get(path, function(err, user) {
				var new_user = false;
				if (!user) {
					// first time, create new user
					self.logDebug(6, "Creating new user: " + username);
					new_user = true;
					user = {
						username: username,
						active: 1,
						remote: true,
						sync: true,
						created: Tools.timeNow(true),
						modified: Tools.timeNow(true),
						salt: Tools.generateUniqueID( 64, username ),
						password: Tools.generateUniqueID(64), // unused
						privileges: Tools.copyHash( usermgr.config.get('default_privileges') || {} )
					};
				} // new user
				else {
					self.logDebug(7, "User already exists: " + username);
					if (user.force_password_reset) {
						return self.doError('login', "Account is locked out.  Please reset your password to unlock it.", callback);
					}
					if (!user.active) {
						return self.doError('login', "User account is disabled: " + username, callback);
					}
					user.remote = true;
					if (!('sync' in user)) user.sync = true;
				}
				
				// copy to args for logging
				args.user = user;
				
				var finish = function() {
					// sync user info
					if (user.sync) {
						user.full_name = data.name || data.nickname || username;
						user.email = data.email || (username + '@' + self.server.hostname);
						user.avatar = data.picture || '';
					}
					
					// save user locally
					self.storage.put( path, user, function(err) {
						if (err) return self.doError('user', "Failed to create user: " + err, callback);
						
						if (new_user) {
							self.logDebug(6, "Successfully created user: " + username);
							usermgr.logTransaction('user_create', username, 
								self.getClientInfo(args, { user: Tools.copyHashRemoveKeys( user, { password: 1, salt: 1 } ) }));
						}
						
						// now perform a local login
						usermgr.fireHook('before_login', args, function(err) {
							if (err) {
								return self.doError('login', "Failed to login: " + err, callback);
							}
							
							// now create session
							var now = Tools.timeNow(true);
							var expiration_date = Tools.normalizeTime(
								now + (86400 * usermgr.config.get('session_expire_days')),
								{ hour: 0, min: 0, sec: 0 }
							);
							
							// create session id and object
							var session_id = Tools.generateUniqueID( 64, username );
							var session = {
								id: session_id,
								username: username,
								ip: args.ip,
								useragent: args.request.headers['user-agent'],
								created: now,
								modified: now,
								expires: expiration_date
							};
							self.logDebug(6, "Logging user in: " + username + ": New Session ID: " + session_id, session);
							
							// store session object
							self.storage.put('sessions/' + session_id, session, function(err, data) {
								if (err) {
									return self.doError('user', "Failed to create session: " + err, callback);
								}
								
								// copy to args to logging
								args.session = session;
								
								self.logDebug(6, "Successfully logged in", username);
								usermgr.logTransaction('user_login', username, self.getClientInfo(args));
								
								// set session expiration
								self.storage.expire( 'sessions/' + session_id, expiration_date );
								
								callback( Tools.mergeHashes({ 
									code: 0, 
									username: username,
									user: Tools.copyHashRemoveKeys( user, { password: 1, salt: 1 } ), 
									session_id: session_id 
								}, args.resp || {}) );
								
								usermgr.fireHook('after_login', args);
								
								// add to master user list in the background
								if (new_user) {
									if (usermgr.config.get('sort_global_users')) {
										self.storage.listInsertSorted( 'global/users', { username: username }, ['username', 1], function(err) {
											if (err) usermgr.logError( 1, "Failed to add user to master list: " + err );
											usermgr.fireHook('after_create', args);
										} );
									}
									else {
										self.storage.listUnshift( 'global/users', { username: username }, function(err) {
											if (err) usermgr.logError( 1, "Failed to add user to master list: " + err );
											usermgr.fireHook('after_create', args);
										} );
									}
								} // new user
								else {
									usermgr.fireHook('after_update', args);
								}
								
							} ); // save session
						} ); // before_login
					} ); // save user
				}; // finish
				
				// fire correct hook for action
				if (new_user) {
					usermgr.fireHook('before_create', args, function(err) {
						if (err) {
							return self.doError('user', "Failed to create user: " + err, callback);
						}
						finish();
					});
				}
				else {
					usermgr.fireHook('before_update', args, function(err) {
						if (err) {
							return self.doError('user', "Failed to update user: " + err, callback);
						}
						finish();
					});
				}
				
			} ); // user get
		} ); // auth0 request
	}
	
	api_auth0_redir(args, callback) {
		// perform redirect to special auth0 authorize URL
		// required as per: https://auth0.com/docs/authenticate/login/auth0-universal-login/configure-default-login-routes
		var url = 'https://' + this.config.getPath('auth0.params.domain') + '/authorize';
		callback( "302 Found", { Location: url }, false );
	}
	
}; // class Auth0

module.exports = Auth0;
