import { ILike } from 'typeorm';
import { IPaginationQueryParams } from '@/types';
function setValue(object, path, value) {
  const way = path.replace(/\[/g, '.').replace(/\]/g, '').split('.'),
    last = way.pop();

  way.reduce(function (o, k, i, kk) {
    return (o[k] =
      o[k] || (isFinite(i + 1 in kk ? kk[i + 1] : last) ? [] : {}));
  }, object)[last] = value;
}
export class Pagination {
  limit: number;
  skip: number;
  order: 'ASC' | 'DESC';
  orderBy: string;
  page: number;
  search: string | null;

  constructor(params: IPaginationQueryParams) {
    this.limit = +(params?.pageSize ?? 10);
    this.page = +(params?.pageNumber ?? 1);
    this.skip = this.limit * (this.page - 1);
    this.order = params.sortOrder || 'ASC';
    this.orderBy = params.sortBy || 'id';
    this.search = params.searchQuery || null;
  }

  parse() {
    const options = {
      take: this.limit,
      skip: this.skip,
      order: {},
    };
    options.order[this.orderBy] = this.order;
    return options;
  }

  searchQuery(fields: string[], condition) {
    if (this.search == null) {
      return condition;
    } else {
      const searchWords = this.search.split(' ');
      const orArray = searchWords.map((word) => {
        const conditions = fields.map((field) => {
          const query = { ...condition };
          setValue(query, field, ILike(`%${word}%`));
          return query;
        });
        return conditions;
      });
      const flattenedArray = orArray.flat();
      return flattenedArray;
    }
  }
  searchArrQuery(fields: string[], conditionArr) {
    if (this.search == null) {
      return conditionArr;
    } else {
      const flattenedArray: object[] = [];
      conditionArr.map((condition) => {
        const searchWords = this.search ? this.search.split(' ') : [];
        const orArray = searchWords.map((word) => {
          const conditions = fields.map((field) => {
            const query = { ...condition };
            setValue(query, field, ILike(`%${word}%`));
            return query;
          });
          return conditions;
        });
        flattenedArray.push(orArray.flat());
      });
      return flattenedArray.flat();
    }
  }
}
