import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';
import { FormData } from 'formdata-node';
import { Blob } from 'buffer';
import axios from 'axios';

@Injectable()
export class TwitterService {
  private requestToken?: string;
  private requestTokenSecret?: string;

  private readonly consumerKey =
    process.env.TWITTER_CONSUMER_KEY || 'zowI2CkUx5O6VL7E2SYc13uU6';
  private readonly consumerSecret =
    process.env.TWITTER_CONSUMER_SECRET ||
    'UCFaJRClYtiLc1YYuzcZq95w9i7c9SiVj2qaPvj2xx7nA0Om8T';
  private accessToken =
    process.env.TWITTER_ACCESS_TOKEN ||
    '1589719224578088961-jZ2kX5wbEzQdiAPvddj6P0m4D1JxYQ';
  private accessTokenSecret =
    process.env.TWITTER_ACCESS_TOKEN_SECRET ||
    'MsETHImw0bC3h7WKrsftxzb2h7XqhNSXWmEa46IXeUjDl';

  private readonly oauth = new OAuth({
    consumer: {
      key: this.consumerKey,
      secret: this.consumerSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) =>
      crypto.createHmac('sha1', key).update(baseString).digest('base64'),
  });

  constructor(private readonly httpService: HttpService) {}
  // eslint-disable-next-line @typescript-eslint/require-await
  private async getAuthHeader(url: string, method: string = 'POST') {
    const token = {
      key: this.accessToken,
      secret: this.accessTokenSecret,
    };

    const authData = this.oauth.authorize({ url, method }, token);
    const header = this.oauth.toHeader(authData);

    return {
      ...header,
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
    };
  }

