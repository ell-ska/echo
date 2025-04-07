export abstract class Component<Props extends {}> {
  private props: Props
  private element: HTMLElement

  constructor(props: Props) {
    this.props = props
    this.element = this.render(props)
  }

  abstract render(props: Props): HTMLElement

  mount(parent: HTMLElement) {
    parent.appendChild(this.element)
  }

  update(updatedProps: Partial<Props>) {
    this.props = { ...this.props, ...updatedProps }
    const updatedElement = this.render(this.props)

    this.element.replaceWith(updatedElement)
    this.element = updatedElement
  }
}
