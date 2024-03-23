import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app.module';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'https://molato.netlify.app/', // for frontend in production
      'https://molato.fun/', // for frontend in production
      'http://localhost:5173', // for frontend in development
    ],
    credentials: true,
    preflightContinue: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
  }
}
bootstrap();
