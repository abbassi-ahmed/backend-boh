import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IPaginatedResponse,
  IPaginationQueryParams,
  Pagination,
} from '@/types';
import { User } from '@/api-interfaces';
import { CrudService } from '@/utils/generics/crud.service';
@Injectable()
export class UsersService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  getFindOneRelations(): FindOptionsRelations<User> {
    return {};
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
}
