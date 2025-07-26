# Overview

![OpsRocket Logo](https://pixlcore.com/software/opsrocket/images/logo-title-full.png)

**OpsRocket** is a 

## Features at a Glance

- Free and open source.

## Table of Contents

<!-- toc -->
- [Installation](#installation)
- [Setup](#setup)
- [Configuration](#configuration)
	* [Basics](#basics)
		+ [base_app_url](#base_app_url)
		+ [email_from](#email_from)
		+ [smtp_hostname](#smtp_hostname)
		+ [smtp_port](#smtp_port)
		+ [mail_settings](#mail_settings)
		+ [log_dir](#log_dir)
		+ [log_filename](#log_filename)
		+ [log_columns](#log_columns)
		+ [log_archive_path](#log_archive_path)
		+ [pid_file](#pid_file)
		+ [debug_level](#debug_level)
		+ [maintenance](#maintenance)
	* [Storage Configuration](#storage-configuration)
		+ [Filesystem](#filesystem)
		+ [Couchbase](#couchbase)
		+ [Amazon S3](#amazon-s3)
	* [Web Server Configuration](#web-server-configuration)
	* [User Configuration](#user-configuration)
	* [Email Configuration](#email-configuration)
- [Command Line](#command-line)
	* [Starting and Stopping](#starting-and-stopping)
	* [Storage Maintenance](#storage-maintenance)
	* [Recover Admin Access](#recover-admin-access)
	* [Server Startup](#server-startup)
	* [Upgrading](#upgrading)
	* [Logs](#logs)
- [S3 Mail Ingest](#s3-mail-ingest)
- [Machine Learning](#machine-learning)
- [Database](#database)
- [API Reference](#api-reference)
	* [JSON REST API](#json-rest-api)
	* [API Keys](#api-keys)
	* [Standard Response Format](#standard-response-format)
	* [API Calls](#api-calls)
		+ [search](#search)
- [Development](#development)
	* [Installing Dev Tools](#installing-dev-tools)
	* [Manual Installation](#manual-installation)
	* [Starting in Debug Mode](#starting-in-debug-mode)
- [License](#license)

# Installation

Please note that OpsRocket currently only works on POSIX-compliant operating systems, which basically means Unix/Linux and OS X.

You'll need to have [Node.js](https://nodejs.org/en/download/) pre-installed on your server.  Then become root and type this:

```
curl -s https://raw.githubusercontent.com/jhuckaby/opsrocket/master/bin/install.js | node
```

This will install the latest stable release of OpsRocket and all of its dependencies under: `/opt/opsrocket/`

If you'd rather install it manually (or something went wrong with the auto-installer), here are the raw commands:

```
mkdir -p /opt/opsrocket
cd /opt/opsrocket
curl -L https://github.com/pixlcore/opsrocket/archive/v1.0.0.tar.gz | tar zxvf - --strip-components 1
npm install
node bin/build.js dist
```

Replace `v1.0.0` with the desired OpsRocket version from the [release list](https://github.com/pixlcore/opsrocket/releases), or `master` for the head revision (unstable).

# Setup

If this is your first time installing, please read the [Configuration](#configuration) section first.  You'll likely want to customize a few configuration parameters in the `/opt/opsrocket/conf/config.json` file before proceeding.  At the very least, you should set these properties:

| Key | Description |
|-----|-------------|
| `base_app_url` | A fully-qualified URL to OpsRocket on your server, including the `http_port` if non-standard.  This is used in e-mails to create self-referencing URLs. |
| `email_from` | The e-mail address to use as the "From" address when sending out notifications. |
| `smtp_hostname` | The hostname of your SMTP server, for sending mail.  This can be `127.0.0.1` or `localhost` if you have [sendmail](https://en.wikipedia.org/wiki/Sendmail) running locally. |
| `http_port` | The web server port number for the user interface.  Defaults to 5522. |

Now then, the only other decision you have to make is what to use as a storage back-end.  OpsRocket can use local disk (easiest setup), [Couchbase](http://www.couchbase.com/nosql-databases/couchbase-server) or [Amazon S3](https://aws.amazon.com/s3/).

With that out of the way, run the following script to initialize the storage system.  You only need to do this once:

```
/opt/opsrocket/bin/control.sh setup
```

Among other things, this creates an administrator user account you can use to login right away.  The username is `admin` and the password is `admin`.  It is recommended you change the password as soon as possible, for security purposes (or just create your own administrator account and delete `admin`).

At this point you should be able to start the service and access the web UI.  Enter this command:

```
/opt/opsrocket/bin/control.sh start
```

Then send your browser to the server on the correct port:

```
http://YOUR_SERVER_HOSTNAME:3012/
```

You only need to include the port number in the URL if you are using a non-standard HTTP port (see [Web Server Configuration](#web-server-configuration)).

# Configuration

The main OpsRocket configuration file is in JSON format, and can be found here:

```
/opt/opsrocket/conf/config.json
```

Please edit this file directly.  It will not be touched by any upgrades.  A pristine copy of the default configuration can always be found here: `/opt/opsrocket/sample_conf/config.json`.

## Basics

Here are descriptions of the top-level configuration parameters:

### base_app_url

This should be set to a fully-qualified URL, pointing to your OpsRocket server, including the HTTP port number if non-standard.  Do not include a trailing slash.  This is used in e-mails to create self-referencing URLs.  Example:

```
http://local.opsrocket.dev:5522
```

If you are running OpsRocket behind a load balancer, this should be set to the load balanced virtual hostname.

### email_from

The e-mail address to use as the "From" address when sending out notifications.  Most SMTP servers require this to be a valid address to deliver mail.

### mail_settings

For OpsRocket to be able to send emails, you'll need to configure the `mail_settings` object.  This generally points at a SMTP server, but you can have it launch a local [sendmail](https://en.wikipedia.org/wiki/Sendmail) binary as well.  These options are passed directly to [nodemailer](https://nodemailer.com/smtp/), so please see their docs for full details.  Here is an example of using SMTP running on localhost:

```json
"mail_settings": {
	"host": "localhost",
	"port": 25
},
```

Here is how to use local sendmail via the command-line:

```json
"mail_settings": {
	"sendmail": true,
	"newline": "unix",
	"path": "/usr/sbin/sendmail"
},
```

Note that many SMTP servers require authentication.  This is done by specifying an `auth` object.  Here is an example using my local ISP's mail server.  They listen on a different port (587), and require user authentication for mail relay:

```json
"mail_settings": {
	"host": "mail.mcn.org",
	"port": 587,
	"secure": false,
	"auth": {
		"user": "jsmith",
		"pass": "********"
	},
	"from": "jsmith@mcn.org"
},
```

You can also set various timeout values using the `mail_settings` object, which are passed directly to [pixl-mail](https://www.github.com/jhuckaby/pixl-mail#options) (and then to [nodemailer](https://nodemailer.com/)).  Example:

```js
"mail_settings": {
	"connectionTimeout": 10000,
	"greetingTimeout": 10000,
	"socketTimeout": 10000
}
```

The `connectionTimeout`, `greetingTimeout` and `socketTimeout` properties are all expressed in milliseconds.

### log_dir

The directory where logs will be written, before they are archived.  This can be a partial path, relative to the OpsRocket base directory (`/opt/opsrocket`) or a full path to a custom location.  It defaults to `logs` (i.e. `/opt/opsrocket/logs`).

### log_filename

The filename to use when writing logs.  You have three options here: a single combined log file for all logs, multiple log files for each component, or multiple log files for each category (debug, transaction, error).  See the [Logs](#logs) section below for details.

### log_columns

This is an array of column IDs to log.  You are free to reorder or remove some of these, but do not change the names.  They are specific IDs that match up to log function calls in the code.  See the [Logs](#logs) section below for details.

### log_archive_path

Every night at midnight (local server time), the logs can be archived (gzipped) to a separate location.  This parameter specifies the path, and the directory naming / filenaming convention of the archive files.  It can utilize date placeholders including `[yyyy]`, `[mm]` and `[dd]`.

This can be a partial path, relative to the OpsRocket base directory (`/opt/opsrocket`) or a full path to a custom location.  It defaults to `logs/archives/[yyyy]/[mm]/[dd]/[filename]-[yyyy]-[mm]-[dd].log.gz`.

### pid_file

The PID file is simply a text file containing the Process ID of the main OpsRocket daemon.  It is used by the `control.sh` script to stop the daemon, and detect if it is running.  You should never have to deal with this file directly, and it defaults to living in the `logs` directory which is auto-created.  

This can be a partial path, relative to the OpsRocket base directory (`/opt/opsrocket`) or a full path to a custom location.  However, it should probably not be changed, as the `control.sh` script expects it to live in `logs/opsrocket.pid`.

### debug_level

The level of verbosity in the debug logs.  It ranges from `1` (very quiet) to `10` (extremely loud).  The default value is `9`.

### maintenance

OpsRocket needs to run storage maintenance once per day, which generally involves deleting expired records and trimming lists which have grown too large.  The application is still usable during this time, but UI performance may be slightly impacted.

By default the maintenance is set to run at 4:00 AM (local server time).  Feel free to change this to a more convenient time for your server environment.  The format of the parameter is `HH:MM`.

## Storage Configuration

The `Storage` object contains settings for the OpsRocket storage system.  This is built on the [pixl-server-storage](https://www.github.com/jhuckaby/pixl-server-storage) module, which can write everything to local disk (the default), [Couchbase](http://www.couchbase.com/nosql-databases/couchbase-server) or [Amazon S3](https://aws.amazon.com/s3/).

Note that since OpsRocket uses [full-text indexing](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md) for user content, specifically via [pixl-server-unbase](https://github.com/jhuckaby/pixl-server-unbase), it is highly recommended that you use the `Filesystem` engine.  Anything else, specially S3, would be excruciatingly slow.

To select a storage engine, place one of the following values into the `engine` property:

### Filesystem

The default storage method is to use local disk.  For this, set the `engine` property to `Filesystem`, and declare a sub-object with the same name, with a couple more properties:

```js
{
	"Storage": {
		"engine": "Filesystem",
		"Filesystem": {
			"base_dir": "data",
			"key_namespaces": 1
		}
	}
}
```

The `base_dir` is the base directory to store everything under.  It can be a fully-qualified filesystem path, or a relative path to the OpsRocket base directory (e.g. `/opt/opsrocket`).  In this case it will be `/opt/opsrocket/data`.

For more details on using the Filesystem as a backing store, please read the [Local Filesystem section in the pixl-server-storage docs](https://www.github.com/jhuckaby/pixl-server-storage#local-filesystem).

### Couchbase

To use Couchbase as a backing store for OpsRocket, please read the [Couchbase section in the pixl-server-storage docs](https://www.github.com/jhuckaby/pixl-server-storage#couchbase).  It has complete details for how to setup the storage object.  Example configuration:

```js
{
	"Storage": {
		"engine": "Couchbase",
		"Couchbase": {
			"connectString": "couchbase://127.0.0.1",
			"bucket": "default",
			"password": "",
			"serialize": false,
			"keyPrefix": "opsrocket"
		}
	}
}
```

If you are sharing a bucket with other applications, use the `keyPrefix` property to keep the OpsRocket data separate, in its own "directory".  For example, set `keyPrefix` to `"opsrocket"` to keep all the OpsRocket-related records in a top-level `opsrocket` directory in the bucket.

You'll also need to install the npm [couchbase](https://www.npmjs.com/package/couchbase) module:

```
cd /opt/opsrocket
npm install couchbase
```

After configuring Couchbase, you'll need to run the OpsRocket setup script manually, to recreate all the base storage records needed to bootstrap the system:

```
/opt/opsrocket/bin/control.sh setup
```

### Amazon S3

To use Amazon S3 as a backing store for OpsRocket, please read the [Amazon S3 section in the pixl-server-storage docs](https://www.github.com/jhuckaby/pixl-server-storage#amazon-s3).  It has complete details for how to setup the storage object.  Example configuration:

```js
{
	"Storage": {
		"engine": "S3",
		"AWS": {
			"accessKeyId": "YOUR_AMAZON_ACCESS_KEY", 
			"secretAccessKey": "YOUR_AMAZON_SECRET_KEY", 
			"region": "us-west-1",
			"correctClockSkew": true,
			"maxRetries": 5,
			"httpOptions": {
				"connectTimeout": 5000,
				"timeout": 5000
			}
		},
		"S3": {
			"keyPrefix": "opsrocket",
			"fileExtensions": true,
			"params": {
				"Bucket": "YOUR_S3_BUCKET_ID"
			}
		}
	}
}
```

If you are sharing a bucket with other applications, use the `keyPrefix` property to keep the OpsRocket data separate, in its own "directory".  For example, set `keyPrefix` to `"opsrocket"` to keep all the OpsRocket-related records in a top-level `opsrocket` directory in the bucket.  A trailing slash will be automatically added to the prefix if missing.

It is recommended that you always set the S3 `fileExtensions` property to `true` for new installs.  This makes the OpsRocket S3 records play nice with sync / copy tools such as [Rclone](https://rclone.org/).

To use S3 you'll also need to install the npm [aws-sdk](https://www.npmjs.com/package/aws-sdk) module:

```
cd /opt/opsrocket
npm install aws-sdk
```

After configuring S3, you'll need to run the OpsRocket setup script manually, to recreate all the base storage records needed to bootstrap the system:

```
/opt/opsrocket/bin/control.sh setup
```

## Web Server Configuration

OpsRocket has an embedded web server which handles serving up the user interface.  This is configured in the `WebServer` object, and there are only a handful of parameters you should ever need to configure:

```js
{
	"WebServer": {
		"http_port": 5522,
		
		"https": false,
		"https_port": 5523,
		"https_cert_file": "conf/ssl.crt",
		"https_key_file": "conf/ssl.key"
	}
}
```

Changing the `http_port` is probably the most common thing you will want to customize.  For example, if you don't have anything else running on port 80, you will probably want to change it to that, so you can access the UI without entering a port number.

This is also where you can enable HTTPS, if you want the UI to be SSL encrypted.  Set the `https` property to `true` to enable, and configure the `https_port` as you see fit (the standard HTTPS port is `443`).  You will have to supply your own SSL certificate files (sample self-signed certs are provided for testing, but they will generate browser warnings).

For more details on the web server component, please see the [pixl-server-web](https://www.github.com/jhuckaby/pixl-server-web#configuration) module documentation.

## User Configuration

OpsRocket has a simple user login and management system, which is built on the [pixl-server-user](https://www.github.com/jhuckaby/pixl-server-user) module.  It handles creating new users, assigning permissions, and login / session management.  It is configured in the `User` object, and there are only a couple of parameters you should ever need to configure:

```js
{
	"User": {
		"free_accounts": false,
		
		"default_privileges": {
			"admin": 0
		}
	}
}
```

The `free_accounts` property specifies whether guests visiting the UI can create their own accounts, or not.  This defaults to `false` (disabled), but you can set it to `true` to enable.

The `default_privileges` object specifies which privileges new accounts will receive by default.  Here is a list of all the possible privileges and what they mean:

| Privilege ID | Description |
|--------------|-------------|
| `admin` | User is a full administrator.  **This automatically grants ALL privileges, current and future.** |
| `post_topics` | User is allowed to post new topics via the API (Web UI). |
| `post_replies` | User is allowed to post replies via the API (Web UI). |
| `hashtags` | User is allowed to hashtag their posts into categories, e.g. `#politics`. |
| `mbox` | User is allowed to download [Mbox](https://en.wikipedia.org/wiki/Mbox) mail archives. |

By default new users have all the non-admin privileges.  Note that when an administrator creates new accounts via the UI, (s)he can customize the privileges at that point.  The configuration only sets the defaults.

For more details on the user manager component, please see the [pixl-server-user](https://www.github.com/jhuckaby/pixl-server-user#configuration) module documentation.

## Email Configuration

OpsRocket will send a number of different types of e-mails in response to certain events.  These are mostly confirmations of actions, forwarding messages for user search alerts, or just simple notifications.  Most of these can be disabled in the UI if desired.  The e-mail content is also configurable, including the `From` and `Subject` headers, and is based on plain text e-mail template files located on disk:

| Action | Email Template | Description |
|--------|----------------|-------------|
| **New User Account** | `conf/emails/welcome_new_user.txt` | Sent when a new user account is created. |
| **Changed Password** | `conf/emails/changed_password.txt` | Sent when a user changes their password. |
| **Recover Password** | `conf/emails/recover_password.txt` | Sent when a user requests password recovery. |
| **Logout All Sessions** | `conf/emails/logout_all_sessions.txt` | Sent when a user requests all sessions be logged out (security feature). |
| **Verify Email** | `conf/emails/verify_email.txt` | Sent when a user requests e-mail re-verification. |

Feel free to edit these files to your liking.  Note that any text in `[/square_brackets]` is a placeholder which gets swapped out with live data relevant to the event which fired off the e-mail.

The stock e-mail templates shipped with OpsRocket are plain text, but you can provide your own rich HTML e-mail templates if you want.  Simply start the e-mail body content (what comes after the Subject line) with an HTML open tag, e.g. `<div>`, and the e-mails will be sent as HTML instead of text.

You can include any property from the main `conf/config.json` file by using the syntax `[/config/KEY]`.  Also, to include environment variables, use the syntax `[/env/ENV_KEY]`, for example `[/env/NODE_ENV]`.

# Command Line

Here are all the OpsRocket services available to you on the command line.  Most of these are accessed via the following shell script:

```
/opt/opsrocket/bin/control.sh [COMMAND]
```

Here are all the accepted commands:

| Command | Description |
|---------|-------------|
| `start` | Starts OpsRocket in daemon mode. See [Starting and Stopping](#starting-and-stopping). |
| `stop` | Stops the OpsRocket daemon and waits for exit. See [Starting and Stopping](#starting-and-stopping). |
| `restart` | Calls `stop`, then `start`, in sequence. See [Starting and Stopping](#starting-and-stopping).  |
| `status` | Checks whether OpsRocket is currently running. See [Starting and Stopping](#starting-and-stopping).  |
| `setup` | Runs initial storage setup (for first time install). See [Setup](#setup). |
| `maint` | Runs daily storage maintenance routine. See [Storage Maintenance](#storage-maintenance). |
| `admin` | Creates new emergency admin account (specify user / pass). See [Recover Admin Access](#recover-admin-access). |
| `upgrade` | Upgrades OpsRocket to the latest stable (or specify version). See [Upgrading](#upgrading). |
| `version` | Outputs the current OpsRocket package version and exits. |
| `help` | Displays a list of available commands and exits. |

## Starting and Stopping

To start the service, use the `start` command:

```
/opt/opsrocket/bin/control.sh start
```

And to stop it, the `stop` command:

```
/opt/opsrocket/bin/control.sh stop
```

You can also issue a quick stop + start with the `restart` command:

```
/opt/opsrocket/bin/control.sh restart
```

The `status` command will tell you if the service is running or not:

```
/opt/opsrocket/bin/control.sh status
```

## Storage Maintenance

Storage maintenance automatically runs every morning at 4 AM local server time (this is [configurable](#maintenance) if you want to change it).  The operation is mainly for deleting expired records, and pruning lists that have grown too large.  However, if the OpsRocket service was stopped and you missed a day or two, you can force it to run at any time.  Just execute this command on your master server:

```
/opt/opsrocket/bin/control.sh maint
```

This will run maintenance for the current day.  However, if the service was down for more than one day, please run the command for each missed day, providing the date in `YYYY-MM-DD` format:

```
/opt/opsrocket/bin/control.sh maint 2015-10-29
/opt/opsrocket/bin/control.sh maint 2015-10-30
```

## Recover Admin Access

Lost access to your admin account?  You can create a new temporary administrator account on the command-line.  Just execute this command on your master server:

```
/opt/opsrocket/bin/control.sh admin USERNAME PASSWORD
```

Replace `USERNAME` with the desired username, and `PASSWORD` with the desired password for the new account.  Note that the new user will not show up in the master list of users in the UI.  But you will be able to login using the provided credentials.  This is more of an emergency operation, just to allow you to get back into the system.  *This is not a good way to create permanent users*.  Once you are logged back in, you should consider creating another account from the UI, then deleting the emergency admin account.

## Server Startup

Here are the instructions for making OpsRocket automatically start on server boot.  Type these commands as root:

```
cd /opt/opsrocket
npm run boot
```

## Upgrading

To upgrade OpsRocket, you can use the built-in `upgrade` command:

```
/opt/opsrocket/bin/control.sh upgrade
```

This will upgrade the app and all dependencies to the latest stable release, if a new one is available.  It will not affect your data storage, users, or configuration settings.  All those will be preserved and imported to the new version.

Alternately, you can specify the exact version you want to upgrade (or downgrade) to:

```
/opt/opsrocket/bin/control.sh upgrade 1.0.4
```

If you upgrade to the `HEAD` version, this will grab the very latest from GitHub.  Note that this is primarily for developers or beta-testers, and is likely going to contain bugs.  Use at your own risk:

```
/opt/opsrocket/bin/control.sh upgrade HEAD
```

## Logs

OpsRocket writes its logs in a plain text, square-bracket delimited column format, which looks like this:

```

```

The log columns are defined as follows, from left to right:

| Log Column | Description |
|------------|-------------|
| `hires_epoch` | A date/time stamp in high-resolution [Epoch time](https://en.wikipedia.org/wiki/Unix_time). |
| `date` | A human-readable date/time stamp in the format: `YYYY/MM/DD HH:MI:SS` (local server time) |
| `hostname` | The hostname of the server that wrote the log entry (useful for multi-server setups if you merge your logs together). |
| `pid` | The PID (Process ID) of the process that logged the event. |
| `component` | The component name which generated the log entry.  See below for a list of all the components. |
| `category` | The category of the log entry, which will be one of `debug`, `transaction` or `error`. |
| `code` | Debug level (1 to 10), transaction or error code. |
| `msg` | Debug, transaction or error message text. |
| `data` | Additional JSON data, may or may not present. |

The columns are configurable via the [log_columns](#log_columns) property in the `conf/config.json` file:

```js
{
	"log_columns": ["hires_epoch", "date", "hostname", "pid", "component", "category", "code", "msg", "data"]
}
```

Feel free to reorder or remove columns, but don't rename any.  The IDs are special, and match up to keywords in the source code.

By default, logging consists of several different files, each for a specific component of the system.  After starting up OpsRocket, you will find these log files in the [log_dir](#log_dir) directory:

| Log Filename | Description |
|--------------|-------------|
| `OpsRocket.log` | The main component will contain most of the app logic. |
| `Error.log` | The error log will contain all main application errors. |
| `Transaction.log` | The transaction log will contain all main application transactions. |
| `API.log` | The API component log will contain information about incoming HTTP API calls. |
| `Storage.log` | The storage component log will contain information about data reads and writes. |
| `Filesystem.log` | Only applicable if you use the local filesystem storage back-end. |
| `Couchbase.log` | Only applicable if you use the [Couchbase](#couchbase) storage back-end. |
| `S3.log` | Only applicable if you use the [Amazon S3](#amazon-s3) storage back-end. |
| `User.log` | The user component log will contain user related information such as logins and logouts. |
| `WebServer.log` | The web server component log will contain information about HTTP requests and connections. |
| `ML.log` | This log will contain details about the machine learning system, for categorizing posts.  |
| `S3MailIngest.log` |  This log will contain details about the AWS S3 / SES mail ingest system. |
| `crash.log` | If OpsRocket crashed for any reason, you should find a date/time and stack trace in this log. |
| `recovery.log` | If the database suffered an unclean shutdown, this log will contain recovery information (i.e. transaction rollbacks). |
| `install.log` | Contains detailed installation notes from npm, and the build script. |

The [log_filename](#log_filename) configuration property controls this, and by default it is set to the following:

```js
{
	"log_filename": "[component].log",
}
```

This causes the value of the `component` column to dictate the actual log filename.  If you would prefer that everything be logged to a single combo file instead, just change this to a normal string without brackets, such as:

```js
{
	"log_filename": "event.log",
}
```

# S3 Mail Ingest

OpsRocket ingests incoming e-mails from the [AWS Simple Email Service](https://aws.amazon.com/ses/) (SES), specifically the [S3 Action](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-action-s3.html), where mail is dropped into a S3 bucket.  The OpsRocket daemon polls this S3 bucket every minute, and parses the raw MIME files found there (and deletes them).

The configuration for the S3 mail ingest system is under a `S3MailIngest` key.  Example:

```js
"S3MailIngest": {
	"schedule": "minute",
	"base_dir": "mail",
	"key_prefix": "incoming/",
	"api_key": "internal",
	
	"AWS": {
		"accessKeyId": "YOUR_ACCESS_KEY_HERE",
		"secretAccessKey": "YOUR_SECRET_KEY_HERE",
		"region": "us-west-2",
		"correctClockSkew": true,
		"maxRetries": 5,
		"httpOptions": {
			"connectTimeout": 5000,
			"timeout": 5000
		}
	},
	"S3": {
		"params": {
			"Bucket": "YOUR_S3_BUCKET_HERE"
		}
	}
},
```

Here are descriptions of the configuration properties:

| Property Name | Description |
|---------------|-------------|
| `schedule` | The controls the frequency of the polling operation.  Should be set to `minute` to poll every minute.  See [pixl-server maintenance events](https://github.com/jhuckaby/pixl-server#maintenance-events) for details. |
| `base_dir` | This is the base directory where parsed JSON mail messages are stored, for backup purposes.  This is relative to the `/opt/opsrocket` base directory, and is created if it does not exist. |
| `key_prefix` | This is the S3 key prefix for where to look for incoming mail from SES.  This should match your SES S3 action settings in the AWS console. |
| `api_key` | This is the OpsRocket API key to use for posting messages into the database.  This can be `internal` to use the localhost API backdoor. |
| `AWS` | These settings are for the [aws-sdk](https://www.npmjs.com/package/aws-sdk) setup.  Make sure you insert your own `accessKeyId` and `secretAccessKey`. |
| `S3` | These settings are specifically for the S3 API constructor, and should include your bucket name. |

# Machine Learning

OpsRocket utilizes [machine learning](https://en.wikipedia.org/wiki/Machine_learning) to automatically categorize incoming messages.  Currently we are using the [fastText](https://fasttext.cc/) library, however this is subject to change, as we are still evaluating several other options.

The configuration for the ML system is under a `ML` key.  Example:

```js
"ML": {
	"enabled": true,
	"dir": "ml",
	"mode": "suggest",
	"train_schedule": "03:00",
	"train_options": {
		"thread": 4
	}
}
```

Here are descriptions of the configuration properties:

| Property Name | Description |
|---------------|-------------|
| `enabled` | This boolean indicates whether the ML system is active (`true`) or disabled (`false`). |
| `dir` | This is the base directory where the ML training and model files are stored.  This is relative to the `/opt/opsrocket` base directory, and is created if it does not exist. |
| `mode` | This controls the mode, which can either be `suggest` or `active`. |
| `train_schedule` | The sets the schedule for the training operation.  This should run daily, and happen during a period of inactivity on the site, due to potential slowdown.  See [pixl-server maintenance events](https://github.com/jhuckaby/pixl-server#maintenance-events) for details. |
| `train_options` | This object is passed directly to the fastText engine when training.  See [their training docs](https://github.com/loretoparisi/fasttext.js#train) for details. |

When the `mode` property is set to `suggest`, message categorization is not applied automatically.  Instead, administrators will see a suggested set of categories that would be applied.  This information will be shown on the bottom-right corner of all unsorted messages in any standard view.

When the `mode` property is set to `active`, then automatic categorization will take place on any incoming topic, either from a API (Web UI) post, or an incoming mail message.  Only activate this mode when you are sure that the model is fully trained, and most suggestions are what you want.

Training works by essentially dumping the entire database every night, and generating a training file containing all the manually-categorized topics, their category labels and serialized / normalized body text.  The fastText engine then reads the training file and generates a prediction model, for applying to new incoming messages that have yet to be categorized.  The training process repeats nightly.

# Database

OpsRocket uses [pixl-server-unbase](https://github.com/jhuckaby/pixl-server-unbase), which is a database-like system, built on top of [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage).  It is basically a thin wrapper around the [Indexer](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md), with some additional record storage, database management and live search capabilities.

The main idea behind Unbase is to provide a database (or something sort of like one) on top of simple JSON files on disk (or S3 if you are insane).  Both the record data and the indexes are built out of simple JSON documents.  It uses as little memory as possible, at the cost of speed.

The database "schema" (if you can call it that) is as follows:

```js
"Unbase": {
	"indexes": {
		"messages": {
			"default_search_field": "body",
			"fields": [
				{
					"id": "type",
					"source": "/type",
					"master_list": true
				},
				{
					"id": "tags",
					"source": "/tags",
					"master_list": true,
					"default_value": "unsorted"
				},
				{
					"id": "locations",
					"source": "/locations",
					"master_list": true,
					"default_value": "_none_"
				},
				{
					"id": "favorites",
					"source": "/favorites"
				},
				{
					"id": "parent",
					"source": "/parent"
				},
				{
					"id": "date",
					"source": "/date",
					"type": "date"
				},
				{
					"id": "when",
					"source": "/when",
					"type": "date"
				},
				{
					"id": "from",
					"source": "[/from] [/username]",
					"min_word_length": 3,
					"max_word_length": 32,
					"max_words": 10,
					"use_remove_words": false,
					"use_stemmer": false
				},
				{
					"id": "subject",
					"source": "/subject",
					"min_word_length": 3,
					"max_word_length": 32,
					"max_words": 50,
					"use_remove_words": true,
					"use_stemmer": true
				},
				{
					"id": "body",
					"source": "[/subject] [/from] [/body]",
					"min_word_length": 3,
					"max_word_length": 32,
					"max_words": 500,
					"use_remove_words": true,
					"use_stemmer": true
				},
				{
					"id": "replies",
					"source": "/replies",
					"type": "number"
				}
			],
			"sorters": [
				{
					"id": "replies",
					"source": "/replies",
					"type": "number"
				}
			],
			"remove_words": ["the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "I", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", "many", "then", "them", "these", "so", "some", "her", "would", "make", "like", "him", "into", "has", "look", "two", "more", "go", "see", "no", "way", "could", "my", "than", "been", "who", "its", "now", "did", "get", "come", "made"]
		}
	}
}
```

See the [Indexer Configuration](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#configuration) documentation for details on this format.

# API Reference

## JSON REST API

All API calls expect JSON as input (unless they are simple HTTP GETs), and will return JSON as output.  The main API endpoint is:

```
/api/app/NAME/v1
```

Replace `NAME` with the specific API function you are calling (see below for list).  All requests should be HTTP GET or HTTP POST as the API dictates, and should be directed at the OpsRocket server on the correct TCP port (the default is `5522` but is often reconfigured to be `80`).  Example URL:

```
http://myserver.com:5522/api/app/search/v1
```

For web browser access, [JSONP](https://en.wikipedia.org/wiki/JSONP) response style is supported for all API calls, by including a `callback` query parameter.  However, all responses include a `Access-Control-Allow-Origin: *` header, so cross-domain [XHR](https://en.wikipedia.org/wiki/XMLHttpRequest) requests will work as well.

## API Keys

API Keys allow you to register external applications or services to use the REST API.  These can be thought of as special user accounts specifically for applications.  Each API key can be granted a specific set of privileges.

To create an API Key, you must first be an administrator level user.  Login to the OpsRocket UI, proceed to the **API Keys Tab**, and click the "Add API Key..." button.  Fill out the form and click the "Create Key" button at the bottom of the page.

API Keys are randomly generated hexadecimal strings, and are 32 characters in length.  Example:

```
0095f5b664b93304d5f8b1a61df605fb
```

You must include a valid API Key with every API request.  There are three ways to do this: include a `X-API-Key` HTTP request header, an `api_key` query string parameter, or an `api_key` JSON property.

Here is a raw HTTP request showing all three methods of passing the API Key (only one of these is required):

```
GET /api/app/search/v1?api_key=0095f5b664b93304d5f8b1a61df605fb HTTP/1.1
Host: opsrocket.dev
X-API-Key: 0095f5b664b93304d5f8b1a61df605fb
Content-Type: application/json

{"offset": 0, "limit": 50, "api_key": "0095f5b664b93304d5f8b1a61df605fb"}
```

## Standard Response Format

Regardless of the specific API call you requested, all responses will be in JSON format, and include at the very least a `code` property.  This will be set to `0` upon success, or any other value if an error occurred.  In the event of an error, a `description` property will also be included, containing the error message itself.  Individual API calls may include additional properties, but these two are standard fare in all cases.  Example successful response:

```js
{ "code": 0 }
```

Example error response:

```js
{"code": "session", "description": "No Session ID or API Key could be found"}
```

## API Calls

Here is the list of supported API calls:



# Development

OpsRocket runs as a component in the [pixl-server](https://www.github.com/jhuckaby/pixl-server) framework.  It is highly recommended to read and understand that module and its component system before attempting to develop OpsRocket.  The following server components are also used:

| Module Name | Description | License |
|-------------|-------------|---------|
| [pixl-server-api](https://www.github.com/jhuckaby/pixl-server-api) | A JSON API component for the pixl-server framework. | MIT |
| [pixl-server-storage](https://www.github.com/jhuckaby/pixl-server-storage) | A key/value/list storage component for the pixl-server framework. | MIT |
| [pixl-server-unbase](https://www.github.com/jhuckaby/pixl-server-unbase) | A database component for the pixl-server framework. | MIT |
| [pixl-server-user](https://www.github.com/jhuckaby/pixl-server-user) | A basic user login system for the pixl-server framework. | MIT |
| [pixl-server-web](https://www.github.com/jhuckaby/pixl-server-web) | A web server component for the pixl-server framework. | MIT |

In addition, OpsRocket uses the following server-side PixlCore utility modules:

| Module Name | Description | License |
|-------------|-------------|---------|
| [pixl-args](https://www.github.com/jhuckaby/pixl-args) | A simple module for parsing command line arguments. | MIT |
| [pixl-class](https://www.github.com/jhuckaby/pixl-class) | A simple module for creating classes, with inheritance and mixins. | MIT |
| [pixl-config](https://www.github.com/jhuckaby/pixl-config) | A simple JSON configuration loader. | MIT |
| [pixl-logger](https://www.github.com/jhuckaby/pixl-logger) | A simple logging class which generates bracket delimited log columns. | MIT |
| [pixl-mail](https://www.github.com/jhuckaby/pixl-mail) | A very simple class for sending e-mail via SMTP. | MIT |
| [pixl-perf](https://www.github.com/jhuckaby/pixl-perf) | A simple, high precision performance tracking system. | MIT |
| [pixl-request](https://www.github.com/jhuckaby/pixl-request) | A very simple module for making HTTP requests. | MIT |
| [pixl-tools](https://www.github.com/jhuckaby/pixl-tools) | A set of miscellaneous utility functions for Node.js. | MIT |

## Installing Dev Tools

For Debian (Ubuntu) OSes:

```
apt-get install build-essential
```

For RedHat (Fedora / CentOS):

```
yum install gcc-c++ make
```

For Mac OS X, download [Apple's Xcode](https://developer.apple.com/xcode/download/), and then install the [command-line tools](https://developer.apple.com/downloads/).

## Manual Installation

Here is how you can download the very latest OpsRocket dev build and install it manually (may contain bugs!):

```
git clone https://github.com/pixlcore/opsrocket.git
cd opsrocket
npm install
node bin/build.js dev
```

This will keep all JavaScript and CSS unobfuscated (original source served as separate files).

I highly recommend placing the following `.gitignore` file at the base of the project, if you plan on committing changes and sending pull requests:

```
.gitignore
/node_modules
/work
/logs
/data
/conf
/ml
htdocs/index.html
htdocs/js/external/*
htdocs/js/common
htdocs/fonts/*
htdocs/css/font*
htdocs/css/mat*
htdocs/css/base.css
htdocs/css/normalize.css
```

## Starting in Debug Mode

To start OpsRocket in debug mode, issue the following command:

```
./bin/control.sh debug
```

This will launch the service without forking a daemon process, and echo the entire debug log contents to the console.  This is great for debugging server-side issues.  Beware of file permissions if you run as a non-root user.  Hit Ctrl-C to shut down the service when in this mode.

# License

The MIT License (MIT)

Copyright (c) 2021 Joseph Huckaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
