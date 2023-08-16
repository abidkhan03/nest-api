import 'source-map-support/register';
import 'reflect-metadata';

if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}

import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

import { AppModule } from '@app/modules/main/app.module';
import { setupSwagger } from '@app/swagger';
import { TrimStringsPipe } from '@app/modules/common/transformer/trim-strings.pipe';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  app.enableCors();
  app.useGlobalPipes(
    new TrimStringsPipe(),
    new ValidationPipe({ whitelist: true }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
