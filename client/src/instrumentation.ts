export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('./server/config/logger');
    
    process.on('uncaughtException', (err) => {
      logger.error({ err }, 'Uncaught Exception detected');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled Rejection detected');
    });
    
    logger.info('Registered process-level exception handlers for crash resilience.');
  }
}
