import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DATABASE } from '@strength-tracker/db';
import { BadRequestException } from '@nestjs/common';

describe('AppController', () => {
  let app: TestingModule;
  let db;

  beforeAll(async () => {
    db = {
      execute: jest.fn().mockReturnValue({ rowCount: 2 }),
    };
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DATABASE,
          useValue: db,
        },
      ],
    }).compile();
  });

  describe('healthCheck', () => {
    it('should return info about the connection', async () => {
      const appController = app.get<AppController>(AppController);
      const resp = await appController.healthCheck();
      expect(resp).toEqual({ postgres: true });
    });

    describe('when Postgres is not working', () => {
      it('returns a 400 bad request', async () => {
        db.execute.mockRejectedValue('something went wrong');
        const appController = app.get<AppController>(AppController);
        try {
          await appController.healthCheck();
          expect(true).toEqual(false); // should not get here
        } catch (e) {
          expect(e).toEqual(new BadRequestException({ postgres: false }));
        }
      });
    });
  });
});
