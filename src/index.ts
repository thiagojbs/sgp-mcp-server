#!/usr/bin/env node

import dotenv from 'dotenv';
import { SGPMCPServer } from './mcp/server.js';
import { logger } from './utils/logger.js';

dotenv.config();

async function main() {
  try {
    const server = new SGPMCPServer();
    
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });

    await server.run();
  } catch (error) {
    logger.error('Failed to start SGP MCP Server', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Unhandled error in main', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  });
}