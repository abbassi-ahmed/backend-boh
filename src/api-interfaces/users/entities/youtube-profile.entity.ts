import { Entity, Column, OneToOne } from 'typeorm';
import { GenericEntity } from '../../generic.entity';
import { User } from './user-entity';

@Entity()
export class YoutubeProfile extends GenericEntity {
  @Column()
  username: string;

  @Column()
  subscribers: number;

  @Column()
  videos: number;

  @Column()
  views: number;

  @Column()
  verified: boolean;

  @Column()
  profilePic: string;

  @OneToOne(() => User, (user) => user.youtubeProfile)
  user: User;
}
