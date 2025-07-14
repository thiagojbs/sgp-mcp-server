#!/usr/bin/env node

import dotenv from 'dotenv';
import { SGPHttpServer } from './server.js';
import { logger } from '../utils/logger.js';

dotenv.config();

async function main() {
  try {
    const server = new SGPHttpServer();
    await server.start();
  } catch (error) {
    logger.error('Failed to start SGP HTTP Server', { 
      error: error instanceof Error ? error.message : error 
    });
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Unhandled error in HTTP server main', { 
      error: error instanceof Error ? error.message : error 
    });
    process.exit(1);
  });
}