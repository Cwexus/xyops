# Plugin Marketplace

## Overview

xyOps has an integrated Plugin Marketplace, so you can expand the app's feature set by leveraging Plugins published both by PixlCore (the makers of xyOps), as well as the developer community.  To visit the marketplace, click the "**Marketplace**" link in the sidebar.

This document explains how to create and publish your own xyOps Plugins.  Marketplace Plugins are essentially cloud-hosted code libraries that self-download and self-execute, along with metadata to populate the marketplace listing, and define Plugin parameters for configuration.

The marketplace doesn't actually "host" Plugins -- it merely provides a search mechanism to discover them.  The Plugins themselves are hosted elsewhere on package repositories like NPM or GitHub, and the marketplace links to them.

## Requirements

To publish your xyOps Plugin to the marketplace, it must:

- Be free to use
	- The Plugin may need to access a 3rd party paid service, which is fine.
	- By "free" we mean that the Plugin itself doesn't cost any money to install (our marketplace has no "buy" button).
- Be hosted publicly on an accessible code sharing site.
	- Such as NPM, UV, GitHub, GitLab or BitBucket.
- Be able to execute using a self-contained download + launch combo command.
	- Examples of these include [npx](https://docs.npmjs.com/cli/commands/npx), [uvx](https://docs.astral.sh/uv/guides/tools/), [go run](https://pkg.go.dev/cmd/go#hdr-Compile_and_run_Go_program), and [docker run](https://docs.docker.com/reference/cli/docker/container/run/).
	- The command must download a specific tagged version or commit hash of the Plugin.
- Be fully open source using an [OSI-approved license](https://opensource.org/licenses).
	- All Plugin dependencies must also adhere to this requirement.
- Declare any user data or metrics collection.
	- If the Plugin collects user data for any reason, this must be declared in the [README](#readme).
	- An exception is when 3rd party services collect their own data, outside of the author's control.
- Be fully legal to use.
	- The Plugin must not violate any laws or terms of service, directly or indirectly.
- Be family friendly.
	- No adult content, bad language, etc.

PixlCore reserves the right to reject any Plugin submission it deems inappropriate for the marketplace.

## Launch Command

Your Plugin will need to be able to self-download and self-launch using a combo shell command.  These commands typically download software into a temporary cached directory, install all dependencies, and launch your Plugin all in one fell swoop.  Examples of these commands include:

- [npx](https://docs.npmjs.com/cli/commands/npx) - If your Plugin is written in Node.js, this is the perfect command to use.
- [uvx](https://docs.astral.sh/uv/guides/tools/) - If your Plugin is written in Python, then `uvx` is definitely the tool for you.
- [go run](https://pkg.go.dev/cmd/go#hdr-Compile_and_run_Go_program) - If your Plugin is written in Go, use `go run` which can download and run your Plugin using one command.
- [docker run](https://docs.docker.com/reference/cli/docker/container/run/) - If your Plugin ships as a docker container on a public container registry, then use `docker run`.

### npx

Here is an example command using `npx`.  The `-y` flag skips the user prompt.

```sh
npx -y @myorg/xyplug-example@1.0.0
```

This would download, install and run version `1.0.0` of the `xyplug-example` module from the `myorg` NPM org.

Your module does not actually need to be published to the NPM package registry.  It can simply live on GitHub, GitLab, or BitBucket, and have a version tag.  Example (GitHub):

```sh
npx -y github:myorg/xyplug-example#v1.0.0
```

This variant uses `npx` with a GitHub repo link, and an inline version tag (`#v1.0.0`).  Note that in this case the user would also need the `git` CLI, as that is how NPX resolves these types of package links.  So you would need to list `git` as an additional Plugin requirement (see [Plugin Requirements](#requirements) below).

To learn more about how to package up your Node.js project for NPX, and to see a live working demo, check out [xyplug-sample-npx](https://github.com/pixlcore/xyplug-sample-npx) on GitHub.

### uvx

Here is an example command using `uvx`:

```sh
uvx git+https://github.com/myorg/xyplug-example@v1.0.0
```

To learn more about how to package up your Python project for UVX, and to see a live working demo, check out [xyplug-sample-uvx](https://github.com/pixlcore/xyplug-sample-uvx) on GitHub.

### go run

Here is an example command using `go run`:

```sh
go run github.com/myorg/xyplug-example@v1.0.0
```

To learn more about how to package up your Go project for `go run`, and to see a live working demo, check out [xyplug-sample-go](https://github.com/pixlcore/xyplug-sample-go) on GitHub.

### docker run

Here is an example using `docker run`:

```sh
docker run --rm -i REGISTRY/OWNER/IMAGE:TAG
```

Here is an example of a fictional image on the GitHub Container Registry:

```sh
docker run --rm -i ghcr.io/myorg/xyplug-example:1.0.0
```

The `--rm` switch makes the container ephemeral, and the `-i` switch enables STDIN to pass into the entrypoint inside the container.

## Export Plugin Data

On the Plugin Edit screen, xyOps provides a "**Export...**" button.  Click this to download your Plugin in [xyOps Portable Data](xypdf.md) format.  Here is an example export:

```json
{
	"type": "xypdf",
	"version": "1.0",
	"description": "xyOps Portable Data",
	"items": [
		{
			"type": "plugin",
			"data": {
				"id": "pmb6q7bh3hy",
				"title": "Upload S3 File",
				"type": "event",
				"command": "npx -y github:myorg/xyplug-upload-s3-file#v1.0.0",
				"script": "",
				"icon": "aws",
				"notes": "Upload a local file to an S3 bucket.",
				"params": [
					{
						"id": "region",
						"title": "Region ID",
						"type": "text",
						"required": true
					},
					{
						"id": "bucket",
						"title": "Bucket Name",
						"type": "text",
						"required": true
					},
					{
						"id": "localPath",
						"title": "Local Path",
						"type": "text",
						"value": ""
					},
					{
						"id": "remotePath",
						"title": "Remote Path",
						"type": "text",
						"value": ""
					}
				]
			}
		}
	]
}
```

You will be prompted to upload this file on the marketplace submission page.

## README

Make sure your Plugin has a detailed `README.md` file at the root level of your code repository.  It should be in [Markdown](https://daringfireball.net/projects/markdown/syntax) format, specifically [GitHub-Flavored Markdown](https://github.github.com/gfm/).  This file will serve as your product details page when users click on your Plugin from the marketplace search results.  Your README should have the following:

- A detailed English description of what your Plugin does.
	- Non-English locales will be introduced soon.
- A list of the CLI requirements needed to install the Plugin.
	- e.g. `npx`, `git`, `uvx`, `go`, and/or `docker`.
- A list of all environment variables required by your Plugin.
	- e.g. API keys, auth tokens, secrets, etc.
- Declare any user data or metrics collection.
- Usage examples (nice-to-have).

## License

Make sure your Plugin has a `LICENSE.md` (or `LICENSE`) file at the root level of your code repository.

Note that it must be an [OSI-approved license](https://spdx.org/licenses/) to be eligible for inclusion in the marketplace.

## Marketplace Submission

When you are ready to publish your Plugin, head on over to the xyOps User Portal, and login or create an account:

https://xyops.io/

Note that you do **not** need a paid Professional or Enterprise account to publish on the marketplace.  A free account will do just fine.

On the Plugin submission page, you will be asked to provide the following:

- Your Plugin export file (upload).
- A title for your Plugin.  Displayed in bold in the marketplace.
- A short description of your Plugin.  Displayed under the title in the marketplace.
- Your name (or handle).  Also displayed in the marketplace.
- The location of your Plugin's source code repository.
- The current version number of the Plugin you are submitting.
- An optional image for the Plugin, which should be square (1:1 aspect ratio, i.e. icon format).
	- Alpha transparency is encouraged, PNG or WebP are best.
- The [SPDX Identifier](https://spdx.org/licenses/) for the open-source license your Plugin uses (must be OSI-approved).
- An optional keyword list for marketplace searches (freeform, user-defined).
- An array of which built-in commands need to be preinstalled in order to run use Plugin (`npx`, `uvx`, etc.).
- An optional list of environment variables needed by the Plugin.
	- If provided, the user will be prompted to create a [Secret Vault](secrets.md) to store them at install time. 

Note that all Plugin submissions are human-reviewed.  Please be prepared to wait several days before your Plugin is approved.  If your Plugin is denied, a xyOps team member will explain why, and help you to resubmit with the necessary changes to get approved.

## Self Distribution

You are free to distribute your Plugins outside the xyOps Marketplace.  To do so, simply [export](#export-plugin-data) your Plugin following the instructions above, and host your [xyOps Portable Data](xypdf.md) file on your own website, or share it as you would any digital file.  Anyone running xyOps with the proper account privileges (namely [create_plugins](privileges.md#create_plugins) and [edit_plugins](privileges.md#edit_plugins), or [admin](privileges.md#admin)) can import your Plugin.

It is recommended that you either:

- Configure your web server to include a `Content-Disposition: attachment` header, so browsers download the file when clicked, or...
- Gzip-compress the file first, and host the `.json.gz` version.

To import a self-distributed Plugin into xyOps, the user simply has to navigate to the Plugin List by clicking the "**Plugins**" link in the sidebar, and then click the "**Import File...**" button, or drag & drop the downloaded file onto the browser window.  They will then be prompted to import the Plugin, at which point it can immediately be used in events and workflows.

Note that it is up to the user to install the necessary prerequisites such as `npx`, `uvx`, etc.  These do come preinstalled on the official xyOps Docker container, so if the user installed xyOps via Docker, no additional software should need to be installed.
