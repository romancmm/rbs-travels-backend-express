import { Prisma } from '@prisma/client'
import prisma from '../../config/db'
import { paginate } from '../../utils/paginator'

export class PageBuilderService {
  /**
   * Get all pages with pagination and filters
   */
  async getAllPages(
    page: number = 1,
    perPage: number = 10,
    filters?: {
      isPublished?: boolean
      search?: string
    }
  ) {
    const { skip, take } = paginate(page, perPage)
    const where: Prisma.PageBuilderWhereInput = {}

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.pageBuilder.findMany({
        where,
        skip,
        take,
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              rows: {
                orderBy: { order: 'asc' },
                include: {
                  columns: {
                    orderBy: { order: 'asc' },
                    include: {
                      components: {
                        orderBy: { order: 'asc' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pageBuilder.count({ where }),
    ])

    return { items, page, perPage, total }
  }

  /**
   * Get page by ID or slug
   */
  async getPage(identifier: string, includeUnpublished: boolean = false) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.PageBuilderWhereInput = isUUID ? { id: identifier } : { slug: identifier }

    if (!includeUnpublished) {
      where.isPublished = true
    }

    const pageData = await prisma.pageBuilder.findFirst({
      where,
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            rows: {
              orderBy: { order: 'asc' },
              include: {
                columns: {
                  orderBy: { order: 'asc' },
                  include: {
                    components: {
                      orderBy: { order: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    return pageData
  }

  /**
   * Create a new page
   */
  async createPage(data: {
    title: string
    slug: string
    description?: string
    sections?: any[]
    seo?: any
    isPublished?: boolean
  }) {
    // Check if slug already exists
    const existing = await prisma.pageBuilder.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      throw new Error(`Page with slug "${data.slug}" already exists`)
    }

    const pageData = await prisma.pageBuilder.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        seo: data.seo ?? {},
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
      },
    })

    // If sections are provided, create them
    if (data.sections && data.sections.length > 0) {
      for (const section of data.sections) {
        await this.addSection(pageData.id, section)
      }
    }

    return this.getPage(pageData.id, true)
  }

  /**
   * Update page
   */
  async updatePage(
    id: string,
    data: {
      title?: string
      slug?: string
      description?: string
      sections?: any[]
      seo?: any
      isPublished?: boolean
    }
  ) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    // Check if new slug already exists
    if (data.slug && data.slug !== pageData.slug) {
      const existing = await prisma.pageBuilder.findUnique({
        where: { slug: data.slug },
      })

      if (existing) {
        throw new Error(`Page with slug "${data.slug}" already exists`)
      }
    }

    const updateData: any = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      seo: data.seo,
      isPublished: data.isPublished,
    }

    // Set publishedAt when publishing for first time
    if (data.isPublished && !pageData.isPublished) {
      updateData.publishedAt = new Date()
    }

    // Update page basic info
    await prisma.pageBuilder.update({
      where: { id },
      data: updateData,
    })

    // If sections are provided, replace all sections
    if (data.sections !== undefined) {
      // Delete all existing sections (cascade will handle rows, columns, components)
      await prisma.section.deleteMany({ where: { pageId: id } })

      // Create new sections
      if (data.sections.length > 0) {
        for (const section of data.sections) {
          await this.addSection(id, section)
        }
      }
    }

    return this.getPage(id, true)
  }

  /**
   * Delete page
   */
  async deletePage(id: string) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    await prisma.pageBuilder.delete({ where: { id } })
  }

  /**
   * Duplicate page
   */
  async duplicatePage(id: string, newTitle: string, newSlug: string) {
    const original = await this.getPage(id, true)

    if (!original) {
      throw new Error('Page not found')
    }

    // Check if new slug already exists
    const existing = await prisma.pageBuilder.findUnique({
      where: { slug: newSlug },
    })

    if (existing) {
      throw new Error(`Page with slug "${newSlug}" already exists`)
    }

    // Create duplicate with all sections
    const duplicate = await this.createPage({
      title: newTitle,
      slug: newSlug,
      description: original.description ?? undefined,
      seo: original.seo as any,
      sections: original.sections.map((section) => ({
        name: section.name,
        order: section.order,
        settings: section.settings,
        rows: section.rows.map((row) => ({
          order: row.order,
          settings: row.settings,
          columns: row.columns.map((column) => ({
            width: column.width,
            order: column.order,
            settings: column.settings,
            components: column.components.map((component) => ({
              type: component.type,
              order: component.order,
              props: component.props,
            })),
          })),
        })),
      })),
      isPublished: false,
    })

    return duplicate
  }

  /**
   * Add section to page
   */
  async addSection(pageId: string, data: any) {
    const pageData = await prisma.pageBuilder.findUnique({
      where: { id: pageId },
    })

    if (!pageData) {
      throw new Error('Page not found')
    }

    const section = await prisma.section.create({
      data: {
        pageId,
        name: data.name,
        order: data.order ?? 0,
        settings: data.settings ?? {},
      },
    })

    // Create rows if provided
    if (data.rows && data.rows.length > 0) {
      for (const row of data.rows) {
        await this.addRow(pageId, section.id, row)
      }
    }

    return section
  }

  /**
   * Update section
   */
  async updateSection(pageId: string, sectionId: string, data: any) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, pageId },
    })

    if (!section) {
      throw new Error('Section not found')
    }

    const updated = await prisma.section.update({
      where: { id: sectionId },
      data: {
        name: data.name,
        order: data.order,
        settings: data.settings,
      },
    })

    // Update rows if provided
    if (data.rows !== undefined) {
      await prisma.row.deleteMany({ where: { sectionId } })

      if (data.rows.length > 0) {
        for (const row of data.rows) {
          await this.addRow(pageId, sectionId, row)
        }
      }
    }

    return updated
  }

  /**
   * Delete section
   */
  async deleteSection(pageId: string, sectionId: string) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, pageId },
    })

    if (!section) {
      throw new Error('Section not found')
    }

    await prisma.section.delete({ where: { id: sectionId } })
  }

  /**
   * Add row to section
   */
  async addRow(pageId: string, sectionId: string, data: any) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, pageId },
    })

    if (!section) {
      throw new Error('Section not found')
    }

    const row = await prisma.row.create({
      data: {
        sectionId,
        order: data.order ?? 0,
        settings: data.settings ?? {},
      },
    })

    // Create columns if provided
    if (data.columns && data.columns.length > 0) {
      for (const column of data.columns) {
        await this.addColumn(pageId, sectionId, row.id, column)
      }
    }

    return row
  }

  /**
   * Update row
   */
  async updateRow(pageId: string, sectionId: string, rowId: string, data: any) {
    const row = await prisma.row.findFirst({
      where: { id: rowId, sectionId },
      include: { section: true },
    })

    if (!row || row.section.pageId !== pageId) {
      throw new Error('Row not found')
    }

    const updated = await prisma.row.update({
      where: { id: rowId },
      data: {
        order: data.order,
        settings: data.settings,
      },
    })

    // Update columns if provided
    if (data.columns !== undefined) {
      await prisma.column.deleteMany({ where: { rowId } })

      if (data.columns.length > 0) {
        for (const column of data.columns) {
          await this.addColumn(pageId, sectionId, rowId, column)
        }
      }
    }

    return updated
  }

  /**
   * Delete row
   */
  async deleteRow(pageId: string, sectionId: string, rowId: string) {
    const row = await prisma.row.findFirst({
      where: { id: rowId, sectionId },
      include: { section: true },
    })

    if (!row || row.section.pageId !== pageId) {
      throw new Error('Row not found')
    }

    await prisma.row.delete({ where: { id: rowId } })
  }

  /**
   * Add column to row
   */
  async addColumn(pageId: string, sectionId: string, rowId: string, data: any) {
    const row = await prisma.row.findFirst({
      where: { id: rowId, sectionId },
      include: { section: true },
    })

    if (!row || row.section.pageId !== pageId) {
      throw new Error('Row not found')
    }

    const column = await prisma.column.create({
      data: {
        rowId,
        width: data.width ?? 12,
        order: data.order ?? 0,
        settings: data.settings ?? {},
      },
    })

    // Create components if provided
    if (data.components && data.components.length > 0) {
      for (const component of data.components) {
        await this.addComponent(pageId, sectionId, rowId, column.id, component)
      }
    }

    return column
  }

  /**
   * Update column
   */
  async updateColumn(
    pageId: string,
    sectionId: string,
    rowId: string,
    columnId: string,
    data: any
  ) {
    const column = await prisma.column.findFirst({
      where: { id: columnId, rowId },
      include: { row: { include: { section: true } } },
    })

    if (!column || column.row.section.pageId !== pageId) {
      throw new Error('Column not found')
    }

    const updated = await prisma.column.update({
      where: { id: columnId },
      data: {
        width: data.width,
        order: data.order,
        settings: data.settings,
      },
    })

    // Update components if provided
    if (data.components !== undefined) {
      await prisma.component.deleteMany({ where: { columnId } })

      if (data.components.length > 0) {
        for (const component of data.components) {
          await this.addComponent(pageId, sectionId, rowId, columnId, component)
        }
      }
    }

    return updated
  }

  /**
   * Delete column
   */
  async deleteColumn(pageId: string, sectionId: string, rowId: string, columnId: string) {
    const column = await prisma.column.findFirst({
      where: { id: columnId, rowId },
      include: { row: { include: { section: true } } },
    })

    if (!column || column.row.section.pageId !== pageId) {
      throw new Error('Column not found')
    }

    await prisma.column.delete({ where: { id: columnId } })
  }

  /**
   * Add component to column
   */
  async addComponent(
    pageId: string,
    sectionId: string,
    rowId: string,
    columnId: string,
    data: any
  ) {
    const column = await prisma.column.findFirst({
      where: { id: columnId, rowId },
      include: { row: { include: { section: true } } },
    })

    if (!column || column.row.section.pageId !== pageId) {
      throw new Error('Column not found')
    }

    const component = await prisma.component.create({
      data: {
        columnId,
        type: data.type,
        order: data.order ?? 0,
        props: data.props ?? {},
      },
    })

    return component
  }

  /**
   * Update component
   */
  async updateComponent(
    pageId: string,
    sectionId: string,
    rowId: string,
    columnId: string,
    componentId: string,
    data: any
  ) {
    const component = await prisma.component.findFirst({
      where: { id: componentId, columnId },
      include: { column: { include: { row: { include: { section: true } } } } },
    })

    if (!component || component.column.row.section.pageId !== pageId) {
      throw new Error('Component not found')
    }

    const updated = await prisma.component.update({
      where: { id: componentId },
      data: {
        type: data.type,
        order: data.order,
        props: data.props,
      },
    })

    return updated
  }

  /**
   * Delete component
   */
  async deleteComponent(
    pageId: string,
    sectionId: string,
    rowId: string,
    columnId: string,
    componentId: string
  ) {
    const component = await prisma.component.findFirst({
      where: { id: componentId, columnId },
      include: { column: { include: { row: { include: { section: true } } } } },
    })

    if (!component || component.column.row.section.pageId !== pageId) {
      throw new Error('Component not found')
    }

    await prisma.component.delete({ where: { id: componentId } })
  }
}

export default new PageBuilderService()
