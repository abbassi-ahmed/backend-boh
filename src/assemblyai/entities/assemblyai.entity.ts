// src/assembly/entities/assembly.entity.ts
import { GenericEntity } from '@/api-interfaces';
import { Entity, Column } from 'typeorm';

@Entity()
export class Assembly extends GenericEntity {
  @Column()
  originalAudioUrl: string;

  @Column('text')
  transcript: string;

  @Column('jsonb')
  youtube: {
    title: string;
    description: string;
    tags: string[];
    posting_time: {
      best_days: string[];
      best_hours: string;
      timezone: string;
      notes: string;
    };
  };

  @Column('jsonb')
  facebook: {
    title: string;
    description: string;
    tags: string[];
    posting_time: {
      best_days: string[];
      best_hours: string;
      timezone: string;
      notes: string;
    };
  };

  @Column('jsonb')
  instagram: {
    title: string;
    description: string;
    tags: string[];
    posting_time: {
      best_days: string[];
      best_hours: string;
      timezone: string;
      notes: string;
    };
  };

  @Column('jsonb')
  twitter: {
    title: string;
    description: string;
    tags: string[];
    posting_time: {
      best_days: string[];
      best_hours: string;
      timezone: string;
      notes: string;
    };
  };

  @Column('jsonb', { nullable: true })
  cross_platform_tips?: {
    general_advice: string;
    recommendations: string[];
  };
}
