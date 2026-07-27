export const paginate = (page = 0, limit = 10) => {
 const take = Math.max(1, limit)
 const skip = Math.max(0, page * take)
 return { skip, take }
}

export const buildPagination = (page = 0, limit = 10, total = 0, currentItems = 0) => {
 page = Number(page) || 0
 limit = Number(limit) || 1
 total = Number(total) || 0
 currentItems = Number(currentItems) || 0

 const totalPages = Math.ceil(total / limit)
 const lastPage = Math.max(totalPages - 1, 0)
 return {
  page,
  limit,
  totalItems: total,
  totalPages,
  currentItems,
  hasNext: page < lastPage,
  hasPrev: page > 0,
  nextPage: page < lastPage ? page + 1 : null,
  prevPage: page > 0 ? page - 1 : null,
  firstPage: 0,
  lastPage,
 }
}
