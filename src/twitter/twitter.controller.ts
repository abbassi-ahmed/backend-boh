// twitter/twitter.controller.ts
import { Controller, Post, Body, Get, Redirect, Query } from '@nestjs/common';
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

  @Get('test')
  async test() {
    try {
      const result = await this.twitterService.getRequestToken();

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.detail ||
          error.message ||
          'Failed to get request token',
      };
    }
  }
  // twitter.controller.ts
  @Post('callback')
  async handleCallback(
    @Body() body: { oauth_token: string; oauth_verifier: string },
  ) {
    const tokenData = await this.twitterService.getAccessToken(
      body.oauth_token,
      body.oauth_verifier,
    );

    // Return the data directly instead of redirecting
    return {
      success: true,
      data: tokenData,
    };
  }
}
