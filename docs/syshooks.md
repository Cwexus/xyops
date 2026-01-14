# System Hooks

## Overview

System Hooks let you run custom background actions in response to global activity across xyOps. Activity includes user transactions (create/update/delete of objects, secret access), system events (servers connecting/disconnecting, conductor changes), and general notices (`notice`, `warning`, `error`, `critical`). Hook actions can fire a web hook, run a shell command, send email, and/or create a ticket.

System Hooks are configured in `config.json` under the `hooks` object. Hook actions run in parallel and always in the background.

## Configuration

Hooks are configured in the main `config.json` file (see `sample_conf/config.json`). By default, no hooks are defined:

```json
"hooks": {}
```

Each key under `hooks` is an activity type ID, and the value is an object describing one or more hook actions to run. You can combine actions within the same hook, and they will all fire.

Example configuration:

```json
"hooks": {
	"error": {
		"shell_exec": "/opt/system/bin/notify-error.sh"
	},
	"critical": {
		"shell_exec": "/opt/system/bin/notify-critical.sh",
		"email": "oncall-pager@mycompany.com",
		"ticket": {
			"type": "issue",
			"assignees": ["admin"]
		}
	},
	"secret_access": {
		"web_hook": "mkd0t84o7hwasu0g"
	}
}
```

## Activity Type IDs

Here is a list of all the activity type IDs you can attach global system hook actions to:

