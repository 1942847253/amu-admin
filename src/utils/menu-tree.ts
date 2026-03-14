import type { MenuNode } from '../store/permission'

export const findMenuNode = (nodes: MenuNode[], key: string): MenuNode | null => {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children?.length) {
      const matched = findMenuNode(node.children, key)
      if (matched) return matched
    }
  }
  return null
}

export const containsMenuKey = (nodes: MenuNode[], key: string) => {
  return findMenuNode(nodes, key) !== null
}

export const resolveFirstLeafKey = (node: MenuNode | null | undefined): string => {
  if (!node) return ''
  if (!node.children?.length) return node.key

  for (const child of node.children) {
    const firstLeaf = resolveFirstLeafKey(child)
    if (firstLeaf) return firstLeaf
  }

  return node.key
}

export const findRootMenuByKey = (nodes: MenuNode[], key: string): MenuNode | null => {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children?.length && containsMenuKey(node.children, key)) {
      return node
    }
  }
  return null
}

const collectAncestorTrail = (nodes: MenuNode[], key: string, trail: string[]): string[] | null => {
  for (const node of nodes) {
    if (node.key === key) return trail
    if (node.children?.length) {
      const matched = collectAncestorTrail(node.children, key, [...trail, node.key])
      if (matched) return matched
    }
  }
  return null
}

export const collectAncestorKeys = (nodes: MenuNode[], key: string) => {
  return collectAncestorTrail(nodes, key, []) || []
}

export const normalizeAccordionKeys = (keys: string[]) => {
  if (keys.length <= 1) return keys

  const latest = keys[keys.length - 1]
  return keys.filter((key) => latest === key || latest.startsWith(`${key}/`))
}