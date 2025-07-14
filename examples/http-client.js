// Example HTTP client usage
// This example shows how to use the SGP MCP Server HTTP API directly

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

async function exampleHttpUsage() {
  try {
    // Check server health
    console.log('--- Server Health Check ---');
    const healthResponse = await api.get('/health');
    console.log('Health:', healthResponse.data);

    // Get API documentation
    console.log('\\n--- API Documentation ---');
    const docsResponse = await api.get('/docs');
    console.log('Available tools:', docsResponse.data.endpoints.tools.available_tools.length);

    // Example 1: Get customer contracts
    console.log('\\n--- Getting Customer Contracts ---');
    const contractsResponse = await api.post('/mcp/tools/get_customer_contracts', {
      cpfcnpj: '12345678900',
      senha: 'customer_password'
    });
    console.log('Contracts response:', contractsResponse.data);

    // Example 2: List ONUs with pagination
    console.log('\\n--- Listing ONUs ---');
    const onusResponse = await api.post('/mcp/tools/list_onus', {
      page: 1,
      per_page: 5
    });
    console.log('ONUs response:', onusResponse.data);

    // Example 3: Get ONU details
    console.log('\\n--- Getting ONU Details ---');
    const onuDetailsResponse = await api.post('/mcp/tools/get_onu_details', {
      onu_id: '123'
    });
    console.log('ONU details:', onuDetailsResponse.data);

    // Example 4: Get network status
    console.log('\\n--- Getting Network Status ---');
    const statusResponse = await api.post('/mcp/tools/get_network_status', {});
    console.log('Network status:', statusResponse.data);

    // Example 5: Create support ticket
    console.log('\\n--- Creating Support Ticket ---');
    const ticketResponse = await api.post('/mcp/tools/create_support_ticket', {
      cpfcnpj: '12345678900',
      senha: 'customer_password',
      assunto: 'Slow Connection',
      descricao: 'Customer reports very slow internet speed during peak hours',
      categoria_id: 1,
      prioridade_id: 2
    });
    console.log('Support ticket:', ticketResponse.data);

    // Example 6: Get customer invoices
    console.log('\\n--- Getting Customer Invoices ---');
    const invoicesResponse = await api.post('/mcp/tools/get_customer_invoices', {
      cpfcnpj: '12345678900',
      senha: 'customer_password'
    });
    console.log('Invoices:', invoicesResponse.data);

    // Example 7: List products
    console.log('\\n--- Listing Products ---');
    const productsResponse = await api.post('/mcp/tools/list_products', {
      page: 1,
      per_page: 10
    });
    console.log('Products:', productsResponse.data);

    // Example 8: ONU operations
    console.log('\\n--- ONU Operations ---');
    
    // Get ONU status
    const onuStatusResponse = await api.post('/mcp/tools/get_onu_status', {
      onu_id: '123'
    });
    console.log('ONU status:', onuStatusResponse.data);

    // Restart ONU (commented out to avoid actual restart)
    // const restartResponse = await api.post('/mcp/tools/restart_onu', {
    //   onu_id: '123'
    // });
    // console.log('ONU restart:', restartResponse.data);

  } catch (error) {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Function to demonstrate error handling
async function errorHandlingExample() {
  try {
    console.log('\\n--- Error Handling Example ---');
    
    // This should fail with invalid credentials
    const response = await api.post('/mcp/tools/get_customer_contracts', {
      cpfcnpj: 'invalid',
      senha: 'invalid'
    });
    console.log('This should not print');
    
  } catch (error) {
    if (error.response) {
      console.log('Expected error caught:', {
        status: error.response.status,
        message: error.response.data.message || error.response.data.error
      });
    }
  }
}

// Function to test invalid endpoints
async function invalidEndpointExample() {
  try {
    console.log('\\n--- Invalid Endpoint Example ---');
    
    const response = await api.post('/mcp/tools/non_existent_tool', {});
    console.log('This should not print');
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('404 error as expected:', error.response.data);
    }
  }
}

// Utility function to measure response time
async function performanceTest() {
  console.log('\\n--- Performance Test ---');
  
  const start = Date.now();
  
  try {
    await api.get('/health');
    const duration = Date.now() - start;
    console.log(`Health check completed in ${duration}ms`);
  } catch (error) {
    console.error('Performance test failed:', error.message);
  }
}

// Run examples
async function runAllExamples() {
  console.log('SGP MCP Server HTTP Client Examples\\n');
  console.log('Make sure the HTTP server is running on http://localhost:3000\\n');
  
  await exampleHttpUsage();
  await errorHandlingExample();
  await invalidEndpointExample();
  await performanceTest();
  
  console.log('\\n--- Examples completed ---');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}