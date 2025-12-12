# Tickets

## Overview

Tickets in xyOps provide a lightweight, integrated way to track issues, releases, changes, incidents, and any operational work that benefits from an audit trail, comments, files, and automation. Tickets live alongside jobs, alerts, servers, and workflows, and can both react to the system (auto-created from jobs or alerts) and drive the system (run events/jobs directly from a ticket).


## Properties

Tickets are simple JSON records with a few core and optional fields. The full schema is documented at [Ticket](data.md#ticket). Key properties are summarized here.

- `subject`: Short summary/title. HTML is stripped.
- `body`: Markdown content for the ticket. Useful for runbooks, context from jobs/alerts, and checklists.
- `type`: One of issue, feature, release, change, maintenance, question, other. Controls presentation only; choose what best fits your workflow.
- `status`: One of draft, open, closed.
  - `draft`: Suppresses all email notifications. Use for drafting without notifying anyone.
  - `open`: Normal active ticket state.
  - `closed`: Completed/resolved. Closing is recorded in change history and can be searched.
- `assignees`: Array of usernames responsible for the ticket. Receive update emails and overdue notices.
- `cc`: Array of usernames to also receive update emails (no overdue notices).
- `notify`: Array of custom email addresses for updates (no overdue notices). Useful for team lists like `ops-team@company.com`.
- `category`: Optional [Category.id](data.md#category-id). Auto-set when tickets are created from jobs to match the job's category.
- `tags`: Array of [Tag.id](data.md#tag-id)s. Auto-set from the source job's tags when auto-created.
- `server`: Optional [Server.id](data.md#server-id). Auto-set when created from jobs/alerts that reference a server.
- `due`: Optional due date (Unix seconds). After the date passes, daily overdue notices are emailed to assignees.
- `files`: Array of uploaded files attached to the ticket. Files are listed on the ticket page and passed as inputs to jobs launched from the ticket's events.
- `events`: A list of event stubs that can run jobs from the ticket. Each event may override targets, selection algorithm, tags, and parameter defaults.
- `changes`: The change and comment history. Includes structured "change" entries and "comment" entries.


## Creating Tickets

You can create tickets manually, through the API, and automatically via job/alert actions.

### Manually

- Click "New Ticket" in the sidebar.
- Fill subject, body (Markdown), type, status, category, server, assignees, cc, notify, tags, and due.
- Attach files if needed (these appear under Ticket Files and will be passed to jobs launched from the ticket).
- Save as Draft to suppress notifications until ready.

### API

Use [create_ticket](api.md#create_ticket) to create tickets programmatically. You may post JSON or multipart/form-data (to upload files). See [API](api.md) for full details and examples.

- JSON: `POST /api/app/create_ticket/v1` with the ticket fields.
- File upload: Use `multipart/form-data` with a `json` field containing the ticket JSON string, plus one or more file fields to attach.

Related APIs:

- [update_ticket](api.md#update_ticket): Shallow-merge updates; server detects and records changes.
- [add_ticket_change](api.md#add_ticket_change) and [update_ticket_change](api.md#update_ticket_change): Add/edit/delete comments or change entries.
- [upload_user_ticket_files](api.md#upload_user_ticket_files): Upload and attach files to ticket.
- [delete_ticket_file](api.md#delete_ticket_file): Remove an attached file.
- [delete_ticket](api.md#delete_ticket): Permanently delete a ticket.
- [search_tickets](api.md#search_tickets): Search with pagination and sorting; supports compact mode for grids.

### Job Action

Jobs can create tickets on start or completion based on outcome or tags. Add a "Create Ticket" action to an event, workflow node, or via category/universal defaults. When fired:

- The ticket body is auto-generated (template: job) with useful context (job details, performance, log excerpt, links).
- Category, tags, and server fields are auto-populated from the job when applicable.
- The new ticket is added to the originating job for traceability.

See [Actions](actions.md) for action configuration.

### Alert Actions

Alerts can create tickets when an alert fires (or clears, if desired). Add a "Create Ticket" alert action. When fired:

- The ticket body is auto-generated (template: alert) with server and alert context, links to the alert and server, and optionally active job summaries.
- Server is populated from the firing server; tags can be set from the action.
- The new ticket is added to the alert invocation record.


## Ticket Events

Ticket events attach runnable events (jobs) to a ticket with optional parameter overrides.  Just click the "Add Event" button and select an event.

From the ticket view you can run any attached event. When a job is launched from a ticket:

- The ticket is associated to the job.
- Any ticket files are passed as job input files.
- Files produced by previous ticket-launched jobs can also be chained into subsequent runs from the ticket view.

This makes tickets a powerful control plane for CI/CD: create a ticket for a release, attach deploy/test/rollback events, upload artifacts to the ticket, then run jobs from the ticket and keep the entire history centralized.


## Ticket Files

- Attach files in the UI or upload via API when creating a ticket. Files are stored server-side and listed on the ticket.
- Files attached to a ticket are automatically provided to jobs launched from the ticket's events.
- Files can be removed from the ticket; deletion removes the record and the stored object.
- File expiration is governed by configuration (see [file_expiration](config.md#file_expiration)). Expired files are cleaned up automatically.


## Comments and Changes

Any user with the [edit_tickets](privileges.md#edit_tickets) privilege can add comments. Comments are stored in changes with type comment, and support Markdown formatting.

- **Change history**: Edits to key fields (subject, status, type, category, server, assignees, due, cc, notify, tags) are recorded as structured change entries. Draft tickets do not record changes or send notifications.
- **Email updates**: Assignees, cc users, and notify emails receive batched email updates (debounced) with a summary of changes and any new comments. If the body text was changed, the full body is included in the update.
- **Overdue notices**: After due date has passed, daily overdue emails are sent to assignees only.


## Searching and Presets

The Tickets page includes a search interface with query filters (text, type, status, assignees, tags, date ranges) and sorting. You can save frequent searches as presets in the UI (e.g., "My Inbox", "Overdue Tickets", "Severity 1"). Presets appear in the sidebar for quick access.

Programmatic searches are available via [search_tickets](api.md#search_tickets) (supports pagination and compact responses).


## Tips and Patterns

- **Release management**: Create a Release ticket and attach deploy, test, and rollback events. Upload your build artifacts to the ticket, then run deploy from the ticket. Artifacts automatically flow into the job.
- **Incident response**: Auto-create an Issue on alert fire with server context. Assign on-call, set a due date for follow-up, and track remediation steps with comments. Close when resolved.
- **Change control**: Use Change tickets for planned work. Attach validation jobs (pre-checks, post-checks) and require a second assignee to review.
- **Maintenance windows**: Schedule Maintenance tickets with due dates. Attach health-check jobs to verify post-maintenance status.
- **Runbooks**: Use the ticket body (Markdown) for runbooks and checklists. Link to jobs via ticket events for repeatable actions.


## Privileges

- [create_tickets](privileges.md#create_tickets): Create tickets.
- [edit_tickets](privileges.md#edit_tickets): Edit tickets, add comments, attach/remove files, run ticket events.
- [delete_tickets](privileges.md#delete_tickets): Permanently delete tickets.

Standard authentication applies for UI and API usage (sessions or API Keys). See [Privileges](privileges.md) and [API](api.md) for details.


## See Also

- Actions can create tickets automatically: see [Actions](actions.md)
- Ticket data model and field details: see [Ticket](data.md#ticket)
- Ticket API endpoints: see [API](api.md#tickets) ([search_tickets](api.md#search_tickets), [create_ticket](api.md#create_ticket), [update_ticket](api.md#update_ticket), [add_ticket_change](api.md#add_ticket_change), [update_ticket_change](api.md#update_ticket_change), [delete_ticket_file](api.md#delete_ticket_file), [delete_ticket](api.md#delete_ticket))
