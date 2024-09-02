// Orchestra Multi-Master Action Layer
// Copyright (c) 2022 - 2024 Joseph Huckaby

const fs = require('fs');
const cp = require('child_process');
const async = require('async');
const WebSocket = require('ws');
const Tools = require('pixl-tools');
const PixlMail = require('pixl-mail');
const noop = function() {};

class Actions {
	
	runJobActions(job, triggers, callback) {
		// fire a set of job actions that match a trigger id or ids
		var self = this;
		var final_actions = [];
		if (!callback) callback = noop;
		if (typeof(triggers) == 'string') triggers = [triggers];
		
		triggers.forEach( function(trigger) {
			self.logDebug(8, "Running job actions for trigger: " + trigger, { job_id: job.id });
			
			var actions = Tools.findObjects( job.actions || [], { trigger, enabled: true } );
			if (actions.length) final_actions = final_actions.concat(actions);
			
			// fire universal system hooks matching trigger (with `job_` prefix)
			// these happen in the background
			var hook_data = self.getJobHookData(job, { trigger });
			self.fireSystemHook('job_' + trigger, hook_data);
			self.updateDailyStat( 'job_' + trigger, 1 );
			if (job.server) self.updateDailyServerStat( job.server, 'job_' + trigger, 1 );
		}); // foreach trigger
		
		// dedupe actions
		var temp_state = {};
		final_actions = final_actions.filter( function(action) {
			var key = action.type + '-';
			switch (action.type) {
				case 'email': key += action.email; break;
				case 'web_hook': key += action.web_hook; break;
				case 'run_event': key += action.event_id; break;
				case 'channel': key += action.channel_id; break;
				case 'disable': break;
				case 'snapshot': break;
			}
			if (key in temp_state) return false; // dupe
			temp_state[key] = 1;
			return true;
		} );
		
		// run actions in parallel
		async.each( final_actions,
			function(action, callback) {
				self.runJobAction(job, action, callback);
			},
			callback
		); // async.each
	}
	
	runJobAction(job, action, callback) {
		// execute job action
		var self = this;
		if (!callback) callback = noop;
		this.logDebug(8, "Executing job action", { action, job_id: job.id });
		
		// log action to job meta/activity
		this.appendMetaLog(job, "Executing job " + action.trigger + " action: " + action.type);
		
		// track performance per action
		action.date = Tools.timeNow();
		action.elapsed = 0;
		var perf_start = performance.now();
		
		// run it
		var func = 'runJobAction_' + action.type;
		if (!this[func]) {
			// should never happen
			action.code = 'type';
			action.description = "Unknown action type: " + action.type;
			this.logError('action', action.description, { action, job_id: job.id });
			return callback();
		}
		
		this[func](job, action, function() {
			action.elapsed_ms = Math.floor( performance.now() - perf_start ); // this is milliseconds
			if (action.code) self.logError( action.type, action.description, { job: job.id } );
			else self.logDebug( 8, action.type + ": " + action.description, { job: job.id } );
			callback();
		});
	}
	
	runJobAction_email(job, action, callback) {
		// send email for job action
		var self = this;
		if (!callback) callback = noop;
		
		var mail_args = this.getJobHookData(job, action);
		mail_args.config = this.config.get();
		
		this.appendMetaLog(job, "Sending email notification to: " + action.email);
		
		// prep email template
		var template_file = '';
		if (action.trigger == 'start') template_file = 'conf/emails/job_start.txt';
		else if (!job.code) template_file = 'conf/emails/job_success.txt';
		else template_file = 'conf/emails/job_fail.txt';
		
		this.getJobLogExcerpt( job, function(err, excerpt) {
			mail_args.log_excerpt = excerpt || 'n/a';
			
			// load template file ourselves, so we can use new Tools.sub() with fallback 'n/a` text
			fs.readFile( template_file, '', function(err, template_text) {
				if (err) {
					action.code = 'email';
					action.description = "Failed to load email template: " + template_file + ": " + err;
					return callback();
				}
				
				// substitute macros with `n/a` fallback
				var mail_text = Tools.sub( template_text, mail_args, false, 'n/a' );
				action.details = "**Message Content:**\n\n```\n" + mail_text.trim() + "\n```\n";
				
				// construct mailer
				var mail = new PixlMail( self.config.get('smtp_hostname'), self.config.get('smtp_port') || 25 );
				mail.setOptions( self.config.get('mail_options') || {} );
				
				// send it
				mail.send( mail_text, function(err) {
					if (err) {
						action.code = 'email';
						action.description = "Failed to send e-mail: " + action.email + ": " + err;
					}
					else {
						action.code = 0;
						action.description = "Email sent successfully to: " + action.email;
					}
					
					callback();
				} ); // mail.send
			}); // fs.readFile
		}); // getJobLogExcerpt
	}
	
