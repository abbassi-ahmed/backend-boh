import { Entity, Column, OneToOne } from 'typeorm';
import { GenericEntity } from '../../generic.entity';
import { User } from './user-entity';

@Entity()
export class FacebookProfile extends GenericEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  profilePicUrl: string;

  @Column()
  facebookId: string;

  @OneToOne(() => User, (user) => user.facebookProfile, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User;
}
