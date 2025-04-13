import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeUpdate,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class GenericEntity {
  @Index()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp',
    default: () => "date_trunc('second', (now() AT TIME ZONE 'UTC'))",
  })
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => "date_trunc('second', (now() AT TIME ZONE 'UTC'))",
  })
  modifiedAt?: Date;

  @BeforeUpdate()
  addModifiedAtDate? = () => {
    this.modifiedAt = new Date();
  };
}
