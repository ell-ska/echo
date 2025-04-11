export type Child = Element | string | null | undefined

export const element = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options?: Partial<Omit<HTMLElementTagNameMap[Tag], 'children'>> & {
    children?: Child[]
  }
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag)
  if (!options) return element

  const { children, ...attributes } = options
  Object.assign(element, attributes)

  if (!children) return element

  return appendChildren(element, children)
}

export const appendChildren = <Parent extends Element>(
  parent: Parent,
  children: Child[]
): Parent => {
  children.forEach((child) => {
    if (!child) return

    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child))
    } else {
      parent.appendChild(child)
    }
  })

  return parent
}
