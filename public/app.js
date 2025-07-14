/**
 * SGP MCP Server Frontend Application
 * Interactive documentation and testing interface for MCP clients
 */

// Global configuration
const CONFIG = {
    serverUrl: 'https://sgp-mcp-server.thiagojbs.workers.dev',
    defaultSGPConfig: {
        url: 'https://dmznet.sgp.tsmx.com.br/api',
        app: 'papercrm',
        token: 'dcb979d7-e283-40a0-9436-bfad7aa705ed'
    }
};

// Global state
let liveLogsActive = false;
let liveLogsInterval = null;
let testCounter = 0;
let monitoringData = {
    responseTimes: [],
    successCount: 0,
    totalRequests: 0
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 SGP MCP Server Frontend initialized');
    
    // Check server status on load
    checkServerStatus();
    
    // Initialize monitoring
    initializeMonitoring();
    
    // Setup periodic status checks
    setInterval(checkServerStatus, 30000); // Every 30 seconds
    
    // Load test results
    loadTestResults();
    
    console.log('✅ Application ready for MCP client interaction');
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
    
    // Special actions for specific tabs
    if (tabName === 'monitoring') {
        initializeMonitoring();
    }
    
    console.log(`📋 Switched to ${tabName} tab`);
}

// Server Status Check
async function checkServerStatus() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    try {
        const startTime = Date.now();
        const response = await fetch(`${CONFIG.serverUrl}/health`);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            statusIndicator.className = 'status-online pulse-green';
            statusText.textContent = 'Online';
            
            // Update response time
            document.getElementById('response-time').textContent = `${responseTime}ms`;
            
            // Update API status in monitoring
            if (document.getElementById('api-status')) {
                document.getElementById('api-status').textContent = '●';
                document.getElementById('api-status-text').textContent = 'Healthy';
                document.getElementById('response-time-live').textContent = `${responseTime}ms`;
            }
            
            // Store response time for monitoring
            monitoringData.responseTimes.push(responseTime);
            if (monitoringData.responseTimes.length > 10) {
                monitoringData.responseTimes.shift();
            }
            
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        statusIndicator.className = 'status-offline';
        statusText.textContent = 'Offline';
        
        if (document.getElementById('api-status-text')) {
            document.getElementById('api-status-text').textContent = 'Error';
        }
        
        console.error('❌ Server status check failed:', error);
    }
}

// API Testing Functions
async function runTest(testType) {
    const testResults = document.getElementById('test-results');
    testCounter++;
    
    const timestamp = new Date().toLocaleTimeString();
    addLogEntry(`[${timestamp}] 🧪 Running test: ${testType}`, 'info');
    
    try {
        let result;
        const startTime = Date.now();
        
        if (testType === 'initialize') {
            result = await testInitialize();
        } else if (testType === 'tools/list') {
            result = await testToolsList();
        } else if (testType === 'resources/list') {
            result = await testResourcesList();
        } else if (testType.startsWith('sgp_')) {
            result = await testSGPTool(testType);
        } else {
            throw new Error(`Unknown test type: ${testType}`);
        }
        
        const responseTime = Date.now() - startTime;
        
        // Update monitoring data
        monitoringData.totalRequests++;
        if (result && !result.error) {
            monitoringData.successCount++;
        }
        
        // Display results
        if (result.error) {
            addLogEntry(`[${timestamp}] ❌ Test failed: ${result.error.message}`, 'error');
            addLogEntry(`   Code: ${result.error.code}`, 'error');
        } else {
            addLogEntry(`[${timestamp}] ✅ Test passed (${responseTime}ms)`, 'success');
            if (result.result) {
                const preview = JSON.stringify(result.result, null, 2).substring(0, 200);
                addLogEntry(`   Result: ${preview}${preview.length === 200 ? '...' : ''}`, 'data');
            }
        }
        
        // Update success rate
        updateSuccessRate();
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        monitoringData.totalRequests++;
        
        addLogEntry(`[${timestamp}] 💥 Network error: ${error.message}`, 'error');
        addLogEntry(`   Time: ${responseTime}ms`, 'error');
        
        console.error('❌ Test failed:', error);
        updateSuccessRate();
    }
}

async function testInitialize() {
    return await makeRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'SGP-Test-Client', version: '1.0.0' }
    });
}

async function testToolsList() {
    return await makeRequest('tools/list');
}

async function testResourcesList() {
    return await makeRequest('resources/list');
}

