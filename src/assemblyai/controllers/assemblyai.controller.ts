// src/assembly/assembly.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Delete,
  Put,
} from '@nestjs/common';
import { AssemblyService } from '../services/assemblyai.service';

@Controller('assembly')
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  @Post('transcribe')
  async startTranscription(@Body('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      throw new HttpException('File URL is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.assemblyService.processAudio(fileUrl);
      return {
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createAssemblyDto: any) {
    return this.assemblyService.create(createAssemblyDto);
  }
  @Get()
  async findAll() {
    return this.assemblyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assemblyService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.assemblyService.remove(id);
  }
  @Put(':id/:platform')
  async updatePlatformData(
    @Param('id') id: number,
    @Param('platform') platform: string,
    @Body() updateData: { title: string; description: string; tags: string[] },
  ) {
    return this.assemblyService.update(
      id,
      platform,
      updateData.title,
      updateData.description,
      updateData.tags,
    );
  }
}