| Activity Type ID | Description Template / Meaning |
|---|---|
| `notice` | General notice, e.g. "Background server upgrade completed". |
| `warning` | General warning, e.g. "Server connecting with duplicate hostname...". |
| `error` | General error (not currently used: for future use). |
| `critical` | General critical, e.g. "Crash log found at startup". |
| `job_start` | Job started (before remote launch). |
| `job_complete` | Job completed, regardless of outcome. |
| `job_success` | Job completed successfully (`code` is `0` or `false`). |
| `job_error` | Job completed with any error (`code` is non-zero/non-false). |
| `job_warning` | Job completed with `code` set to `warning`. |
| `job_critical` | Job completed with `code` set to `critical`. |
| `job_abort` | Job was aborted (user or failure condition). |
| `job_tag:TAGID` | Job completed and has the specified tag. |
| `alert_new` | Alert fired on a server. |
| `alert_cleared` | Alert cleared on a server. |
| `alert_create` | `Alert definition created: [description] ([alert.id])` |
| `alert_update` | `Alert definition updated: [description] ([alert.id])` |
| `alert_delete` | `Alert definition deleted: [description] ([alert.id])` |
| `alert_update_tickets` | `Alert invocation tickets updated: #[description]` |
| `alert_delete_invocation` | `Alert invocation deleted: #[description]` |
| `apikey_create` | `API Key created: [description]` |
| `apikey_update` | `API Key updated: [description]` |
| `apikey_delete` | `API Key deleted: [description]` |
| `category_create` | `Category created: [description] ([category.id])` |
| `category_update` | `Category updated: [description] ([category.id])` |
| `category_delete` | `Category deleted: [description] ([category.id])` |
| `category_multi_update` | `Multiple categories updated ([updated]).` |
| `channel_create` | `Channel created: [description] ([channel.id])` |
| `channel_update` | `Channel updated: [description] ([channel.id])` |
| `channel_delete` | `Channel deleted: [description] ([channel.id])` |
| `event_create` | `Event created: [description] ([event.id])` |
| `event_update` | `Event updated: [description] ([event.id])` |
| `event_delete` | `Event deleted: [description] ([event.id])` |
| `job_update` | `Job updated: #[description]` |
| `job_update_tags` | `Job tags updated: #[description]` |
| `job_update_tickets` | `Job tickets updated: #[description]` |
| `job_update_comments` | `Job comments updated: #[description]` |
| `job_abort` | `Job aborted: #[description]: [reason]` |
| `job_delete` | `Job deleted: #[description]` |
| `job_delete_file` | `Job file deleted: #[description]: [path]` |
| `job_resume` | `Job has been resumed: #[description]` |
| `queue_flush` | `Flushed job queue for event: #[description]` |
| `group_create` | `Server group created: [description] ([group.id])` |
| `group_update` | `Server group updated: [description] ([group.id])` |
| `group_delete` | `Server group deleted: [description] ([group.id])` |
| `group_multi_update` | `Multiple server groups updated ([updated]).` |
| `group_watch` | `A watch for [duration] was set on the group: [group.title] ([group.id])` |
| `monitor_create` | `Monitor created: [description] ([monitor.id])` |
| `monitor_update` | `Monitor updated: [description] ([monitor.id])` |
| `monitor_delete` | `Monitor deleted: [description] ([monitor.id])` |
| `monitor_multi_update` | `Multiple monitors updated ([updated]).` |
| `plugin_create` | `Plugin created: [description] ([plugin.id])` |
| `plugin_update` | `Plugin updated: [description] ([plugin.id])` |
| `plugin_delete` | `Plugin deleted: [description] ([plugin.id])` |
| `tag_create` | `Tag created: [description] ([tag.id])` |
| `tag_update` | `Tag updated: [description] ([tag.id])` |
| `tag_delete` | `Tag deleted: [description] ([tag.id])` |
| `web_hook_create` | `Web Hook created: [description] ([web_hook.id])` |
| `web_hook_update` | `Web Hook updated: [description] ([web_hook.id])` |
| `web_hook_delete` | `Web Hook deleted: [description] ([web_hook.id])` |
| `bucket_create` | `Bucket created: [description] ([bucket.id])` |
| `bucket_update` | `Bucket updated: [description] ([bucket.id])` |
| `bucket_delete` | `Bucket deleted: [description] ([bucket.id])` |
| `secret_create` | `Secret created: [description] ([secret.id])` |
| `secret_update` | `Secret updated: [description] ([secret.id])` |
| `secret_delete` | `Secret deleted: [description] ([secret.id])` |
| `secret_access` | `Secret was accessed: [description] ([secret.id])` |
| `ticket_create` | `Ticket #[ticket.num] created: [ticket.subject] ([ticket.id])` |
| `ticket_update` | `Ticket #[ticket.num] updated: [ticket.subject] ([ticket.id])` |
| `ticket_delete` | `Ticket #[ticket.num] deleted: [ticket.subject] ([ticket.id])` |
| `ticket_add_change` | `Ticket comment added: #[ticket.num]: [ticket.subject] ([ticket.id])` |
| `ticket_update_change` | `Ticket comment updated: #[ticket.num]: [ticket.subject] ([ticket.id])` |
| `user_create` | `User created: [user.full_name] ([user.username])` |
| `user_update` | `User updated: [user.full_name] ([user.username])` |
| `user_delete` | `User deleted: [user.full_name] ([user.username])` |
| `user_login` | `User logged in: [user.full_name] ([user.username])` |
| `user_password` | `User password was changed: [user.full_name] ([user.username])` |
| `role_create` | `Role created: [description] ([role.id])` |
| `role_update` | `Role updated: [description] ([role.id])` |
| `role_delete` | `Role deleted: [description] ([role.id])` |
| `server_add` | `Server connected to the network: [hostname]` |
| `server_remove` | `Server disconnected from the network: [hostname]` |
| `server_delete` | `Server deleted: [hostname]` |
| `server_update` | `Server information was updated: [hostname]` |
| `server_watch` | `A watch for [duration] was set on the server: [hostname]` |
| `master_primary` | `Conductor server is now primary: [host]` |
| `peer_add` | `Conductor server added to the network: [host]` |
| `peer_disconnect` | `Conductor serfer disconnected from the network: [host]` |
| `peer_command` | `Control command [commands] sent to conductor server: [host]` |
| `state_update` | `Internal state updated: [description]` |
| `internal_job` | `Internal job completed: [job.title]` |

