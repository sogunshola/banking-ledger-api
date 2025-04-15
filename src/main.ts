import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { envConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle(envConfig.appName)
    .setDescription(`The ${envConfig.appName} API description`)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Auth module')
    .addTag('Account', 'Account module')
    .addTag('Transaction', 'Transaction module')
    .setExternalDoc('Postman Collection', '/swagger-json')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
    },
  });

  app.enableCors();

  await app.listen(envConfig.port || 3000, () => {
    console.log(
      `${envConfig.appName} running on port ${envConfig.port || 3000} 🚀`,
    );
  });
}
bootstrap();
