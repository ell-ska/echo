import { AlertCircle, createElement } from 'lucide'
import { Component } from '../core/component'
import { element } from '../utils/element'
import { cn } from '../utils/classnames'

export class Toaster extends Component<
  {},
  {
    messages: { id: number; message: string }[]
  }
> {
  private static instance: Toaster
  private id = 0

  constructor() {
    super({ state: { messages: [] } })
    Toaster.instance = this
  }

  static show(message: string) {
    const instance = Toaster.instance
    if (!instance) throw new Error('toaster is not mounted yet')

    const id = instance.id++
    instance.setState({
      messages: [...instance.state.messages, { id, message }],
    })

    setTimeout(() => {
      instance.setState({
        messages: instance.state.messages.filter(
          (message) => message.id !== id
        ),
      })
    }, 3000)
  }

  render() {
    const wrapper = element('div', {
      className: cn([
        'fixed z-50 flex gap-2 flex-col',
        'top-header-sm pt-3 left-4 right-4',
        'md:pt-0 md:left-auto md:top-auto md:right-6 md:bottom-6',
      ]),
    })

    for (const { message } of this.state.messages) {
      const toast = element('div', {
        className: cn([
          'flex gap-2 items-center py-3 pl-4 pr-6 min-w-80 max-w-sm rounded-full',
          'bg-white border border-warning-bright text-warning-bright font-sm shadow-float',
        ]),
        children: [
          createElement(AlertCircle, { class: 'size-4 shrink-0' }),
          element('span', { innerText: message }),
        ],
      })

      wrapper.appendChild(toast)
    }

    return wrapper
  }
}
