#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Get API key from environment (optional - only required for authenticated tools)
const API_KEY = process.env.GETMAILER_API_KEY;
const API_URL = process.env.GETMAILER_API_URL || 'https://getmailer.app';

// Helper to check if API key is configured
function requireApiKey(): void {
  if (!API_KEY) {
    throw new Error(
      'GETMAILER_API_KEY is not configured. Use the signup tool to create an account and get an API key, then add it to your MCP config.'
    );
  }
}

// API helper for authenticated requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  requireApiKey();
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Ignore
    }
    throw new Error(`API Error: ${errorMessage}`);
  }

  return response.json();
}

// API helper for public (unauthenticated) requests
async function publicApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Ignore
    }
    throw new Error(`API Error: ${errorMessage}`);
  }

  return response.json();
}

// Create server
const server = new Server(
  {
    name: 'getmailer-mcp',
    version: '1.0.7',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'signup',
      description:
        'Create a new GetMailer account. Returns an API key that you can use to send emails. No authentication required.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          email: {
            type: 'string',
            description: 'Your email address',
          },
          password: {
            type: 'string',
            description:
              'Password (min 8 chars, must include uppercase, lowercase, and number)',
          },
          name: {
            type: 'string',
            description: 'Your name (optional)',
          },
        },
        required: ['email', 'password'],
      },
    },
    {
      name: 'account_status',
      description:
        'Check your account status including email verification, subscription plan, and sending limits. Use this to see if you can send emails.',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
    {
      name: 'send_email',
      description: 'Send a transactional email via GetMailer',
      inputSchema: {
        type: 'object' as const,
        properties: {
          from: {
            type: 'string',
            description: 'Sender email address (must be from a verified domain)',
          },
          to: {
            type: 'array',
            items: { type: 'string' },
            description: 'Recipient email address(es)',
          },
          subject: {
            type: 'string',
            description: 'Email subject line',
          },
          html: {
            type: 'string',
            description: 'HTML content of the email',
          },
          text: {
            type: 'string',
            description: 'Plain text content of the email',
          },
          cc: {
            type: 'array',
            items: { type: 'string' },
            description: 'CC recipients (optional)',
          },
          bcc: {
            type: 'array',
            items: { type: 'string' },
            description: 'BCC recipients (optional)',
          },
          replyTo: {
            type: 'string',
            description: 'Reply-to address (optional)',
          },
          templateId: {
            type: 'string',
            description: 'Template ID to use instead of html/text (optional)',
          },
          variables: {
            type: 'object',
            description: 'Template variables as key-value pairs (optional)',
          },
        },
        required: ['from', 'to', 'subject'],
      },
    },
    {
      name: 'list_emails',
      description: 'List sent emails with status information',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: 'Number of emails to return (default: 20)',
          },
          cursor: {
            type: 'string',
            description: 'Pagination cursor for next page',
          },
        },
      },
    },
    {
      name: 'get_email',
      description: 'Get details of a specific email including delivery events',
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'Email ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'list_templates',
      description: 'List available email templates',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
    {
      name: 'create_template',
      description: 'Create a new email template',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Template name',
          },
          subject: {
            type: 'string',
            description: 'Email subject (can include {{variables}})',
          },
          html: {
            type: 'string',
            description: 'HTML content (can include {{variables}})',
          },
          text: {
            type: 'string',
            description: 'Plain text content (optional)',
          },
        },
        required: ['name', 'subject', 'html'],
      },
    },
    {
      name: 'list_domains',
      description: 'List verified sending domains',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
    {
      name: 'add_domain',
      description: 'Add a new sending domain (returns DNS records to configure)',
      inputSchema: {
        type: 'object' as const,
        properties: {
          domain: {
            type: 'string',
            description: 'Domain name to add (e.g., example.com)',
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'verify_domain',
      description: 'Check if a domain has been verified',
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'Domain ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'get_analytics',
      description: 'Get email analytics and statistics',
      inputSchema: {
        type: 'object' as const,
        properties: {
          type: {
            type: 'string',
            enum: ['summary', 'daily'],
            description: 'Type of analytics (summary or daily)',
          },
          days: {
            type: 'number',
            description: 'Number of days for daily stats (default: 30)',
          },
        },
      },
    },
    {
      name: 'list_suppression',
      description: 'List suppressed email addresses (bounced, complained, or manually added)',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: 'Number of entries to return (default: 50)',
          },
        },
      },
    },
    {
      name: 'add_to_suppression',
      description: 'Add email addresses to the suppression list',
      inputSchema: {
        type: 'object' as const,
        properties: {
          emails: {
            type: 'array',
            items: { type: 'string' },
            description: 'Email addresses to suppress',
          },
          reason: {
            type: 'string',
            enum: ['MANUAL', 'BOUNCE', 'COMPLAINT'],
            description: 'Reason for suppression (default: MANUAL)',
          },
        },
        required: ['emails'],
      },
    },
    {
      name: 'create_batch',
      description: 'Create a batch email job to send to multiple recipients',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Batch job name',
          },
          from: {
            type: 'string',
            description: 'Sender email address',
          },
          subject: {
            type: 'string',
            description: 'Email subject (can include {{variables}})',
          },
          html: {
            type: 'string',
            description: 'HTML content (can include {{variables}})',
          },
          text: {
            type: 'string',
            description: 'Plain text content (optional)',
          },
          templateId: {
            type: 'string',
            description: 'Template ID to use instead of html/text (optional)',
          },
          recipients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                to: { type: 'string' },
                variables: { type: 'object' },
              },
              required: ['to'],
            },
            description: 'Array of recipients with optional per-recipient variables',
          },
          replyTo: {
            type: 'string',
            description: 'Reply-to address (optional)',
          },
        },
        required: ['name', 'from', 'recipients'],
      },
    },
    {
      name: 'list_batches',
      description: 'List batch email jobs',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
    {
      name: 'get_batch',
      description: 'Get batch job status and progress',
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'Batch ID',
          },
        },
        required: ['id'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'signup': {
        // Public endpoint - no API key required
        const result = await publicApiRequest<{
          success: boolean;
          user: { id: string; email: string; name?: string };
          apiKey: string;
          message: string;
          nextSteps: string[];
        }>('/api/public/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: args?.email,
            password: args?.password,
            name: args?.name,
          }),
        });

        const configInstructions = `
To start using GetMailer, add your API key to your MCP configuration:

Claude Desktop (claude_desktop_config.json):
{
  "mcpServers": {
    "getmailer": {
      "command": "npx",
      "args": ["getmailer-mcp"],
      "env": {
        "GETMAILER_API_KEY": "${result.apiKey}"
      }
    }
  }
}

Then restart your MCP client to apply the configuration.
`;

        return {
          content: [
            {
              type: 'text' as const,
              text:
                JSON.stringify(result, null, 2) +
                '\n\n--- Configuration Instructions ---\n' +
                configInstructions,
            },
          ],
        };
      }

      case 'account_status': {
        const result = await apiRequest<{
          account: { email: string; emailVerified: boolean };
          subscription: { plan: string; emailsRemaining: number | string } | null;
          domains: { verifiedCount: number };
          canSendEmails: boolean;
          warnings: Array<{ code: string; message: string }>;
        }>('/api/account/status');

        let statusMessage = `Account Status for ${result.account.email}\n`;
        statusMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Verification status
        if (result.account.emailVerified) {
          statusMessage += `✅ Email: Verified\n`;
        } else {
          statusMessage += `❌ Email: NOT VERIFIED\n`;
          statusMessage += `   → Check your inbox for the verification link!\n`;
        }

        // Subscription
        if (result.subscription) {
          statusMessage += `📦 Plan: ${result.subscription.plan}\n`;
          statusMessage += `📧 Emails remaining: ${result.subscription.emailsRemaining}\n`;
        }

        // Domains
        statusMessage += `🌐 Verified domains: ${result.domains.verifiedCount}\n`;

        // Can send?
        statusMessage += `\n`;
        if (result.canSendEmails) {
          statusMessage += `✅ You CAN send emails\n`;
        } else {
          statusMessage += `❌ You CANNOT send emails yet\n`;
          if (result.warnings.length > 0) {
            statusMessage += `\nRequired actions:\n`;
            result.warnings.forEach((w) => {
              statusMessage += `  • ${w.message}\n`;
            });
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: statusMessage,
            },
          ],
        };
      }

      case 'send_email': {
        const result = await apiRequest<{ email: unknown; suppressed?: string[] }>(
          '/api/emails',
          {
            method: 'POST',
            body: JSON.stringify(args),
          }
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_emails': {
        const params = new URLSearchParams();
        if (args?.limit) params.set('limit', String(args.limit));
        if (args?.cursor) params.set('cursor', String(args.cursor));
        const result = await apiRequest(`/api/emails?${params}`);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_email': {
        const result = await apiRequest(`/api/emails/${args?.id}`);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'list_templates': {
        const result = await apiRequest('/api/templates');
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'create_template': {
        const result = await apiRequest('/api/templates', {
          method: 'POST',
          body: JSON.stringify(args),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'list_domains': {
        const result = await apiRequest('/api/domains');
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'add_domain': {
        const result = await apiRequest('/api/domains', {
          method: 'POST',
          body: JSON.stringify({ domain: args?.domain }),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'verify_domain': {
        const result = await apiRequest('/api/domains/verify', {
          method: 'POST',
          body: JSON.stringify({ domainId: args?.id }),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_analytics': {
        const type = args?.type || 'summary';
        const days = args?.days || 30;
        const result = await apiRequest(`/api/analytics?type=${type}&days=${days}`);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'list_suppression': {
        const params = new URLSearchParams();
        if (args?.limit) params.set('limit', String(args.limit));
        const result = await apiRequest(`/api/suppression?${params}`);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'add_to_suppression': {
        const result = await apiRequest('/api/suppression', {
          method: 'POST',
          body: JSON.stringify({
            emails: args?.emails,
            reason: args?.reason || 'MANUAL',
          }),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'create_batch': {
        const result = await apiRequest('/api/batch', {
          method: 'POST',
          body: JSON.stringify(args),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'list_batches': {
        const result = await apiRequest('/api/batch');
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_batch': {
        const result = await apiRequest(`/api/batch/${args?.id}`);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text' as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GetMailer MCP server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
