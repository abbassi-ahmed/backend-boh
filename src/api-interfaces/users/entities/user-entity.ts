import { ApiProperty } from '@nestjs/swagger';
import { GenericEntity } from '../../generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Coach } from '@/api-interfaces';

@Entity()
export class User extends GenericEntity {
  @ApiProperty()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstname: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastname: string;

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

  @ApiProperty()
  @Column({
    type: 'varchar',
  })
  sex: 'male' | 'female';

  @ApiProperty()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  phone: string;

  @ManyToOne(() => Coach, (r) => r.clients)
  coach: Coach;
}
