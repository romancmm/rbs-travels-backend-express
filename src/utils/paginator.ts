export const paginate = (page = 1, limit = 10) => {
 const take = Math.max(1, limit)
 const skip = Math.max(0, (page - 1) * take)
 return { skip, take }
}

export const buildPagination = (page = 1, limit = 10, total = 0, currentItems = 0) => {
 page = Number(page) || 1
 limit = Number(limit) || 1
 total = Number(total) || 0
 currentItems = Number(currentItems) || 0

 const totalPages = Math.ceil(total / limit)
 return {
  page,
  limit,
  totalItems: total,
  totalPages,
  currentItems,
  hasNext: page < totalPages,
  hasPrev: page > 1,
  nextPage: page < totalPages ? page + 1 : null,
  prevPage: page > 1 ? page - 1 : null,
  firstPage: 1,
  lastPage: totalPages,
 }
}
