/\*\*

- Frontend Menu Rendering Examples
-
- These are example implementations for rendering menu items
- in your frontend application (React, Vue, Angular, etc.) \*/

// ============================================ // React Example //
============================================

import React from 'react' import Link from 'next/link' // or react-router-dom import type { MenuItem
} from '@/types/menu.types'

interface MenuItemProps { item: MenuItem className?: string }

const MenuItemComponent: React.FC<MenuItemProps> = ({ item, className }) => { // Render based on
type switch (item.type) { case 'page': case 'post': case 'category': case 'service': case 'project':
// Internal entity links return ( <Link href={item.url || '#'} className={className ||
item.cssClass} > {item.icon && <span className="icon">{item.icon}</span>} {item.title} </Link> )

    case 'external':
      // External links - open in new tab
      return (
        <a
          href={item.url || '#'}
          target={item.target}
          rel="noopener noreferrer"
          className={className || item.cssClass}
        >
          {item.icon && <span className="icon">{item.icon}</span>}
          {item.title}
        </a>
      )

    case 'custom':
      // Custom internal links
      return (
        <Link
          href={item.url || '#'}
          className={className || item.cssClass}
        >
          {item.icon && <span className="icon">{item.icon}</span>}
          {item.title}
        </Link>
      )

    default:
      return <span className={className}>{item.title}</span>

} }

// Recursive menu with children const MenuTree: React.FC<{ items: MenuItem[] }> = ({ items }) => {
return ( <ul className="menu"> {items.map((item) => ( <li key={item.id} className={item.cssClass}>
<MenuItemComponent item={item} />

          {/* Render children recursively */}
          {item.children && item.children.length > 0 && (
            <ul className="submenu">
              <MenuTree items={item.children} />
            </ul>
          )}
        </li>
      ))}
    </ul>

) }

// ============================================ // Vue 3 Example //
============================================

/\* <template>

  <ul class="menu">
    <li 
      v-for="item in items" 
      :key="item.id" 
      :class="item.cssClass"
    >
      <!-- Entity Links -->
      <router-link 
        v-if="isEntityType(item.type)"
        :to="item.url || '#'"
        :class="item.cssClass"
      >
        <span v-if="item.icon" class="icon">{{ item.icon }}</span>
        {{ item.title }}
      </router-link>

      <!-- External Links -->
      <a
        v-else-if="item.type === 'external'"
        :href="item.url"
        :target="item.target"
        rel="noopener noreferrer"
        :class="item.cssClass"
      >
        <span v-if="item.icon" class="icon">{{ item.icon }}</span>
        {{ item.title }}
      </a>

      <!-- Custom Links -->
      <router-link
        v-else-if="item.type === 'custom'"
        :to="item.url || '#'"
        :class="item.cssClass"
      >
        <span v-if="item.icon" class="icon">{{ item.icon }}</span>
        {{ item.title }}
      </router-link>

      <!-- Fallback -->
      <span v-else>{{ item.title }}</span>

      <!-- Children (Recursive) -->
      <MenuTree
        v-if="item.children && item.children.length > 0"
        :items="item.children"
        class="submenu"
      />
    </li>

  </ul>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/menu.types'

interface Props {
  items: MenuItem[]
}

defineProps<Props>()

const isEntityType = (type: string) => {
  return ['page', 'post', 'category', 'service', 'project'].includes(type)
}
</script>

\*/

// ============================================ // Vanilla JavaScript/TypeScript //
============================================

function renderMenuItem(item: MenuItem): string { const icon = item.icon ?
`<span class="icon">${item.icon}</span>` : '' const cssClass = item.cssClass || ''

switch (item.type) { case 'page': case 'post': case 'category': case 'service': case 'project': case
'custom': return ` <a href="${item.url || '#'}" class="${cssClass}"> ${icon}${item.title} </a> `

    case 'external':
      return `
        <a
          href="${item.url || '#'}"
          target="${item.target}"
          rel="noopener noreferrer"
          class="${cssClass}"
        >
          ${icon}${item.title}
        </a>
      `

    default:
      return `<span class="${cssClass}">${item.title}</span>`

} }

