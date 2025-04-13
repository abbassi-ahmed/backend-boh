import { Injectable } from '@nestjs/common';
import { IPaginatedResponse, Pagination, QueryParams } from '../../types';
import {
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ObjectLiteral } from 'typeorm';

@Injectable()
export abstract class CrudService<T extends ObjectLiteral> {
  constructor(private repository: Repository<T>) {}

  async create(entity): Promise<T> {
    return await this.repository.save(entity);
  }

  async save(entity) {
    return await this.repository.save(entity);
  }

  async findAll(params?: QueryParams<T>) {
    return await this.repository.find({
      where: params as unknown as FindOptionsWhere<T>,
      relations: this.getFindAllRelations(),
      order: this.getFindAllOrderBy(),
    });
  }

  getFindAllRelations(): FindOptionsRelations<T> {
    return {} as FindOptionsRelations<T>;
  }
  getFindOneRelations(): FindOptionsRelations<T> {
    return {} as FindOptionsRelations<T>;
  }
  async findOne(conditions: FindOneOptions<T>) {
    return await this.repository.findOne(conditions);
  }
  async findOneById(id: number) {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations: this.getFindOneRelations(),
      order: this.getFindOneOrderBy(),
    });
    return entity;
  }
  async findId(conditions: FindOneOptions<T>) {
    return await this.repository.findOne(conditions);
  }
  getFindOneOrderBy(): FindOptionsOrder<T> {
    return {} as FindOptionsOrder<T>;
  }

  getFindAllOrderBy(): FindOptionsOrder<T> {
    return {} as FindOptionsOrder<T>;
  }

  async findMany(conditions: FindOneOptions<T>) {
    return await this.repository.find(conditions);
  }

  async update(id: number, updatedEntity: QueryDeepPartialEntity<T>) {
    return await this.repository.update(id, updatedEntity);
  }

  async remove(id: number) {
    return await this.repository.delete(id);
  }

  async deleteMany(conditions) {
    return this.repository.delete(conditions);
  }

  async saveAfterPopulation(dto): Promise<T> {
    return this.repository.save(
      this.repository.create(await this.populate(dto)),
    );
  }

  async updateAfterPopulation(id: number, updateDto) {
    await this.repository.save({
      ...(await this.populateUpdate(updateDto)),
      id: +id,
    });
    return await this.findOneById(id);
  }

  abstract populate(dto: unknown): Promise<T>;
  populateUpdate(dto: unknown): Promise<T> {
    return this.populate(dto);
  }

  paginate(
    data: T[],
    total: number,
    options: Pagination,
  ): Promise<IPaginatedResponse<T>> {
    return Promise.resolve({
      data,
      total,
      page: options.limit,
      pageCount: Math.ceil(total / options.limit),
    });
  }
}
