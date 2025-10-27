import { hashPassword } from '../src/utils/password'
import prisma from '../src/utils/prisma'

async function main() {
  const permissionNames = [
    // Admin/user management
    'admin.read',
    'admin.create',
    'admin.update',
    'admin.delete',
    'role.read',
    'role.create',
    'role.update',
    'role.delete',
    'permission.read',
    'permission.create',
    'permission.update',
    'permission.delete',
    // Blog
    'post.read',
    'post.create',
    'post.update',
    'post.delete',
    'category.read',
    'category.create',
    'category.update',
    'category.delete',
    // Services & Projects
    'service.read',
    'service.create',
    'service.update',
    'service.delete',
    'project.read',
    'project.create',
    'project.update',
    'project.delete',
    // Customers
    'customer.list',
    'customer.get',
    'customer.create',
    'customer.update',
    'customer.delete',
    // Settings
    'setting.read',
    'setting.create',
    'setting.update',
    'setting.delete',
    // Media
    'media.read',
    'media.create',
    'media.delete',
  ]

  // Upsert all permissions
  const permissions = await Promise.all(
    permissionNames.map((name) =>
      prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
    )
  )

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: { name: 'superadmin' },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  })

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: { name: 'editor' },
  })

  // Attach permissions to roles
  await prisma.role.update({
    where: { id: superAdminRole.id },
    data: {
      permissions: { set: [], connect: permissions.map((p) => ({ id: p.id })) },
    },
  })

  // Admin gets most permissions (same as superadmin for now; adjust if needed)
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: { set: [], connect: permissions.map((p) => ({ id: p.id })) },
    },
  })

  // Editor gets content-centric permissions
  const editorPerms = permissionNames.filter((n) =>
    [
      'post.read',
      'post.create',
      'post.update',
      'category.read',
      'category.create',
      'category.update',
      'media.read',
      'media.create',
    ].includes(n)
  )
  await prisma.role.update({
    where: { id: editorRole.id },
    data: {
      permissions: { set: [], connect: editorPerms.map((name) => ({ name })) },
    },
  })

  // Create superadmin user (bypass checks by email)
  const superAdminEmail = 'superadmin@gmail.com'
  const superAdminPass = await hashPassword('supersecret')
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { roleId: superAdminRole.id, isAdmin: true, isActive: true },
    create: {
      email: superAdminEmail,
      password: superAdminPass,
      name: 'Super Admin',
      isActive: true,
      isAdmin: true,
      roleId: superAdminRole.id,
    },
  })

  // Create admin user
  const adminEmail = 'admin@gmail.com'
  const adminPass = await hashPassword('secret')
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { roleId: adminRole.id, isAdmin: true, isActive: true },
    create: {
      email: adminEmail,
      password: adminPass,
      name: 'Admin',
      isActive: true,
      isAdmin: true,
      roleId: adminRole.id,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