function renderMenuTree(items: MenuItem[]): string { return
` <ul class="menu"> ${items .map((item) => { const children = item.children && item.children.length > 0 ?`<ul class="submenu">${renderMenuTree(item.children)}</ul>`
: ''

          return `
            <li class="${item.cssClass || ''}" data-item-id="${item.id}">
              ${renderMenuItem(item)}
              ${children}
            </li>
          `
        })
        .join('')}
    </ul>

` }

// ============================================ // Usage Example - Fetching and Rendering //
============================================

async function loadAndRenderMenu(menuSlug: string) { try { // Fetch menu from API const response =
await fetch(`/api/menus/${menuSlug}`) const data = await response.json()

    if (!data.success) {
      throw new Error(data.message)
    }

    const menu = data.data

    // Render menu
    const menuContainer = document.getElementById('menu-container')
    if (menuContainer) {
      menuContainer.innerHTML = renderMenuTree(menu.items)
    }

} catch (error) { console.error('Failed to load menu:', error) } }

// ============================================ // Helper Functions //
============================================

/\*\*

- Check if menu item is an entity reference \*/ function isEntityMenuItem(item: MenuItem): boolean {
  return ['page', 'post', 'category', 'service', 'project'].includes(item.type) }

/\*\*

- Check if menu item has children \*/ function hasChildren(item: MenuItem): boolean { return
  Array.isArray(item.children) && item.children.length > 0 }

/\*\*

- Find menu item by ID (recursive) \*/ function findMenuItemById(items: MenuItem[], id: string):
  MenuItem | null { for (const item of items) { if (item.id === id) return item if (item.children) {
  const found = findMenuItemById(item.children, id) if (found) return found } } return null }

/\*\*

- Flatten menu tree to array \*/ function flattenMenuItems(items: MenuItem[]): MenuItem[] { const
  result: MenuItem[] = []

function traverse(items: MenuItem[]) { for (const item of items) { result.push(item) if
(item.children) { traverse(item.children) } } }

traverse(items) return result }

/\*\*

- Get menu item URL with fallback \*/ function getMenuItemUrl(item: MenuItem): string { if
  (item.url) return item.url

// Fallback for entity types without URL if (isEntityMenuItem(item)) { return
`/${item.type}s/${item.referenceId}` }

return '#' }

/\*\*

- Create breadcrumb from menu item \*/ function createBreadcrumb(items: MenuItem[], targetId:
  string): MenuItem[] { const path: MenuItem[] = []

function findPath(items: MenuItem[], targetId: string, currentPath: MenuItem[]): boolean { for
(const item of items) { const newPath = [...currentPath, item]

      if (item.id === targetId) {
        path.push(...newPath)
        return true
      }

      if (item.children && findPath(item.children, targetId, newPath)) {
        return true
      }
    }
    return false

}

findPath(items, targetId, []) return path }

// ============================================ // Styling Examples //
============================================

/\* // CSS for menu rendering

.menu { list-style: none; padding: 0; margin: 0; }

.menu > li { display: inline-block; position: relative; padding: 10px 15px; }

.menu a { text-decoration: none; color: #333; transition: color 0.2s; }

.menu a:hover { color: #007bff; }

.menu .icon { margin-right: 5px; }

// Submenu styling .submenu { position: absolute; top: 100%; left: 0; background: white; box-shadow:
0 2px 8px rgba(0,0,0,0.15); display: none; min-width: 200px; z-index: 1000; }

.menu li:hover > .submenu { display: block; }

.submenu li { display: block; padding: 10px 15px; border-bottom: 1px solid #eee; }

.submenu li:last-child { border-bottom: none; }

// External link indicator a[target="_blank"]::after { content: " ↗"; font-size: 0.8em;
vertical-align: super; } \*/

export { MenuItemComponent, MenuTree, renderMenuItem, renderMenuTree, loadAndRenderMenu,
isEntityMenuItem, hasChildren, findMenuItemById, flattenMenuItems, getMenuItemUrl, createBreadcrumb,
}
