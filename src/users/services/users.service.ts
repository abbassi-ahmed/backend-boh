import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IPaginatedResponse,
  IPaginationQueryParams,
  Pagination,
} from '@/types';
import {
  FacebookProfile,
  InstagramProfile,
  TwitterProfile,
  User,
  YoutubeProfile,
} from '@/api-interfaces';
import { CrudService } from '@/utils/generics/crud.service';
@Injectable()
export class UsersService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @InjectRepository(FacebookProfile)
    private facebookRepo: Repository<FacebookProfile>,

    @InjectRepository(InstagramProfile)
    private instagramRepo: Repository<InstagramProfile>,

    @InjectRepository(YoutubeProfile)
    private youtubeRepo: Repository<YoutubeProfile>,

    @InjectRepository(TwitterProfile)
    private twitterRepo: Repository<TwitterProfile>,
  ) {
    super(userRepository);
  }

  getFindOneRelations(): FindOptionsRelations<User> {
    return {
      facebookProfile: true,
      instagramProfile: true,
      youtubeProfile: true,
      twitterProfile: true,
    };
  }
  async create(dto) {
    return await this.saveAfterPopulation(dto);
  }

  async populate(dto: User) {
    const hash = await bcrypt.hash(dto.password, 10);

    return { ...dto, password: hash };
  }

  async populateUpdate(dto: User): Promise<User> {
    if (dto.password && dto.password !== '') {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return { ...dto };
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return await this.userRepository.findBy({ id: In(ids) });
  }

  async findAllPaginate(
    pagination: IPaginationQueryParams = {},
  ): Promise<IPaginatedResponse<User>> {
    const options = new Pagination(pagination);

    const params: any = {
      enabled: pagination?.activeStates === 'false' ? false : true,
    };

    const [data, total] = await this.userRepository.findAndCount({
      ...options.parse(),
      where: options.searchQuery(['firstname', 'lastname', 'email', 'phone'], {
        ...params,
      }),
      relations: this.getFindAllRelations(),
    });
    return this.paginate(data, total, options);
  }

  async partialUpdate(id: number, dto: Partial<User>) {
    await this.updateAfterPopulation(id, dto);
    return await this.findOneById(+id);
  }

  getFindAllRelations(): FindOptionsRelations<User> {
    return {};
  }

  async assignFacebookProfile(
    userId: number,
    profileDto: Partial<FacebookProfile>,
  ) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.facebookProfile) {
      if (user.facebookProfile?.id !== undefined) {
        await this.facebookRepo.update(user.facebookProfile.id, profileDto);
      } else {
        throw new Error('Facebook profile ID is undefined');
      }
      return this.findOneById(userId);
    }

    const fbProfile = this.facebookRepo.create(profileDto);
    fbProfile.user = user;
    await this.facebookRepo.save(fbProfile);

    await this.userRepository.update(userId, { facebookProfile: fbProfile });

    return this.findOneById(userId);
  }
  async unassignFacebookProfile(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.facebookProfile) {
      if (user.facebookProfile.id !== undefined) {
        await this.facebookRepo.delete(user.facebookProfile.id);
      } else {
        throw new Error('Facebook profile ID is undefined');
      }
      await this.userRepository.update(userId, { facebookProfile: null });
    }

    return this.findOneById(userId);
  }

  async assignInstagramProfile(
    userId: number,
    profileDto: Partial<InstagramProfile>,
  ) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const igProfile = this.instagramRepo.create(profileDto);
    igProfile.user = user;
    await this.instagramRepo.save(igProfile);
    user.instagramProfile = igProfile;
    return this.userRepository.save(user);
  }

  async unassignInstagramProfile(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    if (user.instagramProfile) {
      if (user.instagramProfile?.id !== undefined) {
        await this.instagramRepo.delete(user.instagramProfile.id);
      }
      user.instagramProfile = null;
      await this.userRepository.save(user);
    }
    return user;
  }

  async assignYoutubeProfile(
    userId: number,
    profileDto: Partial<YoutubeProfile>,
  ) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.youtubeProfile) {
      if (user.youtubeProfile?.id !== undefined) {
        await this.youtubeRepo.update(user.youtubeProfile.id, profileDto);
      } else {
        throw new Error('Youtube profile ID is undefined');
      }
      return this.findOneById(userId);
    }

    const ytProfile = this.youtubeRepo.create(profileDto);
    ytProfile.user = user;
    await this.youtubeRepo.save(ytProfile);

    await this.userRepository.update(userId, { youtubeProfile: ytProfile });

    return this.findOneById(userId);
  }

  async unassignYoutubeProfile(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    if (user.youtubeProfile) {
      if (user.youtubeProfile?.id) {
        await this.youtubeRepo.delete(user.youtubeProfile.id);
      }
      user.youtubeProfile = null;
      await this.userRepository.save(user);
    }
    return user;
  }

  async assignTwitterProfile(
    userId: number,
    profileDto: Partial<TwitterProfile>,
  ) {
    const user = await this.findOneById(userId);
    const tkProfile = this.twitterRepo.create(profileDto);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    tkProfile.user = user;
    await this.twitterRepo.save(tkProfile);
    user.twitterProfile = tkProfile;
    return this.userRepository.save(user);
  }

  async unassignTwitterProfile(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    if (user.twitterProfile) {
      if (user.twitterProfile?.id !== undefined) {
        await this.twitterRepo.delete(user.twitterProfile.id);
      }
      user.twitterProfile = null;
      await this.userRepository.save(user);
    }
    return user;
  }
}
