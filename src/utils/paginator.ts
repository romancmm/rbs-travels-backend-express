export const paginate = (page = 1, perPage = 10) => {
 const limit = Math.max(1, perPage)
 const skip = Math.max(0, (page - 1) * limit)
 return { skip, take: limit }
}

export const buildPagination = (page = 1, perPage = 10, total = 0, currentItems = 0) => {
 page = Number(page) || 1
 perPage = Number(perPage) || 1
 total = Number(total) || 0
 currentItems = Number(currentItems) || 0

 const totalPages = Math.ceil(total / perPage)
 return {
  page,
  limit: perPage,
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
