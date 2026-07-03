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
    return cachedHandler;
  }

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
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

  await app.init();
  cachedHandler = serverless(expressApp);
  return cachedHandler;
}

export default async (req: express.Request, res: express.Response) => {
  const handler = await bootstrap();
  return handler(req, res);
};
