
export interface IPaginationQueryParams  {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    searchQuery?: string;
    activeStates?: string;
  }
  export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageCount: number;
  }
  export interface Attributes {
    name: string;
    isSortable?: boolean;
    isFilterable?: boolean;
    defaultFilter?: string | number | boolean;
    type: string;
    fields?: Attributes[];
    tableName?: string;
    displayed?: boolean;
    uniqueValues?: any[];
    uniqueValuescurrentPage?: number;
    filterValues?: any[];
    isMultipleFilter?: boolean;
  }
  
  export type QueryParams<T> = {
    [P in keyof T]?: string | number | boolean | Array<string | number | boolean>;
  };
  