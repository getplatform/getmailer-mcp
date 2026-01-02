# GetMailer MCP Server

[![MCP Badge](https://lobehub.com/badge/mcp/getmailer-getmailer-mcp)](https://lobehub.com/mcp/getmailer-getmailer-mcp)

MCP (Model Context Protocol) server for [GetMailer](https://getmailer.app) - Send transactional emails from AI assistants like Claude.

## Quick Start

The fastest way to get started is to sign up directly through MCP:

**1. Add the MCP server to Claude Desktop** (no API key needed yet):

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "getmailer": {
      "command": "npx",
      "args": ["getmailer-mcp"]
    }
  }
}
```

**2. Ask Claude to sign you up:**

> "Sign me up for GetMailer with email user@example.com and password MyPassword123"

**3. Claude will return your API key.** Update your config:

```json
{
  "mcpServers": {
    "getmailer": {
      "command": "npx",
      "args": ["getmailer-mcp"],
      "env": {
        "GETMAILER_API_KEY": "gm_your_api_key_here"
      }
    }
  }
}
```

**4. Restart Claude Desktop** and start sending emails!

## Installation

```bash
npm install -g getmailer-mcp
```

## Setup with Claude Desktop (Existing Users)

If you already have an API key, add this to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "getmailer": {
      "command": "npx",
      "args": ["getmailer-mcp"],
      "env": {
        "GETMAILER_API_KEY": "gm_your_api_key_here"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "getmailer": {
      "command": "getmailer-mcp",
      "env": {
        "GETMAILER_API_KEY": "gm_your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### signup

Create a new GetMailer account directly from Claude. Returns an API key and sends a verification email.

**Important:** You must verify your email before you can send emails. Check your inbox after signing up!

**Parameters:**
- `email` (required): Your email address (no disposable emails)
- `password` (required): Password (min 8 chars, must include uppercase, lowercase, and number)
- `name`: Your name (optional)

**Example:**
```
Sign me up for GetMailer with my email developer@example.com
```

### account_status

Check your account status including email verification, subscription plan, and sending limits.

**Parameters:** None

**Example:**
```
Check my GetMailer account status
```

**Returns:**
- Email verification status
- Subscription plan and remaining emails
- Number of verified domains
- Whether you can send emails
- Any required actions (verify email, add domain, etc.)

### send_email

Send a transactional email.

**Parameters:**
- `from` (required): Sender email address
- `to` (required): Array of recipient addresses
- `subject` (required): Email subject
- `html`: HTML content
- `text`: Plain text content
- `cc`: CC recipients
- `bcc`: BCC recipients
- `replyTo`: Reply-to address
- `templateId`: Template ID (instead of html/text)
- `variables`: Template variables

**Example:**
```
Send an email from hello@myapp.com to user@example.com with subject "Welcome!" and HTML content "<h1>Hello!</h1>"
```

### list_emails

List sent emails with status information.

**Parameters:**
- `limit`: Number of emails to return (default: 20)
- `cursor`: Pagination cursor

### get_email

Get details of a specific email including delivery events.

**Parameters:**
- `id` (required): Email ID

### list_templates

List available email templates.

### create_template

Create a new email template.

**Parameters:**
- `name` (required): Template name
- `subject` (required): Subject line (can include `{{variables}}`)
- `html` (required): HTML content (can include `{{variables}}`)
- `text`: Plain text content

### list_domains

List verified sending domains.

### add_domain

Add a new sending domain.

**Parameters:**
- `domain` (required): Domain name (e.g., example.com)

Returns DNS records that need to be configured.

### verify_domain

Check if a domain has been verified.

**Parameters:**
- `id` (required): Domain ID

### get_analytics

Get email analytics and statistics.

**Parameters:**
- `type`: "summary" or "daily"
- `days`: Number of days for daily stats

### list_suppression

List suppressed email addresses.

**Parameters:**
- `limit`: Number of entries to return

### add_to_suppression

Add email addresses to the suppression list.

**Parameters:**
- `emails` (required): Array of email addresses
- `reason`: MANUAL, BOUNCE, or COMPLAINT

### create_batch

Create a batch email job.

**Parameters:**
- `name` (required): Batch name
- `from` (required): Sender address
- `recipients` (required): Array of `{to, variables}` objects
- `subject`: Email subject
- `html`: HTML content
- `text`: Plain text content
- `templateId`: Template ID
- `replyTo`: Reply-to address

### list_batches

List batch email jobs.

### get_batch

Get batch job status and progress.

**Parameters:**
- `id` (required): Batch ID

## Usage Examples

Once configured, you can ask Claude:

- "Send an email to user@example.com from notifications@myapp.com saying their order has shipped"
- "List my recent emails"
- "Check the status of email abc123"
- "Create an email template for password resets"
- "Show me my email analytics for the past week"
- "Add user@spam.com to my suppression list"

## Environment Variables

- `GETMAILER_API_KEY`: Your GetMailer API key (optional for signup, required for other tools)
- `GETMAILER_API_URL`: Custom API URL (default: https://getmailer.app)

## Get Your API Key

**Option 1: Sign up via MCP** (Recommended)
- Use the `signup` tool directly from Claude - no web browser needed!

**Option 2: Sign up via web**
1. Sign up at [getmailer.app](https://getmailer.app)
2. Go to [API Keys](https://getmailer.app/api-keys)
3. Create a new API key

## Support

- Documentation: [getmailer.app/docs](https://getmailer.app/docs)
- Issues: [GitHub Issues](https://github.com/getmailer/getmailer/issues)
