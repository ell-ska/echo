export type Child = Element | string | null | undefined

export const element = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options?: Partial<Omit<HTMLElementTagNameMap[Tag], 'children'>> & {
    children?: Child[]
    on?: {
      [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
    }
  }
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag)
  if (!options) return element

  const { children, on, ...attributes } = options
  Object.assign(element, attributes)

  if (children) {
    appendChildren(element, children)
  }

  if (on) {
    for (const type in on) {
      const listener = on[type as keyof HTMLElementEventMap]!
      element.addEventListener(type, listener as EventListener)
    }
  }

  return element
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
