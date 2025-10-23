import prisma from '../src/utils/prisma'
async function main() {
   const userRole = await prisma.role.upsert({ where: { name: "admin" }, update: {}, create: { name: "admin" } });
   await prisma.role.upsert({ where: { name: "user" }, update: {}, create: { name: "user" } });
 await prisma.user.upsert({
  where: { email: 'admin@example.com' },
  update: {},
  create: {
   email: 'admin@gmail.com',
   password: 'secret', // In production, ensure to hash passwords
   name: 'Admin',
   isActive: true,
   isAdmin: true,
      roleId: userRole.id,
  },
 })
}
main()
 .catch(console.error)
 .finally(() => prisma.$disconnect())
