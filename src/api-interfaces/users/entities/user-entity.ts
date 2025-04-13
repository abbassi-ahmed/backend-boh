import { ApiProperty } from '@nestjs/swagger';
import { GenericEntity } from '../../generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class User extends GenericEntity {
  @ApiProperty()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
  })
  password: string;
}
