import { Entity, Column, OneToOne } from 'typeorm';
import { GenericEntity } from '../../generic.entity';
import { User } from './user-entity';

@Entity()
export class TwitterProfile extends GenericEntity {
  @Column()
  username: string;

  @Column()
  followers: number;

  @Column()
  likes: number;

  @Column()
  videos: number;

  @Column()
  verified: boolean;

  @Column()
  profilePic: string;

  @OneToOne(() => User, (user) => user.twitterProfile)
  user: User;
}
