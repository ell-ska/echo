export const element = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options?: Partial<Omit<HTMLElementTagNameMap[Tag], 'children'>> & {
    children?: (Element | string | null | undefined)[]
  }
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag)
  if (!options) return element

  const { children, ...attributes } = options
  Object.assign(element, attributes)

  if (!children) return element

  children.forEach((child) => {
    if (!child) return

    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  })

  return element
}
