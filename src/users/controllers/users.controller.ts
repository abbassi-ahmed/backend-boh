import { CreateUserDto, UpdateUserDto, User } from '@/api-interfaces';
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
}
