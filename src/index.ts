import { env as config } from '@/config/env';
import { createServer } from '@/server';
import { logger } from '@/utils/logger';

const start = async () => {
  try {
    const server = await createServer();

    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        await server.close();
        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start the server
    await server.listen({
      port: config.PORT,
      host: config.HOST
    });

    logger.info(`Server is running on http://${config.HOST}:${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`Swagger UI available at: http://${config.HOST}:${config.PORT}/documentation`);
  } catch (error) {
    console.log({ error });

    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
