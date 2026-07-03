import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

let cachedHandler: ReturnType<typeof serverless> | undefined;

async function bootstrap() {
  if (cachedHandler) {
    console.log('[bootstrap] using cached handler');
    return cachedHandler;
  }

  console.log('[bootstrap] creating express app');
  const expressApp = express();

  console.log('[bootstrap] calling NestFactory.create');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  console.log('[bootstrap] NestFactory.create done');

  const configService = app.get(ConfigService);

  app.enableCors({ origin: configService.get<string>('corsOrigin') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  console.log('[bootstrap] calling app.init()');
  await app.init();
  console.log('[bootstrap] app.init() done');

  cachedHandler = serverless(expressApp);
  console.log('[bootstrap] handler cached, bootstrap complete');
  return cachedHandler;
}

export default async (req: express.Request, res: express.Response) => {
  console.log('[handler] incoming request', req.method, req.url);
  const handler = await bootstrap();
  console.log('[handler] invoking express handler');
  const result = await handler(req, res);
  console.log('[handler] express handler resolved');
  return result;
};
