// twitter/twitter.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

@Injectable()
export class TwitterService {
  private readonly consumerKey = 'M0pFRVR2SEVMQWZKeUNRaUJhQTA6MTpjaQ';
  private readonly consumerSecret =
    '8_0kl3rE368EZOa3ewSkHTB7XVbsJ9SBs4BdXZpvmEITwJV7nK';
  private readonly accessToken =
    '1589719224578088961-RI7uPVfCZoelDm9QL1fGOdvd9dHqHN';
  private readonly accessTokenSecret =
    'iUg02wxaOgJXALEHWGloKWla4KHJuCHDdnwRqijTLMUOm';

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
  async postTweet(text: string) {
    const endpointURL = 'https://api.twitter.com/2/tweets';
    const data = { text };

    const token = {
      key: this.accessToken,
      secret: this.accessTokenSecret,
    };

    const authData = this.oauth.authorize(
      {
        url: endpointURL,
        method: 'POST',
      },
      token,
    );

    const authHeader = this.oauth.toHeader(authData);

    // ADD THIS DEBUG LOG
    console.log('Generated Auth Header:', authHeader);
    console.log('Using Access Token:', this.accessToken);
    console.log('Using Token Secret:', this.accessTokenSecret);

    const response = await firstValueFrom(
      this.httpService.post(endpointURL, data, {
        headers: {
          Authorization: authHeader['Authorization'],
          'user-agent': 'v2CreateTweetJS',
          'content-type': 'application/json',
        },
      }),
    );

    return response.data;
  }
}
