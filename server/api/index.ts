import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClientPulseApp } from '../src/bootstrap';

let appPromise: Promise<INestApplication> | undefined;

async function getApp() {
  appPromise ??= createClientPulseApp().then(async (app) => {
    await app.init();
    return app;
  });

  return appPromise;
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const app = await getApp();
  const expressInstance = app.getHttpAdapter().getInstance();

  return expressInstance(request, response);
}
