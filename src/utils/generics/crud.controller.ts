import { Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CrudService } from './crud.service';
import { ObjectLiteral } from 'typeorm';
import { QueryParams } from '@/types';

export class GenericController<
  T extends ObjectLiteral,
  CreateDto = T,
  UpdateDto = T,
> {
  constructor(private readonly service: CrudService<T>) {}

  @Post()
  async create(@Body() dto: CreateDto) {
    return await this.service.saveAfterPopulation(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDto | any) {
    return await this.service.updateAfterPopulation(+id, dto);
  }

  @Get()
  async findAll(@Query() params?: QueryParams<T>) {
    return await this.service.findAll(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOneById(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