  async uploadMedia(videoUrl: string) {
    const uploadEndpoint = 'https://upload.twitter.com/1.1/media/upload.json';

    try {
      const videoResponse = await firstValueFrom(
        this.httpService.get(videoUrl, {
          responseType: 'arraybuffer',
          maxContentLength: 512 * 1024 * 1024,
          maxBodyLength: 512 * 1024 * 1024,
        }),
      );

      const videoBuffer = Buffer.from(videoResponse.data);

      const initFormData = new FormData();
      initFormData.append('command', 'INIT');
      initFormData.append('media_type', 'video/mp4');
      initFormData.append('total_bytes', videoBuffer.length.toString());
      initFormData.append('media_category', 'tweet_video');

      const initHeaders = await this.getAuthHeader(uploadEndpoint);
      const initResponse = await firstValueFrom(
        this.httpService.post(uploadEndpoint, initFormData, {
          headers: initHeaders,
        }),
      );

      const mediaId = initResponse.data.media_id_string;

      const chunkSize = 5 * 1024 * 1024;
      let segmentIndex = 0;

      for (let i = 0; i < videoBuffer.length; i += chunkSize) {
        const chunk = videoBuffer.slice(i, i + chunkSize);
        const appendFormData = new FormData();

        appendFormData.append('command', 'APPEND');
        appendFormData.append('media_id', mediaId);
        appendFormData.append('segment_index', segmentIndex.toString());
        appendFormData.append('media', new Blob([chunk]), 'video.mp4');

        const appendHeaders = await this.getAuthHeader(uploadEndpoint);
        await firstValueFrom(
          this.httpService.post(uploadEndpoint, appendFormData, {
            headers: appendHeaders,
          }),
        );

        segmentIndex++;
        console.log(`Uploaded chunk ${segmentIndex}`);
      }

      const finalizeFormData = new FormData();
      finalizeFormData.append('command', 'FINALIZE');
      finalizeFormData.append('media_id', mediaId);

      const finalizeHeaders = await this.getAuthHeader(uploadEndpoint);
      await firstValueFrom(
        this.httpService.post(uploadEndpoint, finalizeFormData, {
          headers: finalizeHeaders,
        }),
      );

      let status = 'pending';
      let attempts = 0;
      const maxAttempts = 30;

      while (status !== 'succeeded' && attempts < maxAttempts) {
        attempts++;
        const statusHeaders = await this.getAuthHeader(
          `${uploadEndpoint}?command=STATUS&media_id=${mediaId}`,
          'GET',
        );

        const statusResponse = await firstValueFrom(
          this.httpService.get(
            `${uploadEndpoint}?command=STATUS&media_id=${mediaId}`,
            { headers: statusHeaders },
          ),
        );

        status = statusResponse.data.processing_info?.state || 'pending';

        if (status === 'failed') {
          throw new Error(
            `Video processing failed: ${JSON.stringify(statusResponse.data)}`,
          );
        }

        if (status !== 'succeeded') {
          const waitTime =
            statusResponse.data.processing_info?.check_after_secs || 5;
          console.log(
            `Processing status: ${status}. Waiting ${waitTime} seconds...`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
        }
      }

      if (status !== 'succeeded') {
        throw new Error('Video processing timed out');
      }

      return mediaId;
    } catch (error) {
      console.error('Twitter Media Upload Error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      throw new Error(`Media upload failed: ${error.message}`);
    }
  }

  async postTweet(text: string, videoUrl?: string) {
    const endpointURL = 'https://api.twitter.com/2/tweets';

    try {
      const headers = await this.getAuthHeader(endpointURL);
      let mediaId;

      console.log(headers);
      if (videoUrl) {
        mediaId = await this.uploadMedia(videoUrl);
      }

      const tweetData: any = { text };
      if (mediaId) {
        tweetData.media = { media_ids: [mediaId] };
      }

      console.log(
        'Posting tweet with data:',
        JSON.stringify(tweetData, null, 2),
      );

      const response = await firstValueFrom(
        this.httpService.post(endpointURL, tweetData, {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'user-agent': 'v2CreateTweetJS',
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error('Twitter Post Error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      throw new Error(`Tweet post failed: ${error.message}`);
    }
  }
  async getRequestToken() {
    const requestTokenURL = 'https://api.x.com/oauth/request_token';

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({
        url: requestTokenURL,
        method: 'POST',
        data: { oauth_callback: 'http://localhost:5173/user/twitter-callback' },
      }),
    );

    const response = await firstValueFrom(
      this.httpService.post(
        requestTokenURL,
        {},
        {
          headers: {
            Authorization: authHeader['Authorization'],
          },
        },
      ),
    );

    const params = new URLSearchParams(response.data);
    this.requestToken = params.get('oauth_token') ?? undefined;
    this.requestTokenSecret = params.get('oauth_token_secret') ?? undefined;
    return {
      url: `https://api.twitter.com/oauth/authenticate?oauth_token=${this.requestToken}`,
    };
  }
  async getAccessToken(
    oauthToken: string,
    oauthVerifier: string,
  ): Promise<{
    oauth_token: string;
    oauth_token_secret: string;
    user_id: string;
    screen_name: string;
  }> {
    const accessTokenURL = 'https://api.twitter.com/oauth/access_token';

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({
        url: accessTokenURL,
        method: 'POST',
        data: { oauth_token: oauthToken, oauth_verifier: oauthVerifier },
      }),
    );

    const response = await firstValueFrom(
      this.httpService.post(
        accessTokenURL,
        {},
        {
          headers: {
            Authorization: authHeader['Authorization'],
          },
        },
      ),
    );

    const params = new URLSearchParams(response.data);
    this.accessToken = params.get('oauth_token') ?? '';
    this.accessTokenSecret = params.get('oauth_token_secret') ?? '';

    return {
      oauth_token: this.accessToken,
      oauth_token_secret: this.accessTokenSecret,
      user_id: params.get('user_id') ?? '',
      screen_name: params.get('screen_name') ?? '',
    };
  }

  async getPublicMetrics(userId: string) {
    try {
      const url = `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`;

      const headers = await this.getAuthHeader(url, 'GET');

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            ...headers,
            'user-agent': 'v2TwitterAnalyticsJS',
            'Content-Type': 'application/json',
          },
        }),
      );

      return { public_metrics: response.data };
    } catch (error) {
      console.error('Error fetching public_metrics:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      return {
        public_metrics: {
          error: error.message,
          details: error.response?.data,
        },
      };
    }
  }
}
