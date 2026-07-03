require('dotenv').config();

const required = ['DATABASE_URL', 'DIRECT_URL'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Missing required Vercel API environment variable(s): ${missing.join(', ')}`,
  );
  console.error(
    'Set these on the clientpulse-api project in Vercel Settings > Environment Variables, then redeploy.',
  );
  process.exit(1);
}

for (const key of required) {
  const value = process.env[key];

  try {
    const url = new URL(value);

    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
      throw new Error(`Expected postgres/postgresql protocol, got ${url.protocol}`);
    }

    console.log(
      `${key} present: host=${url.hostname}, database=${url.pathname.replace(/^\//, '') || '(missing)'}`,
    );
  } catch (error) {
    console.error(`${key} is not a valid PostgreSQL connection URL.`);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

if (!process.env.DATABASE_URL.includes('-pooler')) {
  console.warn('DATABASE_URL does not appear to use Neon pooling; this can still work for a small demo, but pooled URLs are better for Vercel serverless runtime.');
}
