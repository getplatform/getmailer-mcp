# GetMailer MCP Server

MCP (Model Context Protocol) server for [GetMailer](https://getmailer.app) - Send transactional emails from AI assistants like Claude.

## Installation

```bash
npm install -g getmailer-mcp
```

## Setup with Claude Desktop

Add this to your Claude Desktop configuration file:

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

- `GETMAILER_API_KEY` (required): Your GetMailer API key
- `GETMAILER_API_URL`: Custom API URL (default: https://getmailer.app)

## Get Your API Key

1. Sign up at [getmailer.app](https://getmailer.app)
2. Go to [API Keys](https://getmailer.app/api-keys)
3. Create a new API key

## Support

- Documentation: [getmailer.app/docs](https://getmailer.app/docs)
- Issues: [GitHub Issues](https://github.com/getmailer/getmailer/issues)
