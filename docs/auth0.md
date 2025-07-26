# Overview

OpsRocket supports [Auth0](https://auth0.com/) for 3rd party user authentication.  Using this optional integration you can enable features such as Single Sign On (SSO) through enterprise federation, social login, or Active Directory.  Auth0 is free for up to 7,000 active users, however they charge for enterprise features.

## Prerequisites

First, make sure you are using HTTPS with OpsRocket and have it all setup and working, with your own custom domain and a proper SSL certificate.  Follow our SSL guide for help with this (TODO: add link to HTTPS setup guide).

Second, your OpsRocket server(s) need to be able to make outbound HTTPS calls to `*.auth0.com`.  Make sure you have proper network routing and access in place for this.

## Setup

- Sign up for a free account at auth0.com, or login using your existing account.
- Go to **Settings** --> **General**
	- Add a **Friendly Name** for your configuration (i.e. company), and optionally a logo.
	- Select the environment (Dev, Staging, Production).
- Go to **Dashboard** --> **Applications** --> **Applications**
	- Add a new application or configure the default built-in one
	- Give your application a name, e.g. "OpsRocket"
	- Copy the following items, as you'll need them later:
		- Domain
		- Client ID
	- Change the Application Type to "**Single Page Application**".
		- Say yes to the scary warning dialog (sigh).
	- For specifying the **Application URIs** you will need to have your OpsRocket domain handy, e.g. `YourDomain.com`.
		- If you are running OpsRocket on a non-standard port, you'll need the port number, e.g. `YourDomain.com:5523`.
		- In the following steps, replace `YourDomain.com` with your own OpsRocket domain.
		- Set the **Application Login URI** to: `https://YourDomain.com/api/app/auth0_redir`.
		- Set the **Allowed Callback URLs** to: `https://YourDomain.com`.
		- Set the **Allowed Logout URLs** to: `https://YourDomain.com`.
		- Set the **Allowed Web Origins** to: `https://YourDomain.com`.
		- Set the **Allowed Origins (CORS)** to: `https://YourDomain.com`.
- Go to **Dashboard** --> **User Management** --> **Users**
	- Click "**+ Create User**" to create a test user.

## Next Steps

- Go to **Dashboard** --> **Authentication** --> **Enterprise** for setting up SAML, AD / LDAP, etc.
- Go to **Dashboard** --> **Applications** --> **SSO Integrations** for setting up SSO.
- Go to **Authentication** --> **Social** to disable Google login, which seems to be enabled by default.

## Configuration

Add this to your OpsRocket `config.json` file, on all of your master servers, as a top-level property:

```json
"auth0": {
	"enabled": true,
	"params": {
		"domain": "YOUR_AUTH0_DOMAIN",
		"client_id": "YOUR_AUTH0_CLIENTID"
	}
}
```

Replace `YOUR_AUTH0_DOMAIN` and `YOUR_AUTH0_CLIENTID` with the "Domain" and "Client ID" items you copied from the Auth0 UI earlier, respectively.

For details on other parameters you may want to specify here, see the [auth0-spa-js](https://www.npmjs.com/package/@auth0/auth0-spa-js) docs.

## Default User Privileges

Users are automatically added to OpsRocket's database when they first login using your Auth0 integration.  When this happens, a default set of privileges get applied, which can be configured in the OpsRocket `config.json` file, in the `Users` section:

```json
"default_privileges": {
	"create_events": 1,
	"edit_events": 1,
	"run_jobs": 1
}
```

## Administrators

To manually promote specific users to full administrators, you can use this command-line tool:

```sh
/opt/opsrocket/bin/storage-cli.js grant USERNAME PRIVILEGE
```

Replace `USERNAME` with the Auth0 username you want to promote, and `PRIVILEGE` with the privilege you want to grant, e.g. `admin` for administrator.  Example:

```sh
/opt/opsrocket/bin/storage-cli.js grant fred.smith admin
```

Make sure you first stop OpsRocket to run this script, and then start it again when you're finished:

```sh
/opt/opsrocket/bin/control.sh stop
/opt/opsrocket/bin/storage-cli.js grant fred.smith admin
/opt/opsrocket/bin/control.sh start
```

Once you login to OpsRocket with Auth0 as an administrator, you can promote other users to administrator right in the UI.  The CLI tool is typically only needed to bootstrap your first administrator accounts, when you first integrate Auth0.
