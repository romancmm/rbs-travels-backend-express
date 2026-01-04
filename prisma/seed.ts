import prisma from '../src/config/db'
import { hashPassword } from '../src/utils/password'

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
        type: 'custom-link',
        url: '/',
        order: 0,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Services',
        slug: 'services',
        type: 'custom-link',
        url: '/services',
        order: 1,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Projects',
        slug: 'projects',
        type: 'custom-link',
        url: '/projects',
        order: 2,
        isPublished: true,
      },
      {
        menuId: headerMenu.id,
        title: 'Blog',
        slug: 'blog',
        type: 'custom-link',
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

  // Seed Categories
  const travelCategory = await prisma.category.upsert({
    where: { slug: 'travel-tips' },
    update: {},
    create: {
      name: 'Travel Tips',
      slug: 'travel-tips',
      description: 'Tips and tricks for better travel experiences',
    },
  })

  const destinationsCategory = await prisma.category.upsert({
    where: { slug: 'destinations' },
    update: {},
    create: {
      name: 'Destinations',
      slug: 'destinations',
      description: 'Explore amazing travel destinations around the world',
    },
  })

  const adventureCategory = await prisma.category.upsert({
    where: { slug: 'adventure' },
    update: {},
    create: {
      name: 'Adventure',
      slug: 'adventure',
      description: 'Adventure travel and outdoor activities',
    },
  })

  const budgetTravelCategory = await prisma.category.upsert({
    where: { slug: 'budget-travel' },
    update: {},
    create: {
      name: 'Budget Travel',
      slug: 'budget-travel',
      description: 'Travel on a budget without compromising experience',
    },
  })

  // Get the superadmin user to use as author
  const authorUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  // Seed Posts/Articles
  if (authorUser) {
    await prisma.post.upsert({
      where: { slug: '10-essential-travel-tips-for-beginners' },
      update: {},
      create: {
        title: '10 Essential Travel Tips for Beginners',
        slug: '10-essential-travel-tips-for-beginners',
        excerpt:
          'Starting your travel journey? Here are 10 essential tips every beginner traveler should know.',
        content: `
# 10 Essential Travel Tips for Beginners

Starting your travel journey can be both exciting and overwhelming. Here are 10 essential tips to help you get started:

1. **Plan Ahead but Stay Flexible** - Have a rough itinerary but leave room for spontaneity.
2. **Pack Light** - You'll thank yourself later when moving between destinations.
3. **Make Copies of Important Documents** - Keep digital and physical copies of your passport and travel documents.
4. **Get Travel Insurance** - Better safe than sorry!
5. **Learn Basic Local Phrases** - Even a simple "hello" and "thank you" goes a long way.
6. **Stay Connected** - Get a local SIM or international data plan.
7. **Keep Emergency Cash** - Not all places accept cards.
8. **Stay Aware of Your Surroundings** - Safety first, always.
9. **Try Local Food** - It's one of the best parts of traveling!
10. **Document Your Journey** - Take photos and keep a travel journal.

Happy travels!
        `,
        thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
        tags: ['tips', 'beginners', 'travel-guide'],
        isPublished: true,
        publishedAt: new Date(),
        authorId: authorUser.id,
        seo: {
          title: '10 Essential Travel Tips for Beginners | Your Travel Agency',
          description:
            'Starting your travel journey? Here are 10 essential tips every beginner traveler should know.',
          keywords: ['travel tips', 'beginner travel', 'travel guide'],
        },
        categories: {
          connect: [{ id: travelCategory.id }],
        },
      },
    })

    await prisma.post.upsert({
      where: { slug: 'top-5-european-destinations-for-2024' },
      update: {},
      create: {
        title: 'Top 5 European Destinations for 2024',
        slug: 'top-5-european-destinations-for-2024',
        excerpt: 'Discover the most beautiful and exciting European destinations to visit in 2024.',
        content: `
# Top 5 European Destinations for 2024

Europe offers countless amazing destinations. Here are our top 5 picks for 2024:

## 1. Barcelona, Spain
A perfect blend of beach, culture, and architecture. Don't miss Sagrada Familia and Park Güell!

## 2. Amsterdam, Netherlands
Canal tours, world-class museums, and a vibrant food scene await you.

## 3. Santorini, Greece
Stunning sunsets, white-washed buildings, and crystal-clear waters.

## 4. Prague, Czech Republic
Medieval architecture and affordable prices make Prague a must-visit.

## 5. Reykjavik, Iceland
Northern lights, hot springs, and dramatic landscapes.

Start planning your European adventure today!
        `,
        thumbnail: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b',
        tags: ['europe', 'destinations', '2024'],
        isPublished: true,
        publishedAt: new Date(),
        authorId: authorUser.id,
        seo: {
          title: 'Top 5 European Destinations for 2024 | Your Travel Agency',
          description:
            'Discover the most beautiful and exciting European destinations to visit in 2024.',
          keywords: ['europe travel', 'european destinations', 'travel 2024'],
        },
        categories: {
          connect: [{ id: destinationsCategory.id }, { id: travelCategory.id }],
        },
      },
    })

    await prisma.post.upsert({
      where: { slug: 'hiking-adventures-in-the-swiss-alps' },
      update: {},
      create: {
        title: 'Hiking Adventures in the Swiss Alps',
        slug: 'hiking-adventures-in-the-swiss-alps',
        excerpt: 'Experience breathtaking mountain views and challenging trails in the Swiss Alps.',
        content: `
# Hiking Adventures in the Swiss Alps

The Swiss Alps offer some of the most spectacular hiking trails in the world.

## Best Trails

### Eiger Trail
A challenging but rewarding trail with stunning views of the famous Eiger North Face.

### Matterhorn Glacier Trail
Experience glacier hiking with views of the iconic Matterhorn.

### Five Lakes Walk
Perfect for families, this trail takes you past five pristine mountain lakes.

## When to Visit
The best hiking season is from June to September when the weather is most stable.

## Essential Gear
- Sturdy hiking boots
- Layered clothing
- Water and snacks
- Map and compass/GPS
- First aid kit

Adventure awaits in the Swiss Alps!
        `,
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        tags: ['hiking', 'switzerland', 'mountains', 'outdoor'],
        isPublished: true,
        publishedAt: new Date(),
        authorId: authorUser.id,
        seo: {
          title: 'Hiking Adventures in the Swiss Alps | Your Travel Agency',
          description:
            'Experience breathtaking mountain views and challenging trails in the Swiss Alps.',
          keywords: ['swiss alps', 'hiking', 'mountain adventures', 'switzerland travel'],
        },
        categories: {
          connect: [{ id: adventureCategory.id }, { id: destinationsCategory.id }],
        },
      },
    })

    await prisma.post.upsert({
      where: { slug: 'budget-travel-guide-to-southeast-asia' },
      update: {},
      create: {
        title: 'Budget Travel Guide to Southeast Asia',
        slug: 'budget-travel-guide-to-southeast-asia',
        excerpt:
          'Explore Southeast Asia without breaking the bank with our comprehensive budget travel guide.',
        content: `
# Budget Travel Guide to Southeast Asia

Southeast Asia is a backpacker's paradise with affordable prices and incredible experiences.

## Cheap Destinations

### Thailand
Street food for $1-2, hostel beds for $5-10, and amazing beaches.

### Vietnam
Incredible cuisine, rich history, and very affordable accommodation.

### Cambodia
Home to Angkor Wat, with lodging starting at just $5 per night.

### Laos
Off the beaten path with pristine nature and low costs.

## Money-Saving Tips

1. **Eat Street Food** - Delicious and cheap!
2. **Use Local Transport** - Buses and trains are very affordable
3. **Stay in Hostels** - Meet other travelers and save money
4. **Bargain** - It's expected in markets
5. **Travel Slow** - Spending more time in fewer places saves money

You can travel Southeast Asia for as little as $30-40 per day!
        `,
        thumbnail: 'https://images.unsplash.com/photo-1528181304800-259b08848526',
        tags: ['budget', 'southeast-asia', 'backpacking', 'cheap-travel'],
        isPublished: true,
        publishedAt: new Date(),
        authorId: authorUser.id,
        seo: {
          title: 'Budget Travel Guide to Southeast Asia | Your Travel Agency',
          description:
            'Explore Southeast Asia without breaking the bank with our comprehensive budget travel guide.',
          keywords: ['budget travel', 'southeast asia', 'backpacking', 'cheap travel'],
        },
        categories: {
          connect: [{ id: budgetTravelCategory.id }, { id: travelCategory.id }],
        },
      },
    })

    // Create one unpublished draft post
    await prisma.post.upsert({
      where: { slug: 'upcoming-travel-trends-2025' },
      update: {},
      create: {
        title: 'Upcoming Travel Trends 2025 (Draft)',
        slug: 'upcoming-travel-trends-2025',
        excerpt: 'A preview of what to expect in travel for 2025 - coming soon!',
        content: 'Content in progress...',
        tags: ['trends', '2025', 'future'],
        isPublished: false,
        authorId: authorUser.id,
        seo: {
          title: 'Upcoming Travel Trends 2025',
          description: 'A preview of travel trends for 2025',
          keywords: ['travel trends', '2025', 'future of travel'],
        },
        categories: {
          connect: [{ id: travelCategory.id }],
        },
      },
    })
  }

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
