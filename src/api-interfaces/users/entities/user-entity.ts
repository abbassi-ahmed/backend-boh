import { ApiProperty } from '@nestjs/swagger';
import { GenericEntity } from '../../generic.entity';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { FacebookProfile } from './facebook-profile.entity';
import { InstagramProfile } from './instagram-profile.entity';
import { YoutubeProfile } from './youtube-profile.entity';
import { TiktokProfile } from './tiktok-profile.entity';
import { Type } from 'class-transformer';

@Entity()
export class User extends GenericEntity {
  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @ApiProperty()
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty()
  @Column({ type: 'varchar' })
  password: string;

  @OneToOne(() => FacebookProfile, (fb) => fb.user, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Type(() => FacebookProfile)
  facebookProfile: FacebookProfile | null;

  @OneToOne(() => InstagramProfile, (ig) => ig.user, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  instagramProfile: InstagramProfile | null;

  @OneToOne(() => YoutubeProfile, (yt) => yt.user, {
    cascade: true,
    onDelete: 'SET NULL',

    nullable: true,
  })
  @JoinColumn()
  youtubeProfile: YoutubeProfile | null;

  @OneToOne(() => TiktokProfile, (tk) => tk.user, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  tiktokProfile: TiktokProfile | null;
}