	runJobAction_web_hook(job, action, callback) {
		// fire off web hook for action
		var self = this;
		if (!callback) callback = noop;
		
		var hook_data = this.getJobHookData(job, action);
		this.appendMetaLog(job, "Firing web hook: " + action.web_hook);
		this.logDebug(9, "Firing job web hook for " + action.trigger + ": " + action.web_hook);
		
		this.fireWebHook(action.web_hook, hook_data, function(err, result) {
			var { resp, data, perf, url, opts } = result;
			
			if (err) {
				action.code = 'webhook';
				action.description = "" + err;
			}
			else {
				action.code = 0;
				action.description = "Success (HTTP " + resp.statusCode + " " + resp.statusMessage + ")";
			}
			
			action.details = "";
			action.details += "**Method:** " + opts.method + "\n";
			action.details += "\n**URL:** " + url + "\n";
			
			if (Tools.numKeys(opts.headers)) {
				action.details += "\n**Request Headers:**\n\n```http\n";
				for (var key in opts.headers) {
					action.details += key + ": " + opts.headers[key] + "\n";
				}
				action.details += "```\n";
			}
			
			if (opts.data && opts.data.length) {
				action.details += "\n**Request Body:**\n\n```\n";
				action.details += opts.data.toString().trim() + "\n```\n";
			}
			
			if (resp && resp.rawHeaders) {
				action.details += "\n**Response:**\nHTTP " + resp.statusCode + " " + resp.statusMessage + "\n";
				action.details += "\n**Response Headers:**\n\n```http\n";
				
				for (var idx = 0, len = resp.rawHeaders.length; idx < len; idx += 2) {
					action.details += resp.rawHeaders[idx] + ": " + resp.rawHeaders[idx + 1] + "\n";
				}
				action.details += "```\n";
				
				if (data && data.length) {
					action.details += "\n**Response Body:**\n\n```\n";
					action.details += data.toString().trim() + "\n```\n";
				}
				
				if (perf) action.details += "\n**Performance Metrics:**\n\n```json\n" + JSON.stringify(perf.metrics(), null, "\t") + "\n```\n";
			}
			callback();
		}); // fireWebHook
	}
	
	runJobAction_run_event(job, action, callback) {
		// run event for action
		var self = this;
		if (!callback) callback = noop;
		
		var event = Tools.findObject( this.events, { id: action.event_id } );
		if (!event) {
			action.code = 'event';
			action.description = "Event not found: " + action.event_id;
			return callback();
		}
		var new_job = Tools.copyHash(event, true);
		
		// set new job source and parent
		new_job.source = 'action';
		new_job.parent = {
			id: job.id,
			data: job.data || {},
			files: job.files || []
		};
		
		// allow action to specify event param overrides
		if (action.params) {
			if (!new_job.params) new_job.params = {};
			Tools.mergeHashInto(new_job.params, action.params);
		}
		
		this.appendMetaLog(job, "Running custom event: " + event.title);
		this.logDebug(6, "Running event for action: " + action.trigger + ": " + event.title, new_job);
		
		this.launchJob(new_job, function(err, id) {
			if (err) {
				action.code = 'event';
				action.description = "Failed to launch event: " + (err.message || err);
				return callback();
			}
			
			action.code = 0;
			action.description = "Successfully launched job: " + id;
			action.loc = '#Job?id=' + id;
			
			// populate jobs array in current job
			if (!job.jobs) job.jobs = [];
			job.jobs.push({ id, reason: 'action' });
			
			callback();
		});
	}
	
