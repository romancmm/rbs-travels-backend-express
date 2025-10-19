import prisma from '../src/utils/prisma'
async function main() {
 //   const userRole = await prisma.role.upsert({ where: { name: "admin" }, update: {}, create: { name: "admin" } });
 //   await prisma.role.upsert({ where: { name: "user" }, update: {}, create: { name: "user" } });
 await prisma.user.upsert({
  where: { email: 'admin@example.com' },
  update: {},
  create: {
   email: 'admin@example.com',
   password: '$2b$10$...',
   name: 'Admin',
   //    roleId: userRole.id,
  },
 })
}
main()
 .catch(console.error)
 .finally(() => prisma.$disconnect())
