import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssemblyAI } from 'assemblyai';
import axios from 'axios';
import { Assembly } from '../entities/assemblyai.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AssemblyService {
  private readonly client: AssemblyAI;

  constructor(
    @InjectRepository(Assembly)
    private readonly assemblyRepository: Repository<Assembly>,
  ) {
    this.client = new AssemblyAI({
      apiKey: '77640269ad1041a1aa860a317e1fe9f9',
    });
  }
  async processAudio(fileUrl: string): Promise<any> {
    try {
      const transcript = await this.client.transcripts.transcribe({
        audio_url: fileUrl,
        auto_chapters: true,
        auto_highlights: true,
        language_detection: true,
      });

      const metadata = await this.generateMultiPlatformMetadata(
        transcript.text,
        transcript.language_code,
      );

      return this.structurePlatformContent(transcript.text, metadata);
    } catch (error) {
      throw new Error(`Audio processing failed: ${error.message}`);
    }
  }

  private async generateMultiPlatformMetadata(
    transcript: string | null | undefined,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!transcript) return;

      const languageMap: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
        ru: 'Russian',
        ja: 'Japanese',
        zh: 'Chinese',
        ar: 'Arabic',
        hi: 'Hindi',
      };

      const languageName = languageMap[languageCode] || 'English';

      const prompt = `
      Generate optimized content for YouTube, Facebook, Instagram, and TikTok based on this ${languageName} transcript:
      "${transcript.substring(0, 4000)}"
      
      IMPORTANT: 
      1. All output must be in ${languageName}
      2. Include optimal posting times based on:
         - Platform's best practices
         - Target audience location (estimate based on language)
         - Content type (video)
      3. For each platform, suggest:
         - Best days to post
         - Best time windows
         - Timezone to target
      
      Return in this EXACT JSON format:
      {
        "youtube": {
          "title": "Engaging YouTube title under 60 chars in ${languageName}",
          "description": "Detailed description (200-300 words) in ${languageName}",
          "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
          "posting_time": {
            "best_days": ["Day1", "Day2"],
            "best_hours": "XX:00-XX:00",
            "timezone": "Continent/City",
            "notes": "Platform-specific advice in ${languageName}"
          }
        },
        "facebook": {
          "title": "Facebook title under 80 chars in ${languageName}",
          "description": "Medium description (100-150 words) in ${languageName}",
          "tags": ["tag1", "tag2", "tag3"],
          "posting_time": {
            "best_days": ["Day1", "Day2"],
            "best_hours": "XX:00-XX:00",
            "timezone": "Continent/City",
            "notes": "Platform-specific advice in ${languageName}"
          }
        },
        "instagram": {
          "title": "Instagram title under 40 chars with emojis in ${languageName}",
          "description": "Short description with emojis (under 220 chars) in ${languageName}",
          "tags": ["tag1", "tag2", "tag3", "tag4"],
          "posting_time": {
            "best_days": ["Day1", "Day2"],
            "best_hours": "XX:00-XX:00",
            "timezone": "Continent/City",
            "notes": "Platform-specific advice in ${languageName}"
          }
        },
        "tiktok": {
          "title": "TikTok title under 50 chars with hashtags in ${languageName}",
          "description": "Very short description with hashtags (under 100 chars) in ${languageName}",
          "tags": ["tag1", "tag2", "trending"],
          "posting_time": {
            "best_days": ["Day1", "Day2"],
            "best_hours": "XX:00-XX:00",
            "timezone": "Continent/City",
            "notes": "Platform-specific advice in ${languageName}"
          }
        }
      }`;

      const response = await axios.post(
        'https://api.cohere.ai/generate',
        {
          prompt,
          max_tokens: 1200,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer euDydL1hENDpcPc84oIcAryFLnW8wkZRiWkZrGAi`,
            'Content-Type': 'application/json',
          },
        },
      );

      const jsonString = response.data.text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Metadata generation error:', error);
      throw new Error(`Metadata generation failed: ${error.message}`);
    }
  }

  private structurePlatformContent(
    transcription: string | null | undefined,
    metadata: any,
  ): any {
    if (!transcription) return;

    const firstWords = transcription.split(' ').slice(0, 5).join(' ');
    const fallbackTime = {
      best_days: ['Tuesday', 'Thursday'],
      best_hours: '09:00-11:00',
      timezone: 'UTC',
      notes: 'Consider testing different times for your specific audience',
    };

    const fallbackContent = {
      title: firstWords || 'Engaging Content',
      description:
        transcription.substring(0, 100) ||
        'Check out this interesting content!',
      tags: ['content', 'video'],
      posting_time: fallbackTime,
    };

    return {
      transcript: transcription,
      youtube: {
        title: metadata.youtube?.title || fallbackContent.title,
        description:
          metadata.youtube?.description || fallbackContent.description,
        tags: metadata.youtube?.tags || fallbackContent.tags,
        posting_time: metadata.youtube?.posting_time || fallbackTime,
      },
      facebook: {
        title: metadata.facebook?.title || fallbackContent.title,
        description:
          metadata.facebook?.description || fallbackContent.description,
        tags: metadata.facebook?.tags || fallbackContent.tags,
        posting_time: metadata.facebook?.posting_time || fallbackTime,
      },
      instagram: {
        title: metadata.instagram?.title || `${fallbackContent.title} ✨`,
        description:
          metadata.instagram?.description ||
          `${fallbackContent.description} 👆 Swipe up!`,
        tags: [
          ...(metadata.instagram?.tags || fallbackContent.tags),
          'instagram',
        ].slice(0, 5),
        posting_time: metadata.instagram?.posting_time || {
          ...fallbackTime,
          notes: 'Instagram Reels perform best in early mornings or evenings',
        },
      },
      tiktok: {
        title:
          metadata.tiktok?.title ||
          `${fallbackContent.title.substring(0, 40)} #fyp`,
        description:
          metadata.tiktok?.description ||
          `${fallbackContent.description.substring(0, 80)} #viral`,
        tags: [
          ...(metadata.tiktok?.tags || fallbackContent.tags),
          'fyp',
          'viral',
        ].slice(0, 5),
        posting_time: metadata.tiktok?.posting_time || {
          best_days: ['Wednesday', 'Friday'],
          best_hours: '11:00-13:00',
          timezone: 'UTC',
          notes: 'TikTok engagement peaks during lunch hours and late evenings',
        },
      },
      cross_platform_tips: {
        general_advice: 'Consider these additional tips:',
        recommendations: [
          'Post at least 3 times per week consistently',
          'Engage with comments in the first hour after posting',
          'Use platform-specific features (e.g., YouTube Chapters, Instagram Reels)',
          'Analyze your audience insights regularly to refine timing',
        ],
      },
    };
  }

  async create(createAssemblyDto: {
    transcript: string;
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
    tiktok: {
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
    cross_platform_tips?: {
      general_advice: string;
      recommendations: string[];
    };
    originalAudioUrl: string;
  }): Promise<Assembly> {
    const assembly = new Assembly();
    assembly.originalAudioUrl = createAssemblyDto.originalAudioUrl;
    assembly.transcript = createAssemblyDto.transcript;
    assembly.youtube = createAssemblyDto.youtube;
    assembly.facebook = createAssemblyDto.facebook;
    assembly.instagram = createAssemblyDto.instagram;
    assembly.tiktok = createAssemblyDto.tiktok;
    assembly.cross_platform_tips = createAssemblyDto.cross_platform_tips;

    return this.assemblyRepository.save(assembly);
  }

  async findAll(): Promise<Assembly[]> {
    return this.assemblyRepository.find();
  }

  async findOne(id: number): Promise<Assembly> {
    const assembly = await this.assemblyRepository.findOne({ where: { id } });
    if (!assembly) {
      throw new Error(`Assembly with id ${id} not found`);
    }
    return assembly;
  }

  async remove(id: string): Promise<void> {
    await this.assemblyRepository.delete(id);
  }
}
