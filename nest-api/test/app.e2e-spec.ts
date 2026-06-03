import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should reject XSS payloads using javascript: schemes with 400 Bad Request [Regression Test]', async () => {
    const dangerousPayload = {
      long_url: 'javascript:alert(1)',
    };

    const response = await request(app.getHttpServer())
      .post('/links')
      .send(dangerousPayload)
      .set('Content-Type', 'application/json');

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('scheme is not allowed');
  });

  afterEach(async () => {
    await app.close();
  });
});
