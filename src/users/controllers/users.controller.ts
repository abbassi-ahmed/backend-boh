import {
  CreateUserDto,
  FacebookProfile,
  InstagramProfile,
  TwitterProfile,
  UpdateUserDto,
  User,
  YoutubeProfile,
} from '@/api-interfaces';
import { GenericController } from '@/utils/generics/crud.controller';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { IPaginationQueryParams } from '@/types';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@ApiTags('users')
export class UsersController extends GenericController<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Post()
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.saveAfterPopulation(dto);
  }
  @Get('all')
  findAllPaginated(@Query() params: IPaginationQueryParams) {
    return this.usersService.findAllPaginate(params);
  }

  @Patch('partial/:id')
  partialUpdate(@Param('id') id: string, @Body() updateUserDto: Partial<User>) {
    return this.usersService.partialUpdate(+id, updateUserDto);
  }

  //find user by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }
  @Post(':id/facebook')
  async assignFacebook(
    @Param('id') id: string,
    @Body() dto: Partial<FacebookProfile>,
  ) {
    return await this.usersService.assignFacebookProfile(+id, dto);
  }
  @Patch(':id/facebook/unassign')
  unassignFacebook(@Param('id') id: string) {
    return this.usersService.unassignFacebookProfile(+id);
  }

  @Post(':id/instagram')
  assignInstagram(
    @Param('id') id: string,
    @Body() dto: Partial<InstagramProfile>,
  ) {
    return this.usersService.assignInstagramProfile(+id, dto);
  }

  @Patch(':id/instagram/unassign')
  unassignInstagram(@Param('id') id: string) {
    return this.usersService.unassignInstagramProfile(+id);
  }

  @Post(':id/youtube')
  assignYoutube(@Param('id') id: string, @Body() dto: Partial<YoutubeProfile>) {
    return this.usersService.assignYoutubeProfile(+id, dto);
  }

  @Patch(':id/youtube/unassign')
  unassignYoutube(@Param('id') id: string) {
    return this.usersService.unassignYoutubeProfile(+id);
  }

  @Post(':id/twitter')
  assignTwitter(@Param('id') id: string, @Body() dto: Partial<TwitterProfile>) {
    return this.usersService.assignTwitterProfile(+id, dto);
  }

  @Patch(':id/twitter/unassign')
  unassignTwitter(@Param('id') id: string) {
    return this.usersService.unassignTwitterProfile(+id);
  }
}
