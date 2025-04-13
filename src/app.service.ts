import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class AppService {
  getData(): { message: string } {
    console.log('', join(__dirname, '..', '..', '..', 'uploads/'));
    return { message: 'Hello API' };
  }
}
