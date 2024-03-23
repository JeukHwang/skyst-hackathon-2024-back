import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app.module';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:5173', // for frontend in development
      'https://molato.netlify.app/', // for frontend in production
    ],
    credentials: true,
  });
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
  }
}
bootstrap();
