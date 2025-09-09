# Overview

This document details all of the data structures used in xyOps.

# Alert

An alert definition is a trigger that specifies conditions under which the alert should fire, and what actions should take place.  The alert expression can use any server data values to determine when to fire, for e.g. `cpu.currentLoad > 80`.  Here is an example alert in JSON format:

```json
{
	"id": "load_avg_high",
	"title": "High CPU Load",
	"expression": "monitors.load_avg >= (cpu.cores + 1)",
	"message": "CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)",
	"groups": [],
	"email": "",
	"web_hook": "",
	"monitor_id": "load_avg",
	"enabled": true,
	"samples": 1,
	"notes": "",
	"username": "admin",
	"modified": 1434125333,
	"created": 1434125333
}
```

## Alert.id

A unique alphanumeric ID for the alert.

## Alert.title

A visual title for the alert, displayed in the UI, and in notifications.

## Alert.enabled

A boolean flag indicating if the alert is enabled or not.

## Alert.icon

An optional icon ID for the alert, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Alert.expression

The expression that defines the conditions under which the alert should fire.  This can use any server data values, for example: `cpu.currentLoad > 80`.  The format of the expression is JavaScript.

## Alert.message

The message to include in the alert notification. This can include mustache placeholders for inserting dynamic content.  Example: `CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)`.  See [Monitoring](monitoring.md) for more on this syntax.

## Alert.groups

The server groups where the alert is active.  Leave blank to apply to all groups.

## Alert.email

An optional list of email addresses to notify when the alert fires.  This can be a single address, or a comma-separated list of multiple addresses.
	
## Alert.web_hook

