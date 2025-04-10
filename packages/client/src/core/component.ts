abstract class Base<Props = void> {
  public element: Element
  protected props: Props

  constructor(props: Props) {
    this.props = props
    this.element = this.render(props)
  }

  protected abstract render(props: Props): Element

  mount(parent: Element) {
    parent.appendChild(this.element)
  }

  update?(updatedProps: Partial<Props>): void
}

export abstract class Component extends Base<void> {
  constructor() {
    super(undefined)
  }

  abstract override render(): Element
}

export abstract class ComponentWithProps<Props extends {}> extends Base<Props> {
  constructor(props: Props) {
    super(props)
  }

  update(updatedProps: Partial<Props>) {
    this.props = { ...this.props, ...updatedProps }
    const updatedElement = this.render(this.props)

    this.element.replaceWith(updatedElement)
    this.element = updatedElement
  }
}
