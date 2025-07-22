import { Paginated } from "../../../../../src/app/interfaces/paginated";

export class Pagination {
  totalCount: number;
  itemsPerPage: number;
  maxPage: number;
  page: number;
  pageList: number[];
  canDoNext: boolean;
  canDoPrevious: boolean;

  constructor({ meta }: Paginated<any>, public maxSize: number) {
    this.totalCount = meta.pagination.total;
    this.itemsPerPage = meta.pagination.limit;
    this.maxPage = Math.ceil(this.totalCount / this.itemsPerPage);
    this.page = Math.ceil(meta.pagination.start / meta.pagination.limit);
    this.pageList = this.computePageList(this.page, this.maxPage);
    this.canDoNext = this.page < this.maxPage;
    this.canDoPrevious = this.page > 1;
  }

  computePageList(currentPage: number, maxPage: number): number[] {
    const button_count = maxPage < this.maxSize ? maxPage : this.maxSize;

    // base case: if the set of pages is smalelr than the max size, return all pages
    if (maxPage <= this.maxSize) {
      return Array.from({ length: maxPage }, (_, i) => i + 1);
    }

    let startPage, endPage;
    const halfSize = Math.floor(this.maxSize / 2);

    // if the current page is less than half the max size, show the first max size pages
    if (currentPage <= halfSize) {
      startPage = 1;
      endPage = this.maxSize;
      // if we're at the end of the set of pages, show the last pages according to the max size
    } else if (halfSize + currentPage >= maxPage) {
      startPage = maxPage - this.maxSize + 1;
      endPage = maxPage;
    } else {
      // otherwise, show the pages around the current page
      startPage = currentPage - halfSize;
      endPage = currentPage + halfSize;
    }

    // Ensure the range is within bounds
    startPage = Math.max(1, startPage);
    endPage = Math.min(maxPage, endPage);

    // Create an array of the pages
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }
}
