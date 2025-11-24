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
    // Menu
    'menu.read',
    'menu.create',
    'menu.update',
    'menu.delete',
    // Page Builder
    'page.read',
    'page.create',
    'page.update',
    'page.delete',
  ]

  // Upsert all permissions (in smaller batches to avoid connection pool limits)
  const permissions = []
  for (const name of permissionNames) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    permissions.push(permission)
  }

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
    update: {
      isAdmin: true,
      isActive: true,
      roles: { set: [{ id: superAdminRole.id }] },
    },
    create: {
      email: superAdminEmail,
      password: superAdminPass,
      name: 'Super Admin',
      isActive: true,
      isAdmin: true,
      roles: { connect: [{ id: superAdminRole.id }] },
    },
  })

  // Create admin user with multiple roles (superadmin and admin)
  const adminEmail = 'admin@gmail.com'
  const adminPass = await hashPassword('secret')
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      isAdmin: true,
      isActive: true,
      roles: { set: [{ id: adminRole.id }, { id: editorRole.id }] },
    },
    create: {
      email: adminEmail,
      password: adminPass,
      name: 'Admin',
      isActive: true,
      isAdmin: true,
      roles: { connect: [{ id: adminRole.id }, { id: editorRole.id }] },
    },
  })

  // Seed Sample Menus
  const headerMenu = await prisma.menu.upsert({
    where: { slug: 'main-menu' },
    update: {},
    create: {
      name: 'Main Menu',
      slug: 'main-menu',
      position: 'header',
      description: 'Main navigation menu',
      isPublished: true,
    },
  })

  const footerMenu = await prisma.menu.upsert({
    where: { slug: 'footer-menu' },
    update: {},
    create: {
      name: 'Footer Menu',
      slug: 'footer-menu',
      position: 'footer',
      description: 'Footer navigation menu',
      isPublished: true,
    },
  })

  // Create menu items for header menu
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: headerMenu.id,
        title: 'Home',
        slug: 'home',
        type: 'custom',
        url: '/',
        order: 0,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Services',
        slug: 'services',
        type: 'custom',
        url: '/services',
        order: 1,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Projects',
        slug: 'projects',
        type: 'custom',
        url: '/projects',
        order: 2,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Blog',
        slug: 'blog',
        type: 'custom',
        url: '/blog',
        order: 3,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'About',
        slug: 'about',
        type: 'page',
        reference: 'about',
        url: '/about',
        order: 4,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Contact',
        slug: 'contact',
        type: 'page',
        reference: 'contact',
        url: '/contact',
        order: 5,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  // Create menu items for footer menu
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: footerMenu.id,
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        type: 'page',
        reference: 'privacy-policy',
        url: '/privacy-policy',
        order: 0,
        isPublished: true,
      },
      {
        menuId: footerMenu.id,
        title: 'Terms of Service',
        slug: 'terms-of-service',
        type: 'page',
        reference: 'terms-of-service',
        url: '/terms',
        order: 1,
        isPublished: true,
      },
      {
        menuId: footerMenu.id,
        title: 'FAQ',
        slug: 'faq',
        type: 'page',
        reference: 'faq',
        url: '/faq',
        order: 2,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  // Seed Sample Page Builder Pages with JSON content structure
  const homePage = await prisma.pageBuilder.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'Home Page',
      slug: 'home',
      description: 'Welcome to our travel agency',
      content: {
        sections: [
          {
            id: 'hero-section',
            name: 'Hero Section',
            order: 0,
            settings: {
              padding: { top: '60px', bottom: '60px', left: '0', right: '0' },
            },
            rows: [
              {
                id: 'hero-row',
                order: 0,
                settings: { columnsGap: '30px' },
                columns: [
                  {
                    id: 'hero-column',
                    order: 0,
                    width: 12,
                    components: [
                      {
                        id: 'hero-heading',
                        type: 'heading',
                        order: 0,
                        props: {
                          text: 'Welcome to Your Travel Agency',
                          level: 'h1',
                          align: 'center',
                          color: '#000000',
                          fontSize: '48px',
                          fontWeight: '700',
                          lineHeight: '1.2',
                        },
                      },
                      {
                        id: 'hero-text',
                        type: 'text',
                        order: 1,
                        props: {
                          text: 'Discover amazing destinations and create unforgettable memories with our expertly crafted travel experiences.',
                          align: 'center',
                          color: '#666666',
                          fontSize: '18px',
                          lineHeight: '1.6',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      isPublished: true,
      publishedAt: new Date(),
      seo: {
        title: 'Home - Your Travel Agency',
        description: 'Explore amazing destinations with us',
        keywords: ['travel', 'tours', 'vacation'],
      },
    },
  })

  console.log('✅ Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