	runJobAction_channel(job, action, callback) {
		// activate notification channel for action
		var self = this;
		if (!callback) callback = noop;
		
		var channel = Tools.findObject( this.channels, { id: action.channel_id } );
		if (!channel) {
			action.code = 'channel';
			action.description = "Notification Channel not found: " + action.channel_id;
			return callback();
		}
		if (!channel.enabled) {
			action.code = 'channel';
			action.description = "Notification Channel is disabled: " + action.channel_id;
			return callback();
		}
		
		this.appendMetaLog(job, "Notifying channel: " + channel.title);
		this.logDebug(6, "Notifying channel for action: " + action.trigger + ": " + channel.title, channel);
		
		action.code = 0;
		action.description = "Successfully notified channel: " + action.channel_id;
		action.details = "";
		
		async.parallel(
			[
				function(callback) {
					// email
					if (!channel.email) return callback();
					var sub_action = Tools.mergeHashes(action, { type: 'email', email: channel.email });
					
					self.runJobAction_email(job, sub_action, function() {
						if (sub_action.code) {
							action.code = sub_action.code;
							action.description = sub_action.description;
						}
						sub_action.details = "**Result:** " + sub_action.description + "\n\n" + (sub_action.details || '');
						if (sub_action.details) {
							if (action.details) action.details += "\n";
							action.details += "### Email Details:\n\n" + sub_action.details.trim() + "\n";
						}
						callback();
					});
				},
				function(callback) {
					// web hook
					if (!channel.web_hook) return callback();
					var sub_action = Tools.mergeHashes(action, { type: 'web_hook', web_hook: channel.web_hook });
					
					self.runJobAction_web_hook(job, sub_action, function() {
						if (sub_action.code) {
							action.code = sub_action.code;
							action.description = sub_action.description;
						}
						sub_action.details = "**Result:** " + sub_action.description + "\n\n" + (sub_action.details || '');
						if (sub_action.details) {
							if (action.details) action.details += "\n";
							action.details += "### Web Hook Details:\n\n" + sub_action.details.trim() + "\n";
						}
						callback();
					});
				},
				function(callback) {
					// run event
					if (!channel.run_event) return callback();
					var sub_action = Tools.mergeHashes(action, { type: 'run_event', event_id: channel.run_event });
					
					self.runJobAction_run_event(job, sub_action, function() {
						if (sub_action.code) {
							action.code = sub_action.code;
							action.description = sub_action.description;
						}
						sub_action.details = "**Result:** " + sub_action.description + "\n\n" + (sub_action.details || '');
						if (sub_action.details) {
							if (action.details) action.details += "\n";
							action.details += "### Event Details:\n\n" + sub_action.details.trim() + "\n";
						}
						callback();
					});
				},
				function(callback) {
					// shell exec
					if (!channel.shell_exec) return callback();
					
					var hook_data = self.getJobHookData(job, action);
					var cmd = Tools.sub( channel.shell_exec, hook_data );
					
					// self.appendMetaLog(job, "Running custom shell command: " + cmd);
					self.logDebug(9, "Firing system shell hook for " + action.trigger + ": " + cmd);
					
					cp.exec( cmd, function(err, stdout, stderr) {
						if (action.details) action.details += "\n";
						action.details += "### Shell Exec Details:\n";
						action.details += "\n**Command:** " + cmd + "\n";
						action.details += "\n**Result:** " + (err || "Success") + "\n";
						
						if (err) {
							self.logDebug(9, "Shell Hook Error: " + cmd + ": " + err);
							action.code = 'exec';
							action.description = "" + err;
							action.details += "\n**Exit Code:** " + err.code + "\n";
							action.details += "**Signal:** " + (err.signal || 'n/a') + "\n";
						}
						else self.logDebug(9, "Shell Hook Completed", { cmd, stdout, stderr } );
						
						action.details += "\n**STDOUT:**\n\n```\n" + (stdout.trim() || "(Empty)") + "\n```\n";
						action.details += "\n**STDERR:**\n\n```\n" + (stderr.trim() || "(Empty)") + "\n```\n";
						
						callback();
					} );
				}
			],
			callback
		); // async.parallel
	}
	
	runJobAction_disable(job, action, callback) {
		// disable the event for action
		if (!callback) callback = noop;
		
		this.appendMetaLog(job, "Disabling event for action");
		if (!job.update_event) job.update_event = {};
		job.update_event.enabled = false;
		
		action.code = 0;
		action.description = "Successfully disabled event.";
		action.loc = '#Events?id=' + job.event;
		callback();
	}
	
