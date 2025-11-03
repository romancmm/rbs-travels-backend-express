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
    where: { slug: 'header-menu' },
    update: {},
    create: {
      name: 'Header Menu',
      slug: 'header-menu',
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
        type: 'custom-link',
        link: '/',
        order: 0,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Services',
        type: 'custom-link',
        link: '/services',
        order: 1,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Projects',
        type: 'custom-link',
        link: '/projects',
        order: 2,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Blog',
        type: 'custom-link',
        link: '/blog',
        order: 3,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'About',
        type: 'custom-page',
        link: '/about',
        order: 4,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Contact',
        type: 'custom-page',
        link: '/contact',
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
        type: 'custom-page',
        link: '/privacy-policy',
        order: 0,
        isPublished: true,
      },
      {
        menuId: footerMenu.id,
        title: 'Terms of Service',
        type: 'custom-page',
        link: '/terms',
        order: 1,
        isPublished: true,
      },
      {
        menuId: footerMenu.id,
        title: 'FAQ',
        type: 'custom-page',
        link: '/faq',
        order: 2,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  // Seed Sample Page Builder Pages with JSON structure
  const homePage = await prisma.pageBuilder.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'Home Page',
      slug: 'home',
      description: 'Welcome to our travel agency',
      isPublished: true,
      publishedAt: new Date(),
      isDraft: false,
      content: {
        sections: [
          {
            id: 'hero-section',
            name: 'Hero Section',
            order: 0,
            settings: {
              backgroundColor: '#f0f0f0',
              padding: '60px 0',
            },
            rows: [
              {
                id: 'hero-row',
                order: 0,
                settings: {
                  columnsGap: '20px',
                },
                columns: [
                  {
                    id: 'hero-column',
                    width: 12,
                    order: 0,
                    settings: {
                      textAlign: 'center',
                    },
                    components: [
                      {
                        id: 'hero-banner',
                        type: 'banner',
                        order: 0,
                        props: {
                          title: 'Welcome to Your Dream Vacation',
                          subtitle: 'Discover amazing destinations around the world',
                          image: 'https://via.placeholder.com/1200x400',
                          cta: {
                            text: 'Explore Now',
                            link: '/services',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'features-section',
            name: 'Features Section',
            order: 1,
            settings: {
              backgroundColor: '#ffffff',
              padding: '40px 0',
            },
            rows: [
              {
                id: 'features-row',
                order: 0,
                settings: {
                  columnsGap: '30px',
                },
                columns: [
                  {
                    id: 'feature-column-1',
                    width: 4,
                    order: 0,
                    components: [
                      {
                        id: 'feature-card-1',
                        type: 'product-card',
                        order: 0,
                        props: {
                          title: 'Best Destinations',
                          description: 'Explore handpicked travel destinations',
                          icon: '🌍',
                          apiEndpoint: '/api/services?featured=true',
                        },
                      },
                    ],
                  },
                  {
                    id: 'feature-column-2',
                    width: 4,
                    order: 1,
                    components: [
                      {
                        id: 'feature-card-2',
                        type: 'product-card',
                        order: 0,
                        props: {
                          title: 'Affordable Packages',
                          description: 'Get the best deals for your vacation',
                          icon: '💰',
                          apiEndpoint: '/api/services?featured=true',
                        },
                      },
                    ],
                  },
                  {
                    id: 'feature-column-3',
                    width: 4,
                    order: 2,
                    components: [
                      {
                        id: 'feature-card-3',
                        type: 'product-card',
                        order: 0,
                        props: {
                          title: '24/7 Support',
                          description: 'We are here to help you anytime',
                          icon: '🎧',
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
      publishedContent: {
        sections: [
          {
            id: 'hero-section',
            name: 'Hero Section',
            order: 0,
            settings: {
              backgroundColor: '#f0f0f0',
              padding: '60px 0',
            },
            rows: [
              {
                id: 'hero-row',
                order: 0,
                settings: {
                  columnsGap: '20px',
                },
                columns: [
                  {
                    id: 'hero-column',
                    width: 12,
                    order: 0,
                    settings: {
                      textAlign: 'center',
                    },
                    components: [
                      {
                        id: 'hero-banner',
                        type: 'banner',
                        order: 0,
                        props: {
                          title: 'Welcome to Your Dream Vacation',
                          subtitle: 'Discover amazing destinations around the world',
                          image: 'https://via.placeholder.com/1200x400',
                          cta: {
                            text: 'Explore Now',
                            link: '/services',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'features-section',
            name: 'Features Section',
            order: 1,
            settings: {
              backgroundColor: '#ffffff',
              padding: '40px 0',
            },
            rows: [
              {
                id: 'features-row',
                order: 0,
                settings: {
                  columnsGap: '30px',
                },
                columns: [
                  {
                    id: 'feature-column-1',
                    width: 4,
                    order: 0,
                    components: [
                      {
                        id: 'feature-card-1',
                        type: 'product-card',
                        order: 0,
                        props: {
                          title: 'Best Destinations',
                          description: 'Explore handpicked travel destinations',
                          icon: '🌍',
                          apiEndpoint: '/api/services?featured=true',
                        },
                      },
                    ],
                  },
                  {
                    id: 'feature-column-2',
                    width: 4,
                    order: 1,
                    components: [
                      {
                        id: 'feature-card-2',
                        type: 'product-card',
                        order: 0,
                        props: {
                          title: 'Affordable Packages',
                          description: 'Get the best deals for your vacation',
                          icon: '💰',
                          apiEndpoint: '/api/services?featured=true',
                        },
                      },
                    ],
                  },
                  {
                    id: 'feature-column-3',
                    width: 4,
                    order: 2,
                    components: [
                      {
                        id: 'feature-card-3',
                        type: 'product-card',
                        order: 0,
                        props: {
                          title: '24/7 Support',
                          description: 'We are here to help you anytime',
                          icon: '🎧',
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
