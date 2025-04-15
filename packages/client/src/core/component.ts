import { type AxiosResponse, isAxiosError } from 'axios'
import { z, ZodFormattedError } from 'zod'

type Constructor<Props, State> = { props?: Props; state?: State }

abstract class Base<Props = {}, State = {}> {
  public element!: Element
  protected props: Props
  protected state: State

  constructor({ props, state }: Constructor<Props, State>) {
    this.props = props || ({} as Props)
    this.state = state || ({} as State)
  }

  protected abstract render(): Element

  protected rerender() {
    const rerenderedElement = this.render()
    this.element.replaceWith(rerenderedElement)
    this.element = rerenderedElement
  }

  protected setState(partialState: Partial<State>) {
    this.state = { ...this.state, ...partialState }
    this.rerender()
  }

  mount(parent: Element) {
    parent.appendChild(this.element)
  }

  update(updatedProps: Partial<Props>) {
    this.props = { ...this.props, ...updatedProps }
    this.rerender()
  }
}

export abstract class Component<
  Props extends {} = {},
  State extends {} = {},
> extends Base<Props, State> {
  constructor({ props, state }: Constructor<Props, State>) {
    super({ props, state })
    this.element = this.render()
  }
}

export abstract class ComponentWithData<
  Data,
  Props extends {} = {},
  State extends {} = {},
> extends Component<Props, State> {
  protected data: Data | null = null
  protected isLoading = true
  protected error: string | null = null

  constructor({ props, state }: Constructor<Props, State>) {
    super({ props, state })
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

export abstract class ComponentWithMutation<
  Values = void,
  Props extends {} = {},
  State extends {} = {},
> extends Base<Props, State> {
  protected isLoading = false
  protected validationErrors: ZodFormattedError<Values> | null = null
  protected error: string | null = null
  protected values: Partial<Values> = {}

  constructor({ props, state }: Constructor<Props, State>) {
    super({ props, state })
    this.element = this.render()
  }

  protected async mutate(values?: Values extends void ? never : object) {
    try {
      this.isLoading = true

      if (!values) {
        await this.mutation()
        this.error = null
        return
      }

      if (!this.schema) {
        throw new Error(
          'a mutation with values needs a schema to validate the values'
        )
      }

      this.values = values
      const { data, success, error } = this.schema().safeParse(values)

      if (!success) {
        this.validationErrors = error.format()
        return
      }

      await this.mutation(data)

      this.validationErrors = null
      this.error = null
    } catch (error) {
      if (isAxiosError(error) && error.response?.data.error) {
        this.error = error.response?.data.error
        this.onError?.(error.response?.data.error)
        return
      }

      const defaultMessage = 'something went wrong'
      this.error = defaultMessage
      this.onError?.(defaultMessage)
    } finally {
      this.isLoading = false
      this.rerender()
    }
  }

  protected abstract mutation(values?: Values): Promise<void>
  protected schema?(): z.Schema<Values>
  protected onError?(message: string): void
}