Optionally fire a web hook for the alert.  Specify the [WebHook.id](#webhook-id) here.

## Alert.monitor_id

Optionally link the alert to a monitor given its [ID](#monitor-id).  This will show the alert tag on top of the specified monitor graph.

## Alert.samples

The number of consecutive times the expression must evaluate to `true` before the alert fires.  Similarly, this is also the alert "cooldown" (the expression must evaluate to `false` the same number of times before the alert is considered inactive).

## Alert.notes

Optional notes or comments about the alert.

## Alert.username

The user or API Key who created the alert.
	
## Alert.modified

The Epoch timestamp when the alert was last modified.

## Alert.created

The Epoch timestamp when the alert was created.

## Alert.revision

An internal revision number for the alert, incremented with each change.

# APIKey

An API Key is a unique identifier used to authenticate requests.  Here is an API key in JSON format:

```json
{
	"key": "rPEu2GRpK3TPgVnmSFVPFTT9",
	"active": 1,
	"privileges": {
		"create_events": 1,
		"edit_events": 1,
		"run_jobs": 1,
		"tag_jobs": 1,
		"comment_jobs": 1
	},
	"roles": [],
	"title": "Test App",
	"description": "For testing.",
	"id": "kme0thuforv",
	"username": "admin",
	"modified": 1754536104,
	"created": 1754536104,
	"revision": 1
}
```

## APIKey.id

A unique alphanumeric ID for the API Key.

## APIKey.key

The actual key used to authenticate requests.

## APIKey.title

A visual title for the API Key, displayed in the UI.

## APIKey.description

A brief description of the API Key and its purpose.

## APIKey.active

A boolean flag indicating if the API Key is active or disabled.

## APIKey.username

The user or API Key who created the API Key.

## APIKey.modified

The Epoch timestamp when the API Key was last modified.

## APIKey.created

The Epoch timestamp when the API Key was created.

## APIKey.revision

An internal revision number for the API Key, incremented with each change.

## APIKey.privileges

The privileges assigned to the API Key, specified as object keys.  See [Privileges](#privileges) for details.

## APIKey.roles

The roles assigned to the API Key, specified as an array.  Roles can auto-assign privileges.  See [Role](#role) for details.

# Bucket

A storage bucket is a logical container for storing files, for use in events and workflows. Buckets can hold an arbitrary number of files, and JSON data.  Here is a bucket in JSON format:

```json
{
	"id": "bme4wi6pg35",
	"title": "The Void",
	"enabled": true,
	"icon": "",
	"notes": "",
	"username": "admin",
	"modified": 1754783050,
	"created": 1754783023,
	"revision": 2
}
```

Note that the bucket user data and files are stored separately, outside of the bucket object.

## Bucket.id

A unique alphanumeric ID for the bucket.

## Bucket.title

A visual title for the bucket, displayed in the UI.

## Bucket.enabled

A boolean flag indicating if the bucket is enabled or not.

## Bucket.icon

An optional icon ID for the bucket, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Bucket.notes

Optional notes or comments about the bucket.

## Bucket.username

The user or API Key who created the bucket.

## Bucket.modified

The Epoch timestamp when the bucket was last modified.

## Bucket.created

The Epoch timestamp when the bucket was created.

## Bucket.revision

An internal revision number for the bucket, incremented with each change.

## Bucket.data

The user data stored in the bucket.

# Category

A category is a way to group related events together.  Each event can belong to a single category.  Here is an example category in JSON format:

```json
{
	"id": "general",
	"title": "General",
	"enabled": true,
	"sort_order": 0,
	"username": "admin",
	"modified": 1754365754,
	"created": 1754365754,
	"notes": "For events that don't fit anywhere else.",
	"color": "plain",
	"icon": "",
	"limits": [],
	"actions": [],
	"revision": 1
}
```

## Category.id

A unique alphanumeric ID for the category.

## Category.enabled

A boolean flag indicating if the category is enabled or not.

## Category.title

A visual title for the category, displayed in the UI.

## Category.icon

An optional icon ID for the category, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Category.color

A visual color for the category, displayed in the UI for all events assigned to the category.  The available color values are: `plain`,  `red`, `green`, `blue`, `skyblue`, `yellow`, `purple`, and `orange`.

## Category.notes

Optional notes or comments about the category.

## Category.username

The user or API Key who created the category.

## Category.modified

The Epoch timestamp when the category was last modified.

## Category.created

The Epoch timestamp when the category was created.

## Category.revision

An internal revision number for the category, incremented with each change.

## Category.sort_order

An internal sort order for the category, used to determine its position in lists.

## Category.actions

An array of [Action](#action) items to invoke at various points during job runs.  These are automatically applied to all events assigned to the category.  Events may define additional actions which are appended to this list at job run time.

## Category.limits

An array of [Limit](#limit) items to apply to running jobs, e.g. CPU and memory limits.  In the UI these are referred to as "Resource Limits".  These are automatically applied to all events assigned to the category as defaults.  Events may define additional limits *or override category limits* (matched by type).

# Channel

A notification channel is a way to send notifications to a group of users, and trigger other system actions such as web hooks, when certain event actions occur.  Here is an example channel in JSON format:

```json
{
	"id": "sev1",
	"title": "Severity 1",
	"enabled": true,
	"username": "admin",
	"modified": 1754603045,
	"created": 1754365754,
	"notes": "For major events that require everyone's attention right away.",
	"users": [
		"admin"
	],
	"email": "",
	"web_hook": "",
	"run_event": "",
	"sound": "attention-3.mp3",
	"icon": "",
	"shell_exec": "",
	"revision": 3,
	"max_per_day": 0
}
```

## Channel.id

A unique alphanumeric ID for the channel.

## Channel.title

A visual title for the channel, displayed in the UI.

## Channel.enabled

A boolean flag indicating if the channel is enabled or not.

## Channel.icon

An optional icon ID for the channel, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Channel.users

An array of usernames who are subscribed to the channel, and will receive email and UI notifications for channel events.

## Channel.email

An optional email address (or a comma-separated list) to which notifications for channel events will be sent.

## Channel.web_hook

An optional [WebHook.id](#webhook-id) to which notifications for channel events will be sent.

## Channel.run_event

An optional [Event.id](#event-id) to run when the channel is triggered.

## Channel.sound

An optional sound effect to play to all subscribed users when the channel is triggered.  This should be a filename with a `.mp3` file extension.  See [Sound Effects](https://github.com/pixlcore/xyops/htdocs/sounds/) for the list of available sound effects to choose from.

## Channel.shell_exec

An optional shell command to execute when the channel is triggered.

## Channel.max_per_day

An optional maximum number of times the channel can be triggered per day.

## Channel.notes

Optional notes or comments about the channel.

## Channel.revision

An internal revision number for the channel, incremented with each change.

# Event

An event is an item on the schedule which launches [Jobs](#job).  It may or may not be scheduled to run at specific times (i.e. it may be on-demand only).  Here is an example event in JSON format:

```json
{
	"id": "event100",
	"title": "Diverse heuristic complexity",
	"enabled": true,
	"username": "admin",
	"modified": 1653843747,
	"created": 1651348186,
	"category": "cat9",
	"targets": [
		"main"
	],
	"notes": "This is a test event.",
	"limits": [
		{
			"type": "time",
			"enabled": true,
			"duration": 3600
		}
	],
	"actions": [
		{
			"enabled": true,
			"condition": "error",
			"type": "email",
			"email": "admin@localhost"
		}
	],
	"plugin": "shellplug",
	"params": {
		"script": "#!/bin/bash\n\nsleep 30;\necho HELLO;\n",
		"annotate": false,
		"json": false
	},
	"triggers": [
		{
			"type": "schedule",
			"enabled": true,
			"hours": [
				19
			],
			"minutes": [
				6
			]
		}
	],
	"icon": "",
	"tags": [
		"important"
	],
	"algo": "random"
}
```

Events have the following properties:

## Event.id

A unique alphanumeric ID for the event.

## Event.title

A visual title for the event, displayed in the UI.

## Event.enabled

A boolean flag indicating if the event is enabled (can run jobs) or disabled.

## Event.icon

An optional icon ID for the event, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Event.category

The [Category.id](#category-id) of the category to which the event belongs.

## Event.plugin

The [Plugin.id](#plugin-id) of the plugin which will handle running jobs.

## Event.params

An object containing key/value pairs which is passed to the job process.  These are typically defined by the [Plugin](#plugin) and populated in the UI.

## Event.tags

An array of [Tag](#tag) IDs which can be used to search for historical jobs.  The running job may also modify this list.

## Event.targets

An array of server or group targets to run the event.  Each item of the array is a string, and can can either be a [Server.id](#server-id) or a [Group.id](#group-id).

## Event.algo

When multiple servers are in the [Event.targets](#event-targets) array, xyOps uses a select algorithm to select a server to run the job.  The available algorithms are:

| Algorithm | Notes |
|-----------|-------|
| `random` | Randomly pick a server from the list. |
| `round_robin` | Pick each server in sequence, then repeat. |
| `least_cpu` | Pick the server with the least CPU usage. |
| `least_mem` | Pick the server with the least memory usage. |
| `prefer_first` | Prefer the first server when alphabetically sorted by hostname. |
| `prefer_last` | Prefer the last server when alphabetically sorted by hostname. |

## Event.notes

Optional notes for the event, which are included in email notifications for event actions.

## Event.actions

An array of [Action](#action) items to invoke at various points during job runs.

The event's [Category](#category) can define additional actions which are appended to this list at job run time.

## Event.limits

An array of [Limit](#limit) items to apply to running jobs, e.g. CPU and memory limits.  In the UI these are referred to as "Resource Limits".

The event's [Category](#category) can define limits which act as defaults to the event limits.

## Event.triggers

An array of [Trigger](#trigger) items to schedule future job runs and set rules, e.g. blackout dates.

## Event.workflow

If the event is a workflow, this contains detailed information about the nodes and connections.  See the [Workflow](#workflow) section for details.

## Event.revision

An internal revision number for the event, incremented with each change.

# Group

A server group is a collection of servers, usually auto-matched by hostname, but you can also manually assign servers to groups.  Here is an example group in JSON format:

```json
{
	"id": "main",
	"title": "Main Group",
	"hostname_match": ".+",
	"sort_order": 0,
	"username": "admin",
	"modified": 1754365754,
	"created": 1754365754,
	"revision": 1
}
```

## Group.id

A unique alphanumeric ID for the group.

## Group.title

A visual name for the group, displayed in the UI.

## Group.icon

An optional icon ID for the group, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Group.hostname_match

A hostname pattern used to match servers to the group.  This should be a [regular expression](https://en.wikipedia.org/wiki/Regular_expression) wrapped in a string.

## Group.alert_email

An email address to send alerts for the group.  While alerts themselves can define a set of email addresses, this allows you to set a "group notification" email as well.

## Group.alert_web_hook

A [WebHook.id](#webhook-id) to fire for alerts in the group.  While alerts themselves can define a web hook, this allows you to set a "group notification" web hook as well.

## Group.mute_alerts

A boolean flag indicating whether alerts are muted for the group.

## Group.notes

Optional notes for the group, which are included in email notifications for group actions.

## Group.revision

An internal revision number for the group, incremented with each change.

## Group.sort_order

An integer value representing the sort order of the group.  Lower values are sorted first.

# Job

A job is a running (or previously ran) instance of an event.  The job structure has nearly all the same properties as [Event](#event) with these differences:

| Property Name | Note |
|---------------|--------|
| `id` | Replaced with [Job.id](#job-id). |
| `event` | The [Event.id](#event-id]) of the event which spawned the job. |
| `title` | Removed from job structure when event is copied. |
| `enabled` | Removed from job structure when event is copied. |
| `created` | Removed from job structure when event is copied. |
| `modified` | Removed from job structure when event is copied. |
| `triggers` | Removed from job structure when event is copied. |

And these additions:

## Job.id

An auto-generated, unique, alphanumeric ID for the job, which will always start with a `j`.

## Job.type

An optional string representing a custom job type.  Values include:

| Job Type | Note | 
|----------|------|
| `workflow` | Job is a top-level workflow control job, which will spawn sub-jobs. | 
| `adhoc` | Job is running as an ad-hoc under a workflow, with no event attached. | 

## Job.event

The [Event.id](#event-id) of the event which spawned the job.

## Job.server

Which [Server.id](#server-id) that was chosen to run the job, based on the [Event.algo](#event-algo).

## Job.groups

When a server is chosen, that server's assigned groups are copied into the job.

## Job.command

Which executable to run for the job.  This cannot be set -- it is copied from the [Plugin](#plugin).

## Job.uid

Which UID (User ID) to run the job process as.  This cannot be set -- it is copied from the [Plugin](#plugin).

## Job.cwd

Which CWD (Current Working Directory) run the job process under.  This cannot be set -- it is copied from the [Plugin](#plugin).

## Job.env

Custom job environment variables to inject into the executable when spawning it.  If unset, this is copied from the `job_env` master configuration property.

## Job.state

Specifies which state the job is currently in.  Here is a list of all the possible states:

| Job State | Description |
|-----------|-------------|
| `queued` | Job is queued and waiting for an open slot to move to `ready` state. |
| `start_delay` | Job has a custom starting delay.  The timestamp at which the delay expires should be in [Job.until](#job-until). |
| `retry_delay` | Job is currently in a retry delay.  The timestamp at which the delay expires should be in [Job.until](#job-until). |
| `ready` | Job is ready to start. |
| `active` | Job is currently active (running). |
| `finishing` | Job is finishing (uploading logs and/or files). |
| `complete` | Job is complete. |

## Job.started

The timestamp at which the job was started (Epoch seconds).  Specifically this is when the job was moved to a `ready` state.

## Job.updated

The timestamp at which the job was last updated (Epoch seconds).

## Job.completed

The timestamp at which the job was completed (Epoch seconds).

## Job.elapsed

The duration of the job run in seconds (calculated as the difference between [Job.started](#job-started) and [Job.completed](#job-completed)).  This does not include time spent in queue or start delay.

## Job.code

When a job completes, the `code` denotes the result.  Zero (`0`) means success, any other value means the job failed.  You can use this to specify your own internal error code, or just specify `1` for a generic error.  Any number or string is acceptable.  There are a few special values that xyOps recognizes:

| Job Code | Meaning |
|----------|---------|
| `warning` | This denotes that a job failed by only with a "warning", not a full error. |
| `critical` | This denotes that the job failed critically, and needs immediate attention. |
| `abort` | This denotes that the job was manually aborted, either by a user or an API call. |

## Job.description

When a job fails, the `description` property can contain a summary of the error message.

## Job.remote

Set to `true` when the job has an active remote server connection (job request was sent to remote server).

## Job.until

Specifies the timestamp at which point the job can be moved into a ready state.  This property is used by the `start_delay` and `retry_delay` states.

## Job.progress

User-populated progress indicator, should be a floating point number between `0.0` to `1.0`.  Both extremes (`0.0` and `1.0`) display as "indeterminate" in the UI.

## Job.reconnected

An Epoch timestamp of when the primary server socket was reconnected, during a job run.  The presence of this property indicates that the worker server lost its connection to the primary during the job, and then reconnected later.

## Job.log_file

An optional log file for the user to write/append to, during a job.  This is a legacy carryover from Cronicle.  If present at the completion of a job, the file will be uploaded as an attachment.

## Job.log_file_size

The size of the actual job output, in bytes, and updated continuously as job runs.  This is the STDOUT and STDERR captured from the job process, and is not associated with the legacy [Job.log_file](#job-log_file) property.

## Job.activity

An array of meta log entries for the job.

## Job.source

A string ID indicating what spawned the job.  This will be one of:

| Source | Description |
|--------|-------------|
| `scheduler` | Job was spawned normally via the scheduler. |
| `plugin` | Job was spawned from a Scheduler Plugin. |
| `key` | Job was spawned via a HTTP request to the `run_event` API using an API Key.  There will be an additional property named `key` containing the internal API Key ID (non-secret). |
| `user` | Job was spawned manually via user request in the UI.  There will be an additional property named `username` containing the username of the user who initiated the action. |
| `action` | Job was spawned by a custom job action (i.e. start, complete, success or fail action condition).  [Job.parent](#job-parent) will also be present in this case. |
| `alert` | Job was spawned by an alert notification from the server monitoring system. |
| `workflow` | Job was spawned as part of a workflow sequence. |

## Job.parent

When the job was launched from another job (custom action or workflow step), this will be a reference to the parent job which spawned the current job.

## Job.input

When another job passes data to the current job, an `input` object is populated.  The object has the following properties:

| Property Name | Description |
|---------------|-------------|
| `data` | A copy of the data object from the parent job, if one was populated (user-supplied). |
| `files` | A copy of the files uploaded from the parent job, if applicable. |

## Job.retried

Boolean, will be set to `true` when a job was retried, and another job exists in the same set.

## Job.retry_count

For retried jobs, a retry counter is present that counts upwards for each new retry.  It will not exceed the retry [limit](#limit) set in the event.

## Job.retry_prev

When a job is a retry, this property will contain the [Job.id](#job-id) of the previous attempt.

## Job.jobs

When a job launches other jobs, either by retry or action condition, the newly launched jobs will be added to a `jobs` array in the parent (source) job.  Each item in the array is an object with `id` and `reason` properties.  The reason can be one of `action` or `retry`.

## Job.cpu

This will contain information about the job process CPU usage.

## Job.mem

This will contain information about the job process memory usage.

## Job.disk

This will contain information about the job process disk usage.

## Job.net

This will contain information about the job process network usage (open TCP connections).

## Job.data

This is a place where the job can store arbitrary data, which will be passed to the next job (if part of a workflow, or launched via an action).

## Job.files

This will contain information about all uploaded files for the job.  While the job is running, the user can populate this array to attach files for the job.  Each item in the array can be a simple string (file path or glob), a sub-array of file path and filename, a sub-array of file path, filename, and a `true` boolean to delete the file after uploading, or an object with the following properties:

| Property Name | Description |
|---------------|-------------|
| `path` | Path to the file on disk, or a glob matching multiple files. |
| `filename` | Custom destination filename to use when uploading.  Do not combine with a glob path. |
| `delete` | Set this to `true` to delete the file(s) after uploading. |

Once the job is complete, the files will be uploaded and the array will be recreated as an array of objects, one per file, with each object containing the following properties:

| Property Name | Description |
|---------------|-------------|
| `path` | The partial path to the file in storage.  Combine this with the xyOps master server hostname and port number (if applicable) to construct a full URL to the file. |
| `size` | The size of the file in bytes. |
| `job` | The [Job.id](#job-id) associated with the file. |
| `server` | The server ID of the server which uploaded the file. |

## Job.update_event

This allows the user job code to update the event at time of completion.  For example, here is how you would disable the event:

```sh
echo '{ "xy":true, "update_event": { "enabled": false } }'
```

## Job.push

A system by which the user code can push new [actions](#action) and [limits](#limit) onto the job while it is still running.  For example:

```sh
echo '{ "xy":true, "push": { "actions": [ { "condition":"success", "type":"email", "email":"you@yourdomain.com" } ] } }'
```

## Job.procs

An array of process IDs (PIDs) and additional process information that are associated with the job.

## Job.conns

An array of network connections (TCP/UDP) and additional metadata that are associated with the job.

## Job.timelines

An array of timeline events that occurred during the job's execution.  This data is used to plot the CPU/Mem/Disk/Net graphs for the job.

## Job.flags

An internal object used to track CPU/Mem thresholds.

## Job.table

User writable property for providing a table of data.  Should be specified as an object with `title`, `rows`, `cols` and `caption` properties.  The `title` and `caption` may be omitted.

## Job.html

User writable property for providing a HTML-formatted report.  Should be specified as an object with `title`, `content` and `caption` properties.  The `title` and `caption` may be omitted.

## Job.markdown

User writable property for providing a markdown-formatted report.  Should be specified as an object with `title`, `content` and `caption` properties.  The `title` and `caption` may be omitted.  This gets converted to HTML on the back-end.

## Job.text

User writable property for providing a text-formatted report.  Should be specified as an object with `title`, `content` and `caption` properties.  The `title` and `caption` may be omitted.  This gets converted to HTML using a `<pre>` element.

## Job.stype

This is set to a string when a job is launched via a special scheduler trigger like "single" (single-shot) or "interval".  Only used for UI hinting.

## Job.splugin

This is set to a Plugin ID by the scheduler when a job was launched from a Plugin based trigger configuration.  Only used for UI hinting.

## Job.label

User writable property for providing a visual label for the Job.  Should be specified as a string, and will be displayed alongside the Job ID on completion screens and history lists.

## Job.test

This is set to `true` when the job was fired from an event test.  This is used to override the event enabled check, and add hints to the UI.

# Monitor

A monitor keeps track on a specific numeric server metric.  These are graphed in the UI so you can see trends over time, and you can also point alerts at them.  Here is an example monitor in JSON format:

```json
{
	"id": "cpu_usage",
	"title": "CPU Usage %",
	"source": "cpu.currentLoad",
	"data_type": "float",
	"suffix": "%",
	"groups": [],
	"display": true,
	"min_vert_scale": 100,
	"sort_order": 1,
	"username": "admin",
	"modified": 1754365754,
	"created": 1754365754,
	"revision": 1
}
```

## Monitor.id

A unique alphanumeric ID for the monitor.

## Monitor.title

A visual title for the monitor, displayed in the UI.

## Monitor.display

A boolean flag indicating if the monitor is displayed in the UI or not.

## Monitor.icon

An optional icon ID for the monitor, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Monitor.groups

An array of server group IDs that the monitor will keep track of.

## Monitor.source

An expression that points to the data source for the monitor's value.  This can point to any server data value, for example: `cpu.currentLoad`.  The format of the expression is JavaScript.

## Monitor.data_match

If the monitor source points at a text string, you can supply a regular expression in this field to pull out a single numerical data value from the text.  This is commonly used with custom commands (Monitor Plugins).

## Monitor.data_type

The data type of the monitor's value.  This can be one of: `integer`, `float`, `bytes`, `seconds`, or `milliseconds`.

## Monitor.min_vert_scale

This allows you to set the minimum vertical scale (range) in the visual charts for the monitor.  For example, monitors that show a percentage (i.e. CPU usage) might want a minimum vertical scale of `100`.

## Monitor.suffix

Optionally show a suffix for the monitor's value.  This can be useful for indicating units (e.g. `%`, `MB`, `ms`, etc.).

## Monitor.delta

When set to true, this will treat the monitor's value as a delta (i.e. the change in value over time) rather than an absolute value.  This is useful for server metrics that are measured as absolute counters, such as Linux network traffic or disk I/O.

## Monitor.divide_by_delta

When set, this will divide the monitor's value by the time duration between samples before displaying it.  This is useful for converting absolute values into rates (e.g. bytes per second).

## Monitor.delta_min_value

When set, this will specify the minimum value for the monitor's computed delta. This is useful for preventing a delta monitor from showing a huge negative spike due to a brief drop in the absolute monitored value (such as when a server is rebooted, or resets its absolute counter).

This should be set to `false` for disabled, or a any valid number to enable it, including `0`.

## Monitor.notes

Optional notes or comments about the monitor's purpose or configuration.

## Monitor.revision

An internal revision number for the monitor, incremented with each change.

## Monitor.sort_order

An integer value representing the sort order of the monitor.  Lower values are sorted first.

# Plugin

Plugins are used to extend xyOps in a variety of ways, including custom event actions, server monitors, and schedule extensions.  For more details see [Plugins](plugins.md).  Here is an example plugin in JSON format:

```json
{
	"id": "shellplug",
	"title": "Shell Script",
	"enabled": 1,
	"command": "[shell-plugin]",
	"username": "admin",
	"type": "event",
	"modified": 1754365754,
	"created": 1754365754,
	"params": [
		{
			"id": "script",
			"type": "code",
			"title": "Script Source",
			"value": "#!/bin/sh\n\n# Enter your shell script code here",
			"locked": true
		},
		{
			"id": "annotate",
			"type": "checkbox",
			"title": "Add Date/Time Stamps to Log",
			"value": false
		},
		{
			"id": "json",
			"type": "checkbox",
			"title": "Interpret JSON in Output",
			"value": false
		}
	],
	"revision": 1
}
```

## Plugin.id

A unique alphanumeric ID for the plugin.

## Plugin.title

A visual title for the plugin, displayed in the UI.

## Plugin.enabled

A boolean flag indicating if the plugin is enabled or not.

## Plugin.icon

An optional icon ID for the plugin, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Plugin.type

The type of the plugin, which determines its behavior and capabilities. Supported types include `event`, `monitor`, `action` and `scheduler`.

## Plugin.command

Enter the filesystem path to your executable, including any command-line arguments you require.  This can be an interpreter like `/bin/sh` or `/usr/bin/python`, or your own custom binary.  Do not include any pipes or redirects here.

## Plugin.script

The script to execute for the plugin. This can be a shell command, a Python script, or any other executable.  This is passed to the [Plugin.command](#plugin-command) (via a temp file) when the Plugin is launched.

## Plugin.params

A set of custom parameters to pass to the plugin when it is executed (for non-monitor Plugins only).  These are passed to the Plugin as JSON via STDIN, as well as upper-case environment variables.

## Plugin.groups

For monitor plugins only, this defines the server groups that the plugin will run on every minute, to gather metrics.

## Plugin.format

For monitor plugins only, this defines the output format that the Plugin generates.  Supported formats are `text`, `json` and `xml`.

## Plugin.uid

This is the UID (user account) to run the plugin under.  The UID may be either numerical or a string ('root', 'www', etc.).

## Plugin.gid

This is the GID (group account) to run the plugin under.  The GID may be either numerical or a string ('wheel', 'admin', etc.).

## Plugin.notes

Optional notes or comments about the plugin's purpose or configuration.

## Plugin.revision

An internal revision number for the plugin, incremented with each change.

# Role

A user role is a set of privileges assigned to a user within the system.  A user may be assigned multiple roles, and all of the role privileges are merged and passed to the user.  A role may also include category and/or group restrictions, which are also applied to the assigned users.  Here is an example role in JSON format:

```json
{
	"id": "all",
	"title": "All Users",
	"enabled": true,
	"username": "admin",
	"modified": 1434125333,
	"created": 1434125333,
	"notes": "A base set of privileges for all users to enjoy.",
	"icon": "",
	"categories": [],
	"groups": [],
	"privileges": {
		"create_events": true,
		"edit_events": true,
		"run_jobs": true,
		"tag_jobs": true,
		"comment_jobs": true
	}
}
```

## Role.id

A unique alphanumeric ID for the role.

## Role.title

A visual title for the role, displayed in the UI.

## Role.enabled

A boolean flag indicating if the role is enabled or not.

## Role.icon

An optional icon ID for the role, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Role.privileges

A list of privileges assigned to the role.  Each privilege is represented as a key-value pair, where the key is the privilege name and the value is unused.  See [Privileges](privileges.md) for more information.

## Role.categories

A list of categories that the role is allowed to access.

## Role.groups

A list of groups that the role is allowed to access.

## Role.notes

Optional notes or comments about the role's purpose or configuration.

# Server

A server is a physical or virtual machine that connects to the master xyOps server, provides metrics for monitoring, and can execute jobs.  The server object represents a server instance within the xyOps ecosystem.  Here is an example server in JSON format:

```json
{
	"autoGroup": true,
	"created": 1754365804,
	"enabled": true,
	"groups": [
		"main"
	],
	"hostname": "centos-9-arm",
	"id": "sorbstack01",
	"info": {
		"arch": "arm64",
		"booted": 1754854901.82,
		"cpu": {
			"brand": "",
			"cache": {
				"l1d": "",
				"l1i": "",
				"l2": "",
				"l3": ""
			},
			"combo": "Apple",
			"cores": 10,
			"efficiencyCores": 0,
			"family": "",
			"flags": "fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb dcpodp flagm2 frint",
			"governor": "performance",
			"manufacturer": "unknown",
			"model": "0",
			"performanceCores": 10,
			"physicalCores": 10,
			"processors": 1,
			"revision": "",
			"socket": "",
			"speed": 2,
			"speedMax": 2,
			"speedMin": 2,
			"stepping": "0x0",
			"vendor": "Apple",
			"virtualization": false,
			"voltage": ""
		},
		"memory": {
			"active": 651071488,
			"available": 16159313920,
			"buffcache": 199348224,
			"buffers": 28672,
			"cached": 131424256,
			"dirty": 0,
			"free": 16237981696,
			"slab": 67895296,
			"swapfree": 17884119040,
			"swaptotal": 17884119040,
			"swapused": 0,
			"total": 16810385408,
			"used": 572403712,
			"writeback": 0
		},
		"node": "18.14.2",
		"os": {
			"arch": "arm64",
			"build": "",
			"codename": "",
			"codepage": "UTF-8",
			"distro": "CentOS Stream",
			"fqdn": "centos-9-arm",
			"hostname": "centos-9-arm",
			"kernel": "6.14.10-orbstack-00291-g1b252bd3edea",
			"logofile": "centos",
			"platform": "Linux",
			"release": "9",
			"serial": "a7adc277eb8040f7a6f549c9261f9efe",
			"servicepack": "",
			"uefi": false
		},
		"platform": "linux",
		"release": "6.14.10-orbstack-00291-g1b252bd3edea",
		"satellite": "0.0.21",
		"virt": {
			"vendor": "OrbStack"
		}
	},
	"ip": "::ffff:10.1.10.241",
	"keywords": "centos-9-arm,::ffff:10,1,10,241,main,Linux,CentOS Stream,9,arm64,unknown,unknown,OrbStack,unknown,unknown,unknown",
	"modified": 1754872218,
	"socket_id": "wsme6crecj2o"
}
```

## Server.id

A unique alphanumeric identifier for the server, automatically assigned at first join.

## Server.hostname

The hostname of the server, used for displaying in the UI, and possibly for automatically assigning to groups.

## Server.ip

The IP address of the server (if the server has multiple network interfaces, this is the IP that was used to connect to the master server).

## Server.title

An optional, user-defined title for the server, used for display purposes in the UI.

## Server.icon

An optional icon ID for the server, displayed in the UI. Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Server.autoGroup

A boolean flag indicating if the server should be automatically assigned to groups based on its hostname.

## Server.created

The UNIX timestamp (in seconds) when the server first joined the cluster.

## Server.modified

The UNIX timestamp (in seconds) when the server was last modified.

## Server.groups

A list of groups that the server is a member of.

## Server.enabled

A boolean flag indicating if the server is enabled or not.  Enabled servers will be chosen to run jobs, disabled servers will not.

## Server.keywords

A list of keywords associated with the server, used for search and filtering.

## Server.socket_id

The internal identifier for the server's socket connection.

## Server.info

Additional information about the server, such as its operating system, architecture, and other relevant details, used primarily in the UI.

# Tag

A tag is a user-defined label that can be assigned to jobs for the purpose of organization, categorization, and searchability.  Here is an example tag in JSON format:

```json
{ 
	"id": "important", 
	"title": "Important", 
	"icon": "alert-rhombus", 
	"username": "admin", 
	"modified": 1611173740, 
	"created": 1611173740 
}
```

## Tag.id

A unique identifier for the tag.

## Tag.title

The display title for the tag.

## Tag.icon

An optional icon ID for the tag, displayed in the UI. Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## Tag.username

The username of the user who created the tag.

## Tag.created

The UNIX timestamp (in seconds) when the tag was created.

## Tag.modified

The UNIX timestamp (in seconds) when the tag was last modified.

# User

A user account is a representation of an individual user within the system.  The user object contains basic information about the user account, their roles & privileges, as well as their UI preferences.  Here is an example user in JSON format:

```json
{
	"active": 1,
	"categories": [
		"came55y3uupq",
		"came65s9ttj4"
	],
	"color_acc": false,
	"contrast": "auto",
	"created": 1754798286,
	"effects": true,
	"email": "blob.schuurman@example.com",
	"full_name": "Blob Schuurman",
	"groups": [],
	"hour_cycle": "h12",
	"icon": "",
	"language": "",
	"modified": 1755396841,
	"motion": "auto",
	"num_format": "",
	"page_info": true,
	"password": "$2a$10$gB1MOjFZErSRJFI0nYtw/OH9DIJ1LAj6EsEIizSVfSkwclh7oKjJi",
	"privacy_mode": false,
	"privileges": {
		"comment_jobs": 1,
		"create_events": 1,
		"edit_events": 1,
		"run_jobs": 1,
		"tag_jobs": 1
	},
	"region": "",
	"roles": [],
	"salt": "a9e7ee380e24485c26e98e8fe8887b9c572405c6b9932b2f93d6384e150dfb15",
	"searches": [
		{
			"icon": "timer-outline",
			"name": "All Completed",
			"loc": "Search"
		},
		{
			"icon": "check-circle-outline",
			"name": "Successes",
			"loc": "Search?result=success"
		},
		{
			"icon": "alert-decagram-outline",
			"name": "Errors",
			"loc": "Search?result=error"
		},
		{
			"icon": "alert-outline",
			"name": "Warnings",
			"loc": "Search?result=warning"
		},
		{
			"icon": "fire-alert",
			"name": "Criticals",
			"loc": "Search?result=critical"
		}
	],
	"timezone": "",
	"username": "bluetiger469",
	"volume": 7
}
```

## User.username

The username of the user.  Allowed characters are alphanumerics, underscores, periods and dashes.  If the username was automatically generated from an email address (i.e. via SSO), characters outside the supported set are converted to underscores.

## User.password

The hashed password of the user, using salted [bcrypt](https://en.wikipedia.org/wiki/Bcrypt).  The user's plaintext password is **never** stored.

## User.salt

A unique salt value used for hashing the user's password.

## User.full_name

The full name of the user, used for display purposes.

## User.email

The email address of the user.

## User.icon

An optional icon ID for the user, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## User.active

A boolean flag indicating if the user account is active or disabled.

## User.created

The UNIX timestamp (in seconds) when the user was created.

## User.modified

The UNIX timestamp (in seconds) when the user was last modified.

## User.language

The preferred language (locale) of the user, e.g. `en-US`.  If not set, will be auto-detected by the browser.

## User.region

The geographical region of the user, e.g. `US`, `GB`, etc.  If not set, will be auto-detected by the browser.

## User.num_format

The preferred numbering system of the user, e.g. `latn` (Latin digits), etc.  If not set, will be auto-detected by the browser.

## User.hour_cycle

The preferred hour cycle of the user, e.g. `h12` (12-hour clock) or `h24` (24-hour clock).  If not set, will be auto-detected by the browser.

## User.timezone

The preferred timezone of the user, e.g. `America/New_York`.  If not set, will be auto-detected by the browser.

## User.color_acc

A boolean, which indicates the user uses "color accessibility mode".  This adjusts the UI colors for better visibility.

## User.privacy_mode

A boolean, which indicates the user uses "privacy mode" (a.k.a "streamer mode").  This automatically blurs sensitive information in the UI, including usernames, full names, email addresses, server hostnames, IP Address, API keys, and more.

## User.effects

A boolean, indicating the user has enabled animated visual effects in the UI.

## User.page_info

A boolean, indicating the user has "page descriptions" enabled in the UI.  This shows an explanation of each page in the UI.

## User.contrast

A string indicating the user's preferred contrast mode.  Possible values are `auto`, `high`, `normal`, and `low`.

## User.motion

A string indicating the user's preferred motion setting.  Possible values are `auto`, `full` and `reduced`.

## User.volume

A number indicating the user's preferred sound volume, from 0 (muted) to 10 (loudest).

## User.privileges

A list of privileges assigned to the user.  Each privilege is represented as a key-value pair, where the key is the privilege name and the value is unused.  See [Privileges](privileges.md) for more information.

## User.roles

A list of roles assigned to the user.  See [Role](#role).

## User.searches

A list of search presets for the user.

# WebHook

A web hook is a user-defined HTTP callback that is triggered by specific actions in xyOps. When the specified action occurs, the web hook sends a HTTP request to the specified URL with an optional payload containing information about the event. Web hooks are commonly used for real-time notifications, integrations with other services, and automating workflows.  Here is an example Web Hook in JSON format:

```json
{
	"id": "example_hook",
	"title": "Example Hook",
	"enabled": true,
	"url": "https://httpbin.org/post",
	"method": "POST",
	"headers": [
		{
			"name": "Content-Type",
			"value": "application/json"
		},
		{
			"name": "User-Agent",
			"value": "OpsRocket/WebHook"
		}
	],
	"body": "{\n\t\"text\": \"{{text}}\",\n\t\"content\": \"{{text}}\",\n\t\"message\": \"{{text}}\"\n}",
	"timeout": 30,
	"retries": 0,
	"follow": false,
	"ssl_cert_bypass": false,
	"notes": "An example web hook for demonstration purposes.",
	"icon": "",
	"username": "admin",
	"modified": 1754449105,
	"created": 1754365754,
	"revision": 2,
	"max_per_day": 0
}
```

## WebHook.id

The unique identifier for the web hook.

## WebHook.title

The title of the web hook.

## WebHook.enabled

A boolean indicating whether the web hook is enabled or disabled.

## WebHook.icon

An optional icon ID for the web hook, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

## WebHook.url

The URL to which the web hook will send its request.

## WebHook.method

The HTTP method to use when sending the request. Common methods are `GET`, `POST`, `PUT`, and `DELETE`.

## WebHook.headers

An optional list of HTTP headers to include in the request.  This is formatted as an array of objects, where each object has a `name` and `value` property.

## WebHook.body

The optional body of the request to send with the web hook.  This is typically a JSON string, and may include placeholders (e.g. `{{text}}`) that will be replaced with actual values when the web hook is triggered.

## WebHook.timeout

The maximum time to wait for a response from the web hook before timing out. This is specified in seconds.

## WebHook.retries

The number of times to retry the web hook request if it fails. This is specified as an integer.

## WebHook.follow

A boolean indicating whether to follow redirects for the web hook request.

## WebHook.ssl_cert_bypass

A boolean indicating whether to bypass SSL certificate verification for the web hook request.

## WebHook.max_per_day

The maximum number of times the web hook can be triggered in a single day (i.e. anti-flood). This is specified as an integer.

## WebHook.notes

An optional field for adding notes or comments about the web hook.

## WebHook.revision

An internal revision number for the web hook, used for tracking changes.

# AlertInvocation

An alert invocation is a specific instance of an alert being triggered. It contains information about the alert, the server it applies to, and the context in which it was triggered.  Here is an example alert invocation in JSON format:

```json
{
    "active": false,
    "alert": "active_jobs_high",
    "count": 1,
    "date": 1754450881,
    "exp": "monitors.active_jobs >= 1",
    "groups": [
        "main"
    ],
    "id": "amdzer7xtk3",
    "jobs": [
        "jmdzer6zrju"
    ],
    "message": "Active job count is too high: 1",
    "modified": 1754450941,
    "notified": true,
    "server": "sorbstack01"
}
```

## AlertInvocation.id

The unique identifier for the alert invocation.

## AlertInvocation.alert

The [Alert.id](#alert-id) of the alert that triggered the invocation.

## AlertInvocation.count

An internal counter used to track the number of alert samples (warm-up and cool-down).

## AlertInvocation.date

The Unix epoch timestamp of when the alert was triggered.

## AlertInvocation.exp

The expression that triggered the alert.

## AlertInvocation.groups

The groups that the server that triggered the alert belongs to.

## AlertInvocation.jobs

The jobs that were running on the server at the time of the alert invocation.

## AlertInvocation.message

The message associated with the alert invocation.

## AlertInvocation.modified

The Unix epoch timestamp of when the alert invocation was last modified.

## AlertInvocation.notified

An internal boolean indicating whether the alert has been notified.

## AlertInvocation.server

The [Server.id](#server-id) that the alert is associated with.

# ServerMonitorData

Server monitoring data is collected every minute on every server, and is the source for all monitors and alerts.  It is a verbose structure, split up into the following top-level properties.

## ServerMonitorData.arch

The architecture of the server (e.g. `x86_64`, `arm64`).

## ServerMonitorData.commands

The current raw output from all custom user commands (a.k.a Monitor Plugins), keyed by the [Plugin.id](#plugin-id).  Example:

```json
{
	"open_files": "1056\t0\t9223372036854775807"
}
```

## ServerMonitorData.conns

An array of the current network connections on the server, including source and destination IP addresses, ports, and connection states.  Includes socket listeners.  Here is an example connection:

```json
{
	"bytes_in": 12075,
	"bytes_out": 3718412,
	"local_addr": "198.19.249.106:47968",
	"pid": 17430,
	"remote_addr": "10.1.10.241:5522",
	"state": "ESTABLISHED",
	"type": "tcp"
}
```

## ServerMonitorData.cpu

The current CPU usage statistics and information for the server, including user, system, and idle times, as well as CPU hardware and virtualization information.  Here is an example `cpu` object:

```json
{
	"avgLoad": 0,
	"brand": "",
	"cache": {
		"l1d": "",
		"l1i": "",
		"l2": "",
		"l3": ""
	},
	"combo": "Apple",
	"cores": 2,
	"cpus": [
		{
			"active": 0.21999999999999886,
			"idle": 99.78,
			"iowait": 0,
			"irq": 0,
			"nice": 0,
			"softirq": 0.01,
			"system": 0.06,
			"user": 0.13
		},
		{
			"active": 0.3199999999999932,
			"idle": 99.68,
			"iowait": 0,
			"irq": 0,
			"nice": 0,
			"softirq": 0,
			"system": 0.15,
			"user": 0.16
		}
	],
	"currentLoad": 0.14000000000000057,
	"efficiencyCores": 0,
	"family": "",
	"flags": "fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb dcpodp flagm2 frint",
	"governor": "performance",
	"manufacturer": "unknown",
	"model": "0",
	"performanceCores": 10,
	"physicalCores": 10,
	"processors": 1,
	"revision": "",
	"socket": "",
	"speed": 2,
	"speedMax": 2,
	"speedMin": 2,
	"stepping": "0x0",
	"totals": {
		"active": 0.14000000000000057,
		"idle": 99.86,
		"iowait": 0,
		"irq": 0,
		"nice": 0,
		"softirq": 0,
		"system": 0.05,
		"user": 0.08
	},
	"vendor": "Apple",
	"virtualization": false,
	"voltage": ""
}
```

## ServerMonitorData.deltas

Delta information for monitors that track changes over time.  This object is keyed by the [Monitor.id](#monitor-id), and the value is the current delta between the current and previous samples.  Example:

```json
{
	"disk_iops_sec": 11,
	"disk_read_sec": 791620,
	"disk_write_sec": 0,
	"os_bytes_in_sec": 86,
	"os_bytes_out_sec": 2179
}
```

## ServerMonitorData.interfaces

An object containing information about the network interfaces on the server, including their names, IP addresses, and other relevant details.  The object properties are the interface names, e.g. `eth0` and the value is an object describing the interface.  Here is an example:

```json
{
	"eth0": {
		"carrierChanges": 4,
		"default": true,
		"dhcp": true,
		"dnsSuffix": "Not defined",
		"duplex": "full",
		"ieee8021xAuth": "Not defined",
		"ieee8021xState": "Disabled",
		"iface": "eth0",
		"ifaceName": "eth0",
		"internal": false,
		"ip4": "198.19.249.106",
		"ip4subnet": "255.255.255.0",
		"ip6": "fd07:b51a:cc66:0:dc08:f5e7:80f8:da07",
		"ip6subnet": "ffff:ffff:ffff:ffff::",
		"mac": "00:00:00:00:00:00",
		"ms": 59964,
		"mtu": 1500,
		"operstate": "up",
		"rx_bytes": 724721,
		"rx_dropped": 0,
		"rx_errors": 0,
		"rx_sec": 86.45187112267361,
		"speed": 10000,
		"tx_bytes": 15102620,
		"tx_dropped": 0,
		"tx_errors": 0,
		"tx_sec": 2181.2254019078114,
		"type": "wired",
		"virtual": false
	}
}
```

## ServerMonitorData.jobs

The number of jobs currently running on the server.

## ServerMonitorData.load

The three CPU load average readings as an array, measured over 1, 5, and 15 minutes.  Example:

```json
[
	0,
	0.04,
	0.08
]
```

## ServerMonitorData.memory

Information about the server's current memory usage, including total, used, and free memory, as well as a variety of other readings.  Here is an example:

```json
{
	"active": 246853632,
	"anonhugepages": 0,
	"anonpages": 210190336,
	"available": 16181153792,
	"bounce": 0,
	"buffers": 12288,
	"cached": 69079040,
	"commitlimit": 26289311744,
	"committed_as": 1104420864,
	"dirty": 0,
	"filehugepages": 0,
	"filepmdmapped": 0,
	"free": 16290963456,
	"inactive": 38060032,
	"kernelstack": 5373952,
	"kreclaimable": 18268160,
	"mapped": 18681856,
	"mlocked": 0,
	"nfs_unstable": 0,
	"pagetables": 12222464,
	"percpu": 3686400,
	"secpagetables": 0,
	"shmem": 32534528,
	"shmemhugepages": 0,
	"shmempmdmapped": 0,
	"slab": 68550656,
	"sreclaimable": 18268160,
	"sunreclaim": 50282496,
	"swapcached": 0,
	"swapfree": 17884119040,
	"swaptotal": 17884119040,
	"total": 16810385408,
	"unevictable": 0,
	"used": 629231616,
	"vmallocchunk": 0,
	"vmalloctotal": 138535235485696,
	"vmallocused": 85164032,
	"writeback": 0,
	"writebacktmp": 0
}
```

## ServerMonitorData.monitors

The current computed values of all the monitors on the server.  These are all the user-defined monitors that track a single value over time, for the purpose of graphing (and often alerting).  Example:

```json
{
	"active_jobs": 0,
	"cpu_usage": 0.14,
	"disk_iops_sec": 75866,
	"disk_read_sec": 4345634816,
	"disk_usage_root": 5.09999,
	"disk_write_sec": 54124544,
	"io_wait": 0,
	"load_avg": 0,
	"mem_free": 16181153792,
	"mem_used": 629231616,
	"mmdze1gznbt": 42438656,
	"net_conns": 4,
	"open_files": 1056,
	"os_bytes_in_sec": 724721,
	"os_bytes_out_sec": 15102620,
	"total_procs": 23
}
```

## ServerMonitorData.mounts

Information about the mounted filesystems on the server.  Here is an example:

```json
{
	"mnt_mac": {
		"available": 453466611712,
		"fs": "mac",
		"mount": "/mnt/mac",
		"rw": false,
		"size": 994662584320,
		"type": "virtiofs",
		"use": 54.41,
		"used": 541195972608
	},
	"opt_orbstack_guest": {
		"available": 8404656128,
		"fs": "orbstack",
		"mount": "/opt/orbstack-guest",
		"rw": false,
		"size": 8405192704,
		"type": "overlay",
		"use": 0.01,
		"used": 536576
	},
	"root": {
		"available": 430730186752,
		"fs": "/dev/vdb1",
		"mount": "/",
		"rw": true,
		"size": 453868638208,
		"type": "btrfs",
		"use": 5.1,
		"used": 23138451456
	}
}
```

## ServerMonitorData.os

Detailed information about the operating system running on the server.  Here is an example:

```json
{
	"arch": "arm64",
	"build": "",
	"codename": "",
	"codepage": "UTF-8",
	"distro": "CentOS Stream",
	"fqdn": "centos-9-arm",
	"hostname": "centos-9-arm",
	"kernel": "6.14.10-orbstack-00291-g1b252bd3edea",
	"logofile": "centos",
	"platform": "Linux",
	"release": "9",
	"serial": "a7adc277eb8040f7a6f549c9261f9efe",
	"servicepack": "",
	"uefi": false
}
```

## ServerMonitorData.platform

The platform of the server, as reported by the Node.js [os.platform()](https://nodejs.org/api/os.html#osplatform) function.  Possible values are `aix`, `darwin`, `freebsd`, `linux`, `openbsd`, `sunos`, and `win32`.

## ServerMonitorData.process

Information about the xyOps Satellite process itself.  Example:

```json
{
	"pid": 3434,
	"cpu": 0.9638568333333333,
	"mem": 42184704,
	"started": 1754870793
}
```

## ServerMonitorData.processes

Detailed information about all of the processes running on the server.  First, here is the structure of the `processes` object, which contains some process state counters, as well as a `list` array:

```json
{
	"all": 23,
	"list": [...],
	"running": 1,
	"sleeping": 22
}
```

And here is an example process, which would be an element inside the `list` array:

```json
{
	"age": 17294,
	"class": "Other",
	"command": "/usr/bin/redis-server *:6379",
	"cpu": 0.02,
	"group": "redis",
	"mem": 0,
	"memRss": 3227648,
	"memVsz": 1122566144,
	"nice": 0,
	"parentPid": 1,
	"pid": 272,
	"priority": 19,
	"started": 1754854907,
	"state": "Sleeping",
	"threads": 5,
	"time": 42,
	"tty": "?",
	"user": "redis"
}
```

## ServerMonitorData.release

The operating system name, as reported by the Node.js [os.release()](https://nodejs.org/api/os.html#osrelease) function.  Example: `6.12.34+rpt-rpi-v8`.

## ServerMonitorData.stats

Contains information about filesystem, I/O and network throughput.  See below for details.

## ServerMonitorData.stats.fs

Contains information about filesystem throughput on the server.  Example:

```json
{
	"ms": 59984,
	"rx": 4345634816,
	"rx_sec": 791831.4217124566,
	"tx": 4399759360,
	"tx_sec": 791831.4217124566,
	"wx": 54124544,
	"wx_sec": 0
}
```

## ServerMonitorData.stats.io

Contains information about general I/O throughput on the server.  Example:

```json
{
	"ms": 59985,
	"rIO": 71062,
	"rIO_sec": 11.186129865799783,
	"rWaitPercent": 0.0033341668750520963,
	"rWaitTime": 420,
	"tIO": 75866,
	"tIO_sec": 11.186129865799783,
	"tWaitPercent": 0.0033341668750520963,
	"tWaitTime": 4807,
	"wIO": 4804,
	"wIO_sec": 0,
	"wWaitPercent": 0,
	"wWaitTime": 2039
}
```

## ServerMonitorData.stats.network

Contains information about current network throughput on the server.  Example:

```json
{
	"conns": 4,
	"ifaces": [
		"eth0"
	],
	"rx_bytes": 724721,
	"rx_dropped": 0,
	"rx_errors": 0,
	"rx_sec": 86.45187112267361,
	"states": {
		"established": 1,
		"listen": 2,
		"unconnected": 1
	},
	"tx_bytes": 15102620,
	"tx_dropped": 0,
	"tx_errors": 0,
	"tx_sec": 2181.2254019078114
}
```

## ServerMonitorData.stats.uptime_sec

The uptime of the server in seconds.

# Snapshot



## Snapshot.source

alert, watch, user (username), job




# Sub-Objects

These objects are nested under other data structures, usually items of an array.

## Action

Actions can be assigned to job related events such as start, completion, errors, and other conditions.  Here is an example:

```json
{
	"enabled": true,
	"condition": "error",
	"type": "email",
	"email": "admin@myserver.com"
}
```

This action would fire when the job resulted in an error, and it would send an email to `admin@myserver.com`, notifying them about the event.

Each action object should have the following properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| `enabled` | Boolean | Specifies whether the action is enabled (`true`) or disabled (`false`). |
| `condition` | String | Specifies the condition which runs the action.  See [Action Conditions](#action-conditions) below. |
| `type` | String | Specifies which action will take place when the condition fires.  See [Action Types](#action-types) below. |

Additional properties may be present based on the type.

### Action Conditions

Each action has a `condition` property which specifies when it will fire.  The value may be one of:

| Condition ID | Description |
|------------|-------------|
| `start` | Fires on job start. |
| `complete` | Fires on job completion, regardless of the outcome. |
| `success` | Fires on job success, i.e. when the `code` property is `0` or `false`. |
| `error` | Fires on job errors, i.e. when the `code` property is any true value or string. |
| `warning` | Fires on job warnings, i.e. when the `code` property is set to `"warning"`. |
| `critical` | Fires on critical errors, i.e. when the `code` property is set to `"critical"`. |
| `abort` | Fires when the job is aborted, either by user or special event (e.g. lost server). |

### Action Types

Each action has a `type` property which dictates what will happen when the condition fires.  The different types are listed below:

| Type ID | Description |
|---------|-------------|
| `email` | Send email to one or more addresses.  The addresses should be in an extra property named `email` (comma-separated). |
| `web_hook` | Fire off a web hook (HTTP POST) for the action.  The URL should be specified in a property named `url`. |
| `run_event` | Run a custom job for the action.  The Event ID should be specified in a property named `event_id`. |
| `channel` | Activate a notification channel for the action.  The Channel ID should be specified in a property named `channel_id`. |
| `disable` | Disable the event for the action (no extra properties defined). |
| `snapshot` | Take a server snapshot for the action (no extra properties defined). |

## Limit

Limits (otherwise known as "Resource Limits" in the UI) govern things like CPU, memory, and log size for running jobs.  They can be assigned to both events and categories, and each may have several different limits set.  Here is an example:

```json
{
	"type": "time",
	"enabled": true,
	"duration": 3600
}
```

This would set a time limit of 3600 seconds (1 hour) for running jobs.

Each limit object should have the following properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| `enabled` | Boolean | Specifies whether the limit is enabled (`true`) or disabled (`false`). |
| `type` | String | Specifies the type of limit.  See [Limit Types](#limit-types) below. |

Additional properties may be present based on the type.

When limits are assigned to categories, they act as defaults for events in that category.  Events may still override limits set in their categories.

### Limit Types

Each limit has a `type` property which specifies what it governs.  The different types are described below:

| Type ID | Description |
|---------|-------------|
| `time` | Set a maximum run time for jobs.  The limit should be in a property named `duration`, specified as seconds. |
| `job` | Set a maximum number of concurrent jobs for the event.  The number should be a in property named `amount`. |
| `log` | Set a maximum limit on the log file size for jobs.  The limit should be in a property named `amount`, specified as bytes. |
| `mem` | Set a maximum limit for memory usage for jobs (includes all child processes).  The limit should be in a property named `amount`, specified as bytes.  The sustain duration should be in a property named `duration`, specified as seconds. |
| `cpu` | Set a maximum limit for CPU usage for jobs (includes all child processes).  The limit should be in a property named `amount`, specified as a percentage of one CPU core.  The sustain duration should be in a property named `duration`, specified as seconds. |
| `retry` | Set a maximum number of retries allowed for failed jobs.  The number of retries should be in a property named `amount`, and optionally the delay between retries should be in a property named `duration`, specified as seconds. |
| `queue` | Set a maximum number of jobs that may be queued up, if other limits prevent them from running concurrently.  The number should be in a property named `amount`. |

## Trigger

Events are scheduled using one or more trigger objects, which can define repeating invocations (hourly, daily, etc.), single-shots on an exact future date/time, and other misc. rules such as blackout dates.  Here is an example:

```json
{
	"type": "schedule",
	"enabled": true,
	"hours": [ 4 ],
	"minutes": [ 30 ]
}
```

This would run every day at 4:30 AM (repeating).

Each trigger object should have the following properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| `enabled` | Boolean | Specifies whether the trigger is enabled (`true`) or disabled (`false`). |
| `type` | String | Specifies the type of trigger.  See [Trigger Types](#trigger-types) below. |

Additional properties may be present based on the type.

### Trigger Types

Each trigger has a `type` property which describes its behavior.  The different types are listed below:

| Type ID | Description |
|---------|-------------|
| `schedule` | Set a repeating schedule to run the event (hourly, daily, etc.).  See [Schedule Rules](#schedule-rules) below. |
| `interval` | Run the event on a repeating interval, given a starting date/time. |
| `single` | Set a single future exact date/time to run.  Requires an additional `epoch` property, set to the [Epoch timestamp](https://en.wikipedia.org/wiki/Unix_time) at which to run. |
| `catchup` | Ensure that *every* scheduled job runs, even if it has to run late. |
| `range` | Set a starting and/or ending date for a repeating event.  Requires additional `start` and/or `end` properties, set to [Epoch timestamps](https://en.wikipedia.org/wiki/Unix_time). |
| `blackout` | Set a blackout date/time range when the event *cannot* run.  Requires additional `start` and `end` properties, set to [Epoch timestamps](https://en.wikipedia.org/wiki/Unix_time). |
| `delay` | Set an optional starting delay for all scheduled jobs.  Requires an additional `duration` property, set to the number of seconds to delay each job by. |
| `precision` | Set an optional list of exact seconds to fire jobs within the current scheduled minute. |
| `plugin` | Custom scheduler Plugin (user-defined).  Requires an additional `plugin_id` property, as well as a `params` object, for Plugin-defined configuration. |

#### Schedule Rules

The `schedule` type describes a repeating event (when and how frequent it should run jobs).  It works similarly to the [Unix Cron](https://en.wikipedia.org/wiki/Cron) system, with selections of years, months, days, weekdays, hours and/or minutes.  Each property should be an array of numerical values.  If omitted, it means the same as "all" in that category (i.e. asterisk `*` in Cron syntax).

For example, an event with this trigger object would run once per hour, on the hour:

```js
{
	"type": "schedule",
	"enabled": true,
	"minutes": [0]
}
```

It essentially means every year, every month, every day, every hour, but only on the `0` minute.  The scheduler ticks only once a minute, so this only results in running one job for each matching minute.

For another example, this would run twice daily, at 4:30 AM and 4:30 PM:

```js
{
	"type": "schedule",
	"enabled": true,
	"hours": [4, 16],
	"minutes": [30]
}
```

For a more complex example, this would run only in year 2023, from March to May, on the 1st and 15th of the month (but only if also weekdays), at 6AM to 10AM, and on the :15 and :45 of those hours:

```js
{
	"type": "schedule",
	"enabled": true,
	"years": [2023],
	"months": [3, 4, 5],
	"days": [1, 15],
	"weekdays": [1, 2, 3, 4, 5],
	"hours": [6, 7, 8, 9, 10],
	"minutes": [15, 45]
}
```

Here is a list of all the `schedule` type trigger object properties and their descriptions:

| Trigger Property | Range | Description |
|-----------------|-------|-------------|
| `years` | ∞ | One or more years in YYYY format. |
| `months` | 1 - 12 | One or more months, where January is 1 and December is 12. |
| `days` | 1 - 31 | One or more month days, from 1 to 31. |
| `weekdays` | 0 - 6 | One or more weekdays, where Sunday is 0, and Saturday is 6. |
| `hours` | 0 - 23 | One or more hours in 24-hour time, from 0 to 23. |
| `minutes` | 0 - 59 | One or more minutes, from 0 to 59. |
| `timezone` | n/a | Optional timezone to evaluate the schedule entry in. |

### Workflow

TBD

### Privileges
