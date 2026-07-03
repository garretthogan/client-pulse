import { createClientPulseApp } from './bootstrap';

async function bootstrap() {
  const app = await createClientPulseApp();
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

void bootstrap();
