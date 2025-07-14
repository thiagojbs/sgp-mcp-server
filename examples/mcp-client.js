// Example MCP client usage
// This example shows how to integrate the SGP MCP Server with an MCP client

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function createSGPClient() {
  // Create transport to communicate with SGP MCP Server
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['../dist/index.js'],
    env: {
      SGP_BASE_URL: 'https://demo.sgp.net.br/api',
      SGP_API_TOKEN: 'your_api_token',
      SGP_APP_NAME: 'example-client'
    }
  });

  // Create MCP client
  const client = new Client({
    name: 'sgp-example-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  // Connect to the server
  await client.connect(transport);
  
  return client;
}

async function exampleUsage() {
  const client = await createSGPClient();

  try {
    // List available tools
    const toolsResponse = await client.listTools();
    console.log('Available tools:', toolsResponse.tools.map(t => t.name));

    // Example 1: Get customer contracts
    console.log('\\n--- Getting Customer Contracts ---');
    const contractsResult = await client.callTool({
      name: 'sgp_get_customer_contracts',
      arguments: {
        cpfcnpj: '12345678900',
        senha: 'customer_password'
      }
    });
    console.log('Contracts:', JSON.parse(contractsResult.content[0].text));

    // Example 2: List ONUs
    console.log('\\n--- Listing ONUs ---');
    const onusResult = await client.callTool({
      name: 'sgp_list_onus',
      arguments: {
        page: 1,
        per_page: 10
      }
    });
    console.log('ONUs:', JSON.parse(onusResult.content[0].text));

    // Example 3: Get network status
    console.log('\\n--- Getting Network Status ---');
    const statusResult = await client.callTool({
      name: 'sgp_get_network_status',
      arguments: {}
    });
    console.log('Network Status:', JSON.parse(statusResult.content[0].text));

    // Example 4: Create support ticket
    console.log('\\n--- Creating Support Ticket ---');
    const ticketResult = await client.callTool({
      name: 'sgp_create_support_ticket',
      arguments: {
        cpfcnpj: '12345678900',
        senha: 'customer_password',
        assunto: 'Connection Issue',
        descricao: 'Customer reports intermittent connection problems'
      }
    });
    console.log('Ticket Created:', JSON.parse(ticketResult.content[0].text));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage().catch(console.error);
}