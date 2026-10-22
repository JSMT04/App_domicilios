import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  // ─── Global prefix ───────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ─── Global Pipes ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // Auto-transform payloads to DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters & Interceptors ───────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger / OpenAPI ───────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RapiPedido API')
    .setDescription(
      'API del sistema de domicilios RapiPedido — Monolito Modular con WebSockets para tracking GPS en tiempo real',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y registro de usuarios')
    .addTag('Catalog - Restaurants', 'Gestión de restaurantes')
    .addTag('Catalog - Menu', 'Gestión de categorías e ítems de menú')
    .addTag('Orders', 'Creación y gestión de pedidos (HU-02)')
    .addTag('Ratings', 'Sistema de calificaciones')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ─── Start server ────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════════╗
  ║         🛵 RapiPedido Backend             ║
  ╠══════════════════════════════════════════╣
  ║  API:     http://localhost:${port}/api/v1    ║
  ║  Swagger: http://localhost:${port}/api/docs  ║
  ║  WS:      ws://localhost:${port}/tracking    ║
  ╚══════════════════════════════════════════╝
  `);
}

bootstrap();
