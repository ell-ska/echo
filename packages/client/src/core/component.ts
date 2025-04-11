import { type AxiosResponse, isAxiosError } from 'axios'
import { z } from 'zod'

abstract class Base<Props = void> {
  public element!: Element
  protected props: Props

  constructor(props: Props) {
    this.props = props
  }

  protected abstract render(props: Props): Element

  mount(parent: Element) {
    parent.appendChild(this.element)
  }

  protected rerender() {
    const rerenderedElement = this.render(this.props)
    this.element.replaceWith(rerenderedElement)
    this.element = rerenderedElement
  }

  update?(updatedProps: Partial<Props>): void
}

export abstract class Component extends Base {
  constructor() {
    super()
    this.element = this.render()
  }

  abstract override render(): Element
}

export abstract class ComponentWithProps<Props extends {}> extends Base<Props> {
  constructor(props: Props) {
    super(props)
    this.element = this.render(this.props)
  }

  update(updatedProps: Partial<Props>) {
    this.props = { ...this.props, ...updatedProps }
    this.rerender()
  }
}

export abstract class ComponentWithData<Data> extends Base {
  protected data: Data | null = null
  protected isLoading = true
  protected error: string | null = null

  constructor() {
    super()
    // this cannot be called in Base because the initialization order will make scoped variables be undefined in the first render
    this.element = this.render()
    this.get()
  }

  private async get() {
    try {
      const response = await this.query()

      const { data, success } = this.schema().safeParse(response.data)

      if (!success) {
        throw new Error('data did not match the expected shape')
      }

      this.data = data
    } catch (error) {
      if (isAxiosError(error) && error.response?.data.error) {
        this.error = error.response?.data.error
        return
      }

      if (error instanceof Error) {
        this.error = error.message
        return
      }

      this.error = 'something went wrong'
    } finally {
      this.isLoading = false
      this.rerender()
    }
  }

  protected abstract schema(): z.Schema<Data>
  protected abstract query(): Promise<AxiosResponse<Data, any>>
}
