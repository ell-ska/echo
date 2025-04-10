export const createElement = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  {
    props,
    children,
  }: {
    props?: Partial<HTMLElementTagNameMap[Tag]>
    children?: (Element | string)[]
  }
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag)
  Object.assign(element, props)

  children?.forEach((child) => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  })

  return element
}
