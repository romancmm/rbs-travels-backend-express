export const paginate = (page = 1, perPage = 10) => {
 const limit = Math.max(1, perPage)
 const skip = Math.max(0, (page - 1) * limit)
 return { skip, take: limit }
}
