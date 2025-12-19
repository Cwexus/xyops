# Database

This document describes the xyOps database schema. It lists every index (table), all indexed columns, and the dedicated sorters used for ordering results.

## Overview

xyOps uses [Unbase](https://github.com/jhuckaby/pixl-server-unbase) which sits on top of [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage) and its [Indexer](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md) subsystem. Records are stored as JSON in a key/value backend (SQLite by default), and Unbase builds searchable indexes and sorters from configured field definitions. Queries support both simple "field:words" and a structured [PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) syntax.

Notes:

- Type refers to the indexer type: word (default full-text/word), number, or date. Unless specified, a field is a word index.
- Date/number fields may be stored with reduced precision for performance (e.g., divided by 3600 to index hour-level time buckets).

## Jobs

Completed job records (see [Job](data.md#job)).

Indexed Columns:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `code` | [Job.code](data.md#job-code) (`/code`) | word | Result code for the job (0 success, non-zero failure; special values like `warning`, `critical`, `abort`). |
| `date` | [Job.completed](data.md#job-completed) (`/completed`) | number | Completion timestamp indexed at hour precision. |
| `source` | [Job.source](data.md#job-source) (`/source`) | word | Launch source (scheduler, plugin, key, user, action, alert, workflow). |
| `tags` | [Job.tags](data.md#event-tags) (`/tags`) | word | Tags assigned to the job. |
| `event` | [Job.event](data.md#job-event) (`/event`) | word | Event ID that spawned the job. |
| `category` | [Job.category](data.md#event-category) (`/category`) | word | Event category ID copied into the job. |
| `plugin` | [Event.plugin](data.md#event-plugin) (`/plugin`) | word | Plugin ID that executed the job. |
| `server` | [Job.server](data.md#job-server) (`/server`) | word | Server ID selected to run the job. |
| `groups` | [Job.groups](data.md#job-groups) (`/groups`) | word | Server group IDs copied into the job. |
| `workflow` | [Job.workflow](data.md#job-workflow) (`/workflow/event`) | word | When part of a workflow, the workflow event ID. |
| `tickets` | [Job](data.md#job-tickets) (`/tickets`) | word | Linked ticket IDs associated with the job. |

Sorters:

| Sorter ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `completed` | [Job.completed](data.md#job-completed) (`/completed`) | number | Sort by job completion timestamp. |
| `elapsed` | [Job.elapsed](data.md#job-elapsed) (`/elapsed`) | number | Sort by job elapsed duration (seconds). |

## Alerts

Alert invocation records (see [AlertInvocation](data.md#alertinvocation)).

Indexed Columns:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `active` | [AlertInvocation.active](data.md#alertinvocation-active) (`/active`) | word | Whether the alert is currently active (`true` or `false`). |
| `alert` | [AlertInvocation.alert](data.md#alertinvocation-alert) (`/alert`) | word | Alert definition ID. |
| `groups` | [AlertInvocation.groups](data.md#alertinvocation-groups) (`/groups`) | word | Groups the server belongs to. |
| `server` | [AlertInvocation.server](data.md#alertinvocation-server) (`/server`) | word | Server ID associated with the invocation. |
| `start` | [AlertInvocation.date](data.md#alertinvocation-date) (`/date`) | number | Start timestamp indexed at hour precision. |
| `end` | [AlertInvocation.modified](data.md#alertinvocation-modified) (`/modified`) | number | Last modified time indexed at hour precision. |
| `jobs` | [AlertInvocation.jobs](data.md#alertinvocation-jobs) (`/jobs`) | word | Related job IDs. |
| `tickets` | [AlertInvocation.tickets](data.md#alertinvocation-tickets) (`/tickets`) | word | Related ticket IDs. |

## Snapshots

Server and group snapshot records (see [Snapshot](data.md#snapshot)).

Indexed Columns:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `type` | [Snapshot.type](data.md#snapshot-type) (`/type`) | word | Snapshot type: `server` or `group`. |
| `source` | [Snapshot.source](data.md#snapshot-source) (`/source`) | word | Snapshot origin: `alert`, `watch`, `user`, or `job`. |
| `server` | [Snapshot.server](data.md#snapshot-server) (`/server`) | word | Server ID for server snapshots. |
| `groups` | [Snapshot.groups](data.md#snapshot-groups) (`/groups`) | word | Groups associated at the time of the snapshot. |
| `date` | [Snapshot.date](data.md#snapshot-date) (`/date`) | number | Snapshot timestamp indexed at hour precision. |
| `alerts` | [Snapshot.alerts](data.md#snapshot-alerts) (`/alerts`) | word | Active alert invocation IDs at snapshot time. |
| `jobs` | [Snapshot.jobs](data.md#snapshot-jobs) (`/jobs`) | word | Active job IDs at snapshot time. |

## Servers

Server records (see [Server](data.md#server)).

Indexed Columns:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `groups` | [Server.groups](data.md#server-groups) (`/groups`) | word | Group IDs (master list enabled). |
| `created` | [Server.created](data.md#server-created) (`/created`) | number | Created timestamp indexed at hour precision. |
| `modified` | [Server.modified](data.md#server-modified) (`/modified`) | number | Last modified timestamp indexed at hour precision. |
| `keywords` | [Server.keywords](data.md#server-keywords) (`/keywords`) | word | Search keywords (min 1, max 64 chars per word). |
| `os_platform` | [Server.info.os.platform](data.md#server-info) (`/info/os/platform`) | word | OS platform (filtered alphanumeric; master list/labels). |
| `os_distro` | [Server.info.os.distro](data.md#server-info) (`/info/os/distro`) | word | OS distribution (filtered alphanumeric; master list/labels). |
| `os_release` | [Server.info.os.release](data.md#server-info) (`/info/os/release`) | word | OS release/version (filtered alphanumeric; master list/labels). |
| `os_arch` | [Server.info.os.arch](data.md#server-info) (`/info/os/arch`) | word | CPU architecture (filtered alphanumeric; master list/labels). |
| `cpu_virt` | [Server.info.virt.vendor](data.md#server-info) (`/info/virt/vendor`) | word | Virtualization vendor (filtered alphanumeric; master list/labels). |
| `cpu_brand` | [Server.info.cpu.combo](data.md#server-info) (`/info/cpu/combo`) | word | CPU vendor/brand (filtered alphanumeric; master list/labels). |
| `cpu_cores` | [Server.info.cpu.cores](data.md#server-info) (`/info/cpu/cores`) | word | CPU core count (filtered alphanumeric; master list/labels). |

## Activity

User/system activity log (see [Activity](data.md#activity)).

Indexed Columns:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `action` | [Activity.action](data.md#activity-action) (`/action`) | word | Activity action identifier. |
| `keywords` | [Activity.keywords](data.md#activity-keywords) (`/keywords`) | word | Keywords for search (IDs, usernames, IPs). |
| `date` | [Activity.epoch](data.md#activity-epoch) (`/epoch`) | number | Activity timestamp indexed at hour precision. |

## Tickets

Ticket records (see [Ticket](data.md#ticket)).

Indexed Columns:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `type` | [Ticket.type](data.md#ticket-type) (`/type`) | word | Ticket type (`issue`, `feature`, `change`, `maintenance`, `question`, `other`). |
| `num` | [Ticket.num](data.md#ticket-num) (`/num`) | number | Auto-assigned ticket number. |
| `status` | [Ticket.status](data.md#ticket-status) (`/status`) | word | Ticket status (`open`, `closed`, `draft`). |
| `category` | [Ticket.category](data.md#ticket-category) (`/category`) | word | Category ID. |
| `username` | [Ticket.username](data.md#ticket-username) (`/username`) | word | Creator username (filtered alphanumeric). |
| `assignees` | [Ticket.assignees](data.md#ticket-assignees) (`/assignees`) | word | Assigned users (filtered alphanumeric array). |
| `cc` | [Ticket.cc](data.md#ticket-cc) (`/cc`) | word | Users CC’d (filtered alphanumeric array). |
| `jobs` | [Ticket](data.md#ticket) (`/jobs`) | word | Related job IDs. |
| `tags` | [Ticket.tags](data.md#ticket-tags) (`/tags`) | word | Tag IDs (master list enabled). |
| `created` | [Ticket.created](data.md#ticket-created) (`/created`) | number | Created timestamp indexed at hour precision. |
| `modified` | [Ticket.modified](data.md#ticket-modified) (`/modified`) | number | Last modified timestamp indexed at hour precision. |
| `due` | [Ticket.due](data.md#ticket-due) (`/due`) | date | Due date. |
| `server` | [Ticket.server](data.md#ticket-server) (`/server`) | word | Associated server ID. |
| `subject` | [Ticket.subject](data.md#ticket-subject) (`/subject`) | word | Short summary (FTS; stemming enabled). |
| `body` | [Ticket.body](data.md#ticket-body) (`[/username] [/subject] [/body]`) | word | Full-text search across username, subject and body (markdown filtered; stemming enabled). |
| `changes` | [Ticket.changes](data.md#ticket-changes) (`/changes`) | word | Full-text search across change log content (markdown filtered; stemming enabled). |

Sorters:

| Sorter ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `num` | [Ticket.num](data.md#ticket-num) (`/num`) | number | Sort by ticket number. |
| `modified` | [Ticket.modified](data.md#ticket-modified) (`/modified`) | number | Sort by last modified timestamp. |

## Column Properties

These are the common field properties supported by the indexer (see Indexer docs for full details):

- `id`: The column ID used in searches (e.g., `status:open`).
- `source`: Slash-delimited path to the source data field (can reference nested properties or multiple sources for FTS).
- `type`: Index type for the field or sorter. Omit for word indexes; may be `number` or `date` for fields, and `number` or `string` for sorters.
- `divide`: For numbers, divides the value before indexing. For dates, common value `3600` indexes at hour precision to improve performance.
- `min_word_length` / `max_word_length`: Bounds for token length in word indexes.
- `use_remove_words`: Toggle custom remove-word list.
- `use_stemmer`: Enable Porter stemming for word indexes.
- `filter`: Apply a filter prior to indexing (e.g., `alphanum`, `alphanum_array`, `markdown`).
- `master_list`: Maintain a master list of unique indexed values for quick summaries.
- `master_labels`: Maintain a master list of unique raw values (before filtering).
