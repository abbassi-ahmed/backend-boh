import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FacebookProfile,
  InstagramProfile,
  TwitterProfile,
  User,
  YoutubeProfile,
} from '@/api-interfaces';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      YoutubeProfile,
      TwitterProfile,
      FacebookProfile,
      InstagramProfile,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
