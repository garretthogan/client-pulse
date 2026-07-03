import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { loadEnv } from './env';

function getAllowedOrigins() {
  const configuredOrigins =
    process.env.FRONTEND_URLS ??
    process.env.FRONTEND_URL ??
    'http://localhost:3000';

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isPreviewOrigin(origin: string) {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export async function createClientPulseApp(): Promise<INestApplication> {
  loadEnv();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('HTTP');
  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.VERCEL === '1' && isPreviewOrigin(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use((request: Request, _response: Response, next: NextFunction) => {
    logger.log(`${request.method} ${request.originalUrl}`);
    next();
  });

  return app;
}
