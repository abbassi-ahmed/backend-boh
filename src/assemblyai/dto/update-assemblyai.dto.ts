import { PartialType } from '@nestjs/swagger';
import { CreateAssemblyaiDto } from './create-assemblyai.dto';

export class UpdateAssemblyaiDto extends PartialType(CreateAssemblyaiDto) {}
