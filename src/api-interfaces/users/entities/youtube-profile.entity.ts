import { Entity, Column, OneToOne } from 'typeorm';
import { GenericEntity } from '../../generic.entity';
import { User } from './user-entity';

@Entity()
export class YoutubeProfile extends GenericEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  profilePicUrl: string;

  @Column()
  youtubeId: string;

  @OneToOne(() => User, (user) => user.youtubeProfile, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User;
}
