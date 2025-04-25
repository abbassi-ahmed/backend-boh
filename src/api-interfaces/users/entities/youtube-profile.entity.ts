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

  @Column({ nullable: true })
  channelId?: string;

  @Column({ type: 'json', nullable: true })
  channelStats?: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
    hiddenSubscriberCount: boolean;
  };

  @Column({ type: 'json', nullable: true })
  analytics?: {
    totalViews: number;
    totalWatchTime: number;
    totalSubscribers: number;
    recentStats: Array<{
      date: string;
      views: number;
      watchTime: number;
      subscribers: number;
    }>;
  };

  @OneToOne(() => User, (user) => user.youtubeProfile, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User;
}
