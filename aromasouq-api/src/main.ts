import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Paymob webhooks
  });

  // Compression middleware - reduces response size by 60-80%
  app.use(compression({
    threshold: 1024, // Only compress responses > 1KB
    level: 6,        // Balanced compression (1-9, default 6)
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser middleware
  app.use(cookieParser());

  // Build allowed origins list for CORS
  // Support both www and non-www versions, plus localhost for development
  const allowedOrigins: string[] = [];

  // Add configured frontend URL
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
    // If it's www, also add non-www version and vice versa
    if (frontendUrl.includes('://www.')) {
      allowedOrigins.push(frontendUrl.replace('://www.', '://'));
    } else if (frontendUrl.includes('://') && !frontendUrl.includes('://www.') && !frontendUrl.includes('localhost')) {
      allowedOrigins.push(frontendUrl.replace('://', '://www.'));
    }
  }

  // Always allow localhost for development
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3002');

  // Add production domains explicitly as fallback
  allowedOrigins.push('https://www.antiqueoud.com', 'https://antiqueoud.com');

  console.log('Allowed CORS origins:', allowedOrigins);

  // CORS configuration for cookie-based auth
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (*.vercel.app)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Log rejected origins for debugging
      console.warn('CORS rejected origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-Session'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  // Bind to 0.0.0.0 to accept connections from Railway/Docker proxy
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 AromaSouq API is running on port ${port}`);
}
bootstrap();