	runJobAction_snapshot(job, action, callback) {
		// take a snapshot of the server for action
		var self = this;
		if (!callback) callback = noop;
		
		this.appendMetaLog(job, "Taking snapshot of server: " + job.server);
		
		this.createSnapshot(job.server, { source: 'job' }, function(err, id) {
			if (err) {
				action.code = 'snapshot';
				action.description = "Failed to take snapshot: " + err;
			}
			else {
				action.code = 0;
				action.description = "Succesfully took snapshot of server: " + job.server;
				action.loc = '#Snapshots?id=' + id;
			}
			callback();
		});
	}
	
	getJobHookData(job, action) {
		// return a copy of job object, augmented with all data used in hooks
		var hook_data = {
			job: job,
			action: action,
			event: Tools.findObject( this.events, { id: job.event } ) || null,
			plugin: Tools.findObject( this.plugins, { id: job.plugin } ) || null,
			category: Tools.findObject(this.categories, { id: job.category }) || null,
		};
		
		if (job.server && this.servers[job.server]) hook_data.server = this.servers[job.server];
		
		hook_data.links = {
			job_details: this.config.get('base_app_url') + '/#Job?id=' + job.id,
			job_log: this.config.get('base_app_url') + '/api/app/download_job_log?id=' + job.id + '&t=' + Tools.digestBase64( 'download' + job.id + this.config.get('secret_key'), 'sha256', 16 )
		};
		
		hook_data.display = {
			elapsed: Tools.getTextFromSeconds(job.elapsed || 0, false, false),
			log_size: Tools.getTextFromBytes( job.log_file_size || 0 ),
			perf: job.perf || '(No metrics provided)'
		};
		
		// perf may be an object
		if (Tools.isaHash(hook_data.display.perf)) {
			hook_data.display.perf = JSON.stringify(hook_data.display.perf);
		}
		
		// compose nice mem/cpu usage info
		hook_data.display.mem = '(Unknown)';
		if (job.mem && job.mem.count) {
			var mem_avg = Math.floor( job.mem.total / job.mem.count );
			hook_data.display.mem = Tools.getTextFromBytes( mem_avg );
			hook_data.display.mem += ' (Peak: ' + Tools.getTextFromBytes( job.mem.max ) + ')';
		}
		hook_data.display.cpu = '(Unknown)';
		if (job.cpu && job.cpu.count) {
			var cpu_avg = Tools.shortFloat( job.cpu.total / job.cpu.count );
			hook_data.display.cpu = '' + cpu_avg + '%';
			hook_data.display.cpu += ' (Peak: ' + Tools.shortFloat( job.cpu.max ) + '%)';
		}
		
		// generate short description for text property
		var text_templates = this.config.get('hook_text_templates');
		var text_template = text_templates[ 'job_' + action.trigger ];
		if (!text_template && job.code) text_template = text_templates.job_error;
		if (!text_template && !job.code) text_template = text_templates.job_success;
		hook_data.text = hook_data.content = Tools.sub( text_template, hook_data, false, 'n/a' );
		
		return hook_data;
	}
	
