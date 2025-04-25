import { Component } from '../core/component'
import { cn } from '../utils/classnames'
import { element } from '../utils/element'

type Props = {
  label: string
  name: string
  error?: string
  textarea?: boolean
} & Partial<
  Omit<
    HTMLElementTagNameMap['input'],
    'children' | 'id' | 'for' | 'name' | 'placeholder'
  >
>

export class Input extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { label, error, name, textarea = false, ...attributes } = this.props

    const input = element(textarea ? 'textarea' : 'input', {
      ...attributes,
      name,
      id: name,
      placeholder: label,
      className: cn(
        'peer w-full px-4 py-2 bg-zinc-100 text-base text-zinc-800 outline-none rounded-lg border border-transparent placeholder:text-transparent',
        'focus-visible:border-primary-bright',
        textarea && 'min-h-56 resize-none',
        error && 'border-warning-bright'
      ),
    })

    const labelElement = element('label', {
      innerText: label,
      htmlFor: name,
      className: cn(
        'absolute -top-3.5 left-2 cursor-text text-xs text-slate-500 transition-all',
        'peer-focus-visible:text-primary-bright peer-focus-visible:-top-3.5 peer-focus-visible:left-2 peer-focus-visible:text-xs',
        'peer-placeholder-shown:left-4 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base',
        error && '-top-4 peer-focus-visible:-top-4'
      ),
    })

    const errorElement = error
      ? element('span', {
          innerText: error,
          className: 'text-sm text-warning-bright',
        })
      : null

    const wrapper = element('div', {
      className: 'group relative flex flex-col gap-1',
      children: [input, labelElement, errorElement],
    })

    return wrapper
  }
}