See [Activity](data.md#activity) for details on the activity payload format and common properties.

## Job and Alert Conditions

All job actions also fire System Hooks, using a `job_` prefix on the action condition. Common examples include:

- `job_complete`: Any job completion (success or failure)
- `job_success`: Successful completion
- `job_error`: Any failed completion
- `job_warning`: Completion with warning code
- `job_critical`: Completion with critical code
- `job_abort`: Job aborted by user or failure condition

Tag-based job actions also emit hooks using the same `job_` prefix (for example, `job_tag:deploy`). See the "Action Conditions" section in [Actions](actions.md) for the full list of job and alert action conditions.

Alert actions also fire System Hooks:

- `alert_new`
- `alert_cleared`

## Firehose Hook

You can configure a catch-all hook using a `*` (asterisk) key. This fires for every activity type:

```json
"hooks": {
	"*": {
		"shell_exec": "/opt/system/bin/firehose.sh"
	}
}
```

## Hook Action Types

System Hooks support these action types. You can use any combination within a single hook, and all actions run in parallel.

### Web Hook

You have two options for firing web hooks:

1. **Simple URL**: Specify a URL directly in `config.json`, and xyOps posts the activity payload as JSON.
2. **Configured web hook**: Reference a web hook ID that is managed inside xyOps for full control over method, headers, body, and templating.

Simple URL example:

```json
"hooks": {
	"alert_new": {
		"url": "http://alerts.mycompany.com/api/new-alert/v1"
	}
}
```

Configured web hook example:

```json
"hooks": {
	"alert_new": {
		"web_hook": "wmkd2yx4yw4ihh7lu"
	},
	"job_error": {
		"web_hook": "wmkd312hugd31hqdh"
	}
}
```

For configured web hooks, see [Web Hooks](webhooks.md). Payloads are based on the [Activity](data.md#activity) format.

### Shell Exec

The `shell_exec` action spawns a process and sends the activity payload to the command's STDIN. The payload is JSON on a single line (i.e. [xyOps Wire Protocol](xywp.md)).

Example:

```json
"hooks": {
	"critical": {
		"shell_exec": "/path/to/script.sh"
	}
}
```

### Send Email

The `email` action sends a generic activity summary email. It includes the activity summary, full payload (JSON), and any details if provided (common for `notice`, `warning`, `error`, `critical`). Multiple recipients may be specified as a comma-separated list.

Example:

```json
"hooks": {
	"critical": {
		"email": "oncall-pager@mycompany.com"
	}
}
```

Note that to send emails for server alerts (a very common configuration) it is **much** better to use the [alert_universal_actions](config.md#alert_universal_actions) feature, which generates a proper alert-centric email (emails generated from system hooks are more generic).  Recommended configuration for global alert emails:

```json
"alert_universal_actions": [
	{
		"enabled": true,
		"hidden": true,
		"condition": "alert_new",
		"type": "snapshot"
	},
	{
		"enabled": true,
		"condition": "alert_new",
		"type": "email",
		"email": "oncall-pager@mycompany.com"
	}
]
```

The same goes for job failures.  If you want an email for all job failures, use the [job_universal_actions](config.md#job_universal_actions) feature instead, as it generates a more proper email for the specific action:

```json
"job_universal_actions": {
	"default": [
		{
			"enabled": true,
			"hidden": false,
			"condition": "error",
			"type": "snapshot"
		},
		{
			"enabled": true,
			"condition": "error",
			"type": "email",
			"email": "oncall-pager@mycompany.com"
		}
	],
	"workflow": [
		{
			"enabled": true,
			"condition": "error",
			"type": "email",
			"email": "oncall-pager@mycompany.com"
		}
	]
}
```

### Create Ticket

The `ticket` action creates a ticket for the activity. Any ticket fields may be included here. See [Tickets](tickets.md) and the [Ticket](data.md#ticket) definition for field details.

Example:

```json
"hooks": {
	"critical": {
		"ticket": {
			"assignees": ["admin"],
			"type": "issue"
		}
	}
}
```

Note that assigned tickets automatically send out an email to all assignees (assuming [tickets.email_enabled](config.md#tickets-email_enabled) is enabled), so this is yet another way to receive an email for specific activity reports.

If you want to create an extremely loud and annoying ticket, set the `due` property to `today`, which will start sending out daily overdue reminders to all assignees:

```json
"hooks": {
	"critical": {
		"ticket": {
			"assignees": ["admin"],
			"type": "issue",
			"due": "today"
		}
	}
}
```

## Example Payloads

These are sample activity JSON payloads sent to shell exec and simple web hooks.  Note that in practice they are all compacted onto a single line.

Alert Fired (`alert_new`):

```json
{
	"xy": 1,
	"alert": {
		"date": 1768336814,
		"exp": "memory.available < 1073741824",
		"message": "Server has low free memory: 906.2 MB",
		"count": 1,
		"notified": true,
		"id": "amkd22yuuryqbzol",
		"active": true,
		"alert": "amkd22ytorq8q9k3",
		"server": "saturn1",
		"groups": [
			"main",
			"prod"
		],
		"modified": 1768336814
	},
	"description": "New alert for: saturn1: Server has low free memory: 906.2 MB",
	"action": "alert_new",
	"epoch": 1768336814,
	"id": "amkd22yuurzr9emy",
	"keywords": [],
	"text": "New alert for: saturn1: Server has low free memory: 906.2 MB",
	"message": "New alert for: saturn1: Server has low free memory: 906.2 MB",
	"content": "New alert for: saturn1: Server has low free memory: 906.2 MB"
}
```

Critical Error (`critical`):

```json
{
	"xy": 1,
	"description": "Crash log was found on worker server.",
	"details": "**Log Contents:**\\n\\n```\\n(Actual crash log here)\n```\n",
	"server": "api-prod-01",
	"action": "critical",
	"epoch": 1768283576,
	"id": "amkc6dvvd1nci7tl",
	"keywords": [],
	"text": "Crash log was found on worker server.",
	"message": "Crash log was found on worker server.",
	"content": "Crash log was found on worker server."
}
```

Secret Access (`secret_access`), meaning a user or API key decrypted a secret vault:

```json
{
	"xy": 1,
	"secret": {
		"title": "Dev AI Creds",
		"enabled": false,
		"icon": "",
		"notes": "updated by joe",
		"plugins": [
			"shellplug"
		],
		"categories": [],
		"events": [],
		"web_hooks": [
			"example_hook"
		],
		"id": "zmkd22dfakpie2ns",
		"username": "testuser",
		"modified": 1768336787,
		"created": 1768336787,
		"revision": 3,
		"names": [
			"API_KEY"
		]
	},
	"keywords": [
		"zmkd22dfakpie2ns",
		"testuser",
		"::1"
	],
	"ip": "::1",
	"ips": [
		"::1"
	],
	"headers": {
		"content-type": "application/json",
		"accept-encoding": "gzip, deflate, br",
		"user-agent": "xyOps Unit Tester",
		"content-length": "26",
		"host": "localhost:6622",
		"connection": "keep-alive"
	},
	"username": "testuser",
	"description": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)",
	"action": "secret_access",
	"epoch": 1768336787,
	"id": "amkd22dlulih6e0r",
	"text": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)",
	"message": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)",
	"content": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)"
}
```

State Update (`state_update`), meaning a user or API key toggled the main scheduler master switch:

```json
{
	"xy": 1,
	"key": "scheduler.enabled",
	"value": false,
	"ip": "::1",
	"ips": [
		"::1"
	],
	"headers": {
		"content-type": "application/json",
		"accept-encoding": "gzip, deflate, br",
		"user-agent": "xyOps Unit Tester",
		"content-length": "48",
		"host": "localhost:6622",
		"connection": "keep-alive"
	},
	"username": "testuser",
	"description": "Internal state updated: scheduler.enabled",
	"action": "state_update",
	"epoch": 1768336817,
	"id": "amkd230tlujovg4l",
	"keywords": [
		"testuser",
		"::1"
	],
	"text": "Internal state updated: scheduler.enabled",
	"message": "Internal state updated: scheduler.enabled",
	"content": "Internal state updated: scheduler.enabled"
}
```

Master Primary (`master_primary`), meaning a conductor server has taken over operations as primary:

```json
{
	"xy": 1,
	"host": "localhost",
	"description": "Conductor server is now primary: localhost",
	"action": "master_primary",
	"epoch": 1768336785,
	"id": "amkd22c1fbgcilb1",
	"keywords": [],
	"text": "Conductor server is now primary: localhost",
	"message": "Conductor server is now primary: localhost",
	"content": "Conductor server is now primary: localhost"
}
```

## Tips

- Send email on `critical` to page on-call and include the activity details.
- Use a configured web hook to notify incident systems like OpsGenie on `error` or `critical`.
- Use a firehose hook to stream all activity into a log pipeline via `shell_exec`.