	fireSystemHook(action, orig_data) {
		// fire system-level hook for any action, async in background, no callback
		// job actions should be prefixed with job_ (e.g. job_complete)
		// other actions are from API calls (e.g. update_event)
		// logActivity() also calls this
		var self = this;
		var sys_hooks = this.config.get('hooks') || {};
		var hook = sys_hooks[action] || sys_hooks['*'];
		
		if (hook) {
			if ((typeof(hook) == 'string') && hook.match(/^\w+\:\/\/\S+$/)) hook = { url: hook };
			else if ((typeof(hook) == 'string') && hook.match(/^\w+$/)) hook = { web_hook: hook };
			
			var data = Tools.copyHash(orig_data, true);
			data.action = action;
			data.epoch = Tools.timeNow(true);
			
			// compatibility with slack, discord, and other web hooks
			if (!data.text && data.description) data.text = data.description;
			if (!data.content && data.description) data.content = data.description;
			
			if (hook.url) {
				// allow placeholder subs on url (encoded)
				var url = Tools.sub( hook.url, data, false, "", encodeURIComponent );
				
				this.logDebug(9, "Firing system web hook for " + action + ": " + url);
				
				// include web_hook_config_keys if configured
				if (this.config.get('web_hook_config_keys')) {
					var web_hook_config_keys = this.config.get('web_hook_config_keys');
					for (var idy = 0, ley = web_hook_config_keys.length; idy < ley; idy++) {
						var key = web_hook_config_keys[idy];
						data[key] = this.config.get(key);
					}
				}
				
				// include web_hook_custom_data if configured
				if (this.config.get('web_hook_custom_data')) {
					var web_hook_custom_data = this.config.get('web_hook_custom_data');
					for (var key in web_hook_custom_data) data[key] = web_hook_custom_data[key];
				}
				
				// custom http options for web hook
				var hook_opts = this.config.get('web_hook_custom_opts') || {};
				
				this.request.json( url, data, hook_opts, function(err, resp, data) {
					// log response
					if (err) self.logDebug(9, "Web Hook Error: " + url + ": " + err);
					else self.logDebug(9, "Web Hook Response: " + url + ": HTTP " + resp.statusCode + " " + resp.statusMessage);
				} );
			} // web hook
			
			if (hook.web_hook) {
				// fire user-defined web hook
				this.logDebug(9, "Firing web hook for " + action + ": " + hook.web_hook);
				this.fireWebHook(hook.web_hook, data);
			}
			
			if (hook.shell_exec) {
				// allow placeholder subs on command
				var cmd = Tools.sub( hook.shell_exec, data );
				
				this.logDebug(9, "Firing system shell hook for " + action + ": " + cmd);
				cp.exec( cmd, function(err, stdout, stderr) {
					if (err) self.logDebug(9, "Shell Hook Error: " + cmd + ": " + err);
					else self.logDebug(9, "Shell Hook Completed", { cmd, stdout, stderr } );
				} );
			} // command hook
			
			// FUTURE: hook.exec_pipe ?
			
		} // hook
	}
	
	fireWebHook(id, data, callback) {
		// send HTTP request to URL for web hook action
		// callback is passed: (err, {resp, data, perf, url, opts} )
		var self = this;
		var hook = null;
		if (!callback) callback = noop;
		
		// locate web_hook object
		if (typeof(id) == 'string') {
			hook = Tools.findObject( this.web_hooks, { id: id } );
			if (!hook) {
				return callback( new Error("Web Hook not found: " + id) );
			}
			if (!hook.enabled) {
				return callback( new Error("Web Hook is disabled: " + id) );
			}
		}
		else if (typeof(id) == 'object') {
			// optionally pass in an object for the hook (test mode)
			hook = id;
		}
		else return callback( new Error("Internal Error: Web Hook is not an ID nor object.") );
		
		// allow placeholder subs on url (encoded)
		var url = Tools.sub( hook.url, data, false, "", encodeURIComponent );
		
		// custom http options for web hook
		var hook_opts = this.config.get('web_hook_custom_opts') || {};
		
		var opts = Tools.mergeHashes( hook_opts, {
			"method": hook.method,
			"follow": hook.follow ? 32 : false,
			"retries": hook.retries,
			"timeout": hook.timeout * 1000, // TTFB timeout
			"idleTimeout": hook.timeout * 1000, // socket idle timeout
			"headers": {}
		} );
		
		if (hook.headers.match(/\S/)) {
			Tools.sub(hook.headers, data).trim().split(/[\r\n]+/).forEach( function(line) {
				// parse out valid headers
				if (line.trim().match(/^([\!\#\$\%\&\'\*\+\-\.\^\_\`\|\~0-9a-zA-Z]+)\:\s*(.+)$/)) opts.headers[ RegExp.$1 ] = RegExp.$2;
			} );
		}
		if (!hook.method.match(/^(GET|HEAD)$/) && hook.body.trim().length) {
			opts.data = Buffer.from( Tools.sub(hook.body, data) );
		}
		if (hook.ssl_cert_bypass) {
			opts.rejectUnauthorized = false;
		}
		
		this.request.request( url, opts, function(err, resp, data, perf) {
			callback(err, { resp, data, perf, url, opts });
		} );
	}
	
}; // class Actions

module.exports = Actions;
