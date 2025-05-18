// twitter/twitter.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Post('post')
  async postTweet(@Body() body: { text: string; videoUrl?: string }) {
    try {
      const result = await this.twitterService.postTweet(
        body.text,
        body.videoUrl,
      );
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.detail ||
          error.message ||
          'Failed to post tweet',
      };
    }
  }
}