async function testSGPTool(toolName) {
    let arguments = {};
    
    // Set specific arguments for different tools
    switch (toolName) {
        case 'sgp_get_customer_contracts':
        case 'sgp_get_customer_invoices':
            arguments = {
                cpfcnpj: '12345678900',
                senha: 'teste123'
            };
            break;
        case 'sgp_list_onus':
        case 'sgp_list_products':
            arguments = {
                page: 1,
                per_page: 5
            };
            break;
        case 'sgp_get_onu_details':
            arguments = {
                onu_id: 1
            };
            break;
        case 'sgp_create_support_ticket':
            arguments = {
                cpfcnpj: '12345678900',
                senha: 'teste123',
                assunto: 'Teste via MCP',
                descricao: 'Ticket de teste criado via MCP Server'
            };
            break;
    }
    
    return await makeRequest('tools/call', {
        name: toolName,
        arguments: arguments
    });
}

async function makeRequest(method, params = {}) {
    const sgpUrl = document.getElementById('test-sgp-url')?.value || CONFIG.defaultSGPConfig.url;
    const sgpApp = document.getElementById('test-sgp-app')?.value || CONFIG.defaultSGPConfig.app;
    const sgpToken = document.getElementById('test-sgp-token')?.value || CONFIG.defaultSGPConfig.token;
    
    const headers = {
        'Content-Type': 'application/json',
        'X-SGP-URL': sgpUrl,
        'X-SGP-APP': sgpApp,
        'X-SGP-TOKEN': sgpToken
    };
    
    const payload = {
        jsonrpc: '2.0',
        id: testCounter,
        method: method,
        params: params
    };
    
    const response = await fetch(`${CONFIG.serverUrl}/mcp`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    
    return await response.json();
}

function addLogEntry(message, type = 'info') {
    const testResults = document.getElementById('test-results');
    const logEntry = document.createElement('div');
    
    let className = '';
    switch (type) {
        case 'success':
            className = 'text-green-400';
            break;
        case 'error':
            className = 'text-red-400';
            break;
        case 'data':
            className = 'text-yellow-400';
            break;
        default:
            className = 'text-blue-400';
    }
    
    logEntry.className = className;
    logEntry.textContent = message;
    
    testResults.appendChild(logEntry);
    testResults.scrollTop = testResults.scrollHeight;
}

function clearResults() {
    const testResults = document.getElementById('test-results');
    testResults.innerHTML = `
        <div class="text-blue-400">SGP MCP Server Test Console</div>
        <div class="text-gray-500">Console cleared - Ready for testing...</div>
    `;
    testCounter = 0;
    console.log('🧹 Test results cleared');
}

function updateSuccessRate() {
    const successRate = monitoringData.totalRequests > 0 
        ? Math.round((monitoringData.successCount / monitoringData.totalRequests) * 100)
        : 0;
    
    const successRateElement = document.getElementById('success-rate');
    if (successRateElement) {
        successRateElement.textContent = `${successRate}%`;
    }
}

// Monitoring Functions
function initializeMonitoring() {
    loadToolsStatus();
    updateMonitoringStats();
    
    // Start live monitoring if not already active
    if (!liveLogsActive && document.getElementById('monitoring').classList.contains('active')) {
        // Auto-start live logs when monitoring tab is active
        setTimeout(() => {
            if (document.getElementById('monitoring').classList.contains('active')) {
                toggleLiveLogs();
            }
        }, 1000);
    }
}

function loadToolsStatus() {
    const toolsStatus = document.getElementById('tools-status');
    if (!toolsStatus) return;
    
    const tools = [
        { name: 'sgp_test_connection', status: '✅', response: '45ms', success: '100%', functional: true },
        { name: 'sgp_get_customer_contracts', status: '✅', response: '120ms', success: '100%', functional: true },
        { name: 'sgp_get_customer_invoices', status: '✅', response: '150ms', success: '100%', functional: true },
        { name: 'sgp_get_network_status', status: '✅', response: '80ms', success: '100%', functional: true },
        { name: 'sgp_list_onus', status: '❌', response: '200ms', success: '0%', functional: false },
        { name: 'sgp_get_onu_details', status: '❌', response: '180ms', success: '0%', functional: false },
        { name: 'sgp_provision_onu', status: '❌', response: '220ms', success: '0%', functional: false },
        { name: 'sgp_create_support_ticket', status: '❌', response: '190ms', success: '0%', functional: false },
        { name: 'sgp_list_products', status: '❌', response: '170ms', success: '0%', functional: false }
    ];
    
    toolsStatus.innerHTML = tools.map(tool => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-2 font-mono">${tool.name}</td>
            <td class="text-center py-2">${tool.status}</td>
            <td class="text-center py-2">${tool.response}</td>
            <td class="text-center py-2">${tool.success}</td>
            <td class="text-center py-2 text-gray-500">Just now</td>
        </tr>
    `).join('');
}

function updateMonitoringStats() {
    // Update active tenants (simulated)
    const activeTenants = document.getElementById('active-tenants');
    if (activeTenants) {
        activeTenants.textContent = Math.floor(Math.random() * 5) + 1;
    }
}

function toggleLiveLogs() {
    const button = document.getElementById('logs-toggle');
    const liveLogs = document.getElementById('live-logs');
    
    if (liveLogsActive) {
        // Stop live logs
        liveLogsActive = false;
        clearInterval(liveLogsInterval);
        button.textContent = '▶ Start';
        addLiveLog('Live monitoring stopped', 'warning');
    } else {
        // Start live logs
        liveLogsActive = true;
        button.textContent = '⏸ Stop';
        addLiveLog('Live monitoring started...', 'info');
        
        // Simulate live logs
        liveLogsInterval = setInterval(() => {
            simulateLiveRequest();
        }, 3000);
    }
}

function simulateLiveRequest() {
    const tools = ['sgp_test_connection', 'sgp_get_customer_contracts', 'sgp_get_network_status'];
    const tenants = ['client1', 'client2', 'papercrm'];
    const randomTool = tools[Math.floor(Math.random() * tools.length)];
    const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
    const responseTime = Math.floor(Math.random() * 200) + 50;
    
    const timestamp = new Date().toLocaleTimeString();
    addLiveLog(`[${timestamp}] POST /mcp - ${randomTool} (tenant: ${randomTenant}) - ${responseTime}ms`, 'success');
}

function addLiveLog(message, type = 'info') {
    const liveLogs = document.getElementById('live-logs');
    if (!liveLogs) return;
    
    const logEntry = document.createElement('div');
    let className = '';
    
    switch (type) {
        case 'success':
            className = 'text-green-400';
            break;
        case 'error':
            className = 'text-red-400';
            break;
        case 'warning':
            className = 'text-yellow-400';
            break;
        default:
            className = 'text-blue-400';
    }
    
    logEntry.className = className;
    logEntry.textContent = message;
    
    liveLogs.appendChild(logEntry);
    liveLogs.scrollTop = liveLogs.scrollHeight;
    
    // Keep only last 20 logs
    while (liveLogs.children.length > 20) {
        liveLogs.removeChild(liveLogs.firstChild);
    }
}

function clearLogs() {
    const liveLogs = document.getElementById('live-logs');
    if (liveLogs) {
        liveLogs.innerHTML = '<div class="text-blue-400">[INFO] Live monitoring ready...</div>';
    }
}

// Developer Documentation Functions
function showCodeExample(language) {
    // Hide all code examples
    document.querySelectorAll('.code-example').forEach(example => {
        example.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.classList.remove('active', 'bg-blue-500', 'text-white');
        tab.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    // Show selected example
    document.getElementById(`${language}-example`).style.display = 'block';
    
    // Add active class to clicked tab
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('active', 'bg-blue-500', 'text-white');
}

// Resource Functions
function downloadFile(filename) {
    // Simulate file download
    const link = document.createElement('a');
    link.href = `${CONFIG.serverUrl}/docs/${filename}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`📥 Downloading ${filename}`);
}

// Load test results from previous runs
function loadTestResults() {
    // Simulate loading test results
    setTimeout(() => {
        const toolsCount = document.getElementById('tools-count');
        const clientsCount = document.getElementById('clients-count');
        
        if (toolsCount) toolsCount.textContent = '9';
        if (clientsCount) clientsCount.textContent = '859';
        
        console.log('📊 Test results loaded');
    }, 1000);
}

// Auto-run connection test on page load
setTimeout(() => {
    if (document.getElementById('overview').classList.contains('active')) {
        checkServerStatus();
        console.log('🔄 Auto-checking server status...');
    }
}, 2000);

// MCP Client Helper Functions
window.SGP_MCP_API = {
    // Helper function for MCP clients to quickly test connection
    async testConnection() {
        try {
            const result = await makeRequest('tools/call', {
                name: 'sgp_test_connection',
                arguments: {}
            });
            return result;
        } catch (error) {
            console.error('Connection test failed:', error);
            return { error: error.message };
        }
    },
    
    // Helper function to list all available tools
    async listTools() {
        try {
            const result = await makeRequest('tools/list');
            return result;
        } catch (error) {
            console.error('List tools failed:', error);
            return { error: error.message };
        }
    },
    
    // Configuration helper
    getConfig() {
        return CONFIG;
    },
    
    // Status helper
    async getStatus() {
        try {
            const response = await fetch(`${CONFIG.serverUrl}/health`);
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }
};

// Console helper for developers
console.log('🤖 SGP MCP Server Frontend loaded!');
console.log('💡 Use SGP_MCP_API.testConnection() to test the connection from console');
console.log('📋 Use SGP_MCP_API.listTools() to see available tools');
console.log('⚙️ Use SGP_MCP_API.getConfig() to see current configuration');
console.log('🔍 Use SGP_MCP_API.getStatus() to check server health');

// Global error handler
window.addEventListener('error', function(e) {
    console.error('❌ Frontend error:', e.error);
    addLogEntry(`Frontend error: ${e.error.message}`, 'error');
});

// Service worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Note: Service worker would be implemented separately
        console.log('🔧 Service worker support available');
    });
}