import { Entity, Column, OneToOne } from 'typeorm';
import { GenericEntity } from '../../generic.entity';
import { User } from './user-entity';

@Entity()
export class InstagramProfile extends GenericEntity {
  @Column()
  username: string;

  @Column()
  followers: number;

  @Column()
  following: number;

  @Column()
  posts: number;

  @Column()
  verified: boolean;

  @Column()
  profilePic: string;

  @OneToOne(() => User, (user) => user.instagramProfile)
  user: User;
}
