import { buildApp } from './app.js';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = buildApp();

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    console.log(`Member Fitness API listening on http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
