import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  //TODO: Setup cors correctly
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((error) => ({
            field: error.property,
            errors: error.constraints ? Object.values(error.constraints) : [],
          })),
        );
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
