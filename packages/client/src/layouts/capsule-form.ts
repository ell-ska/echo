import { X } from 'lucide'
import { Component } from '../core/component'
import { type Child, element } from '../utils/element'
import { Button } from '../components/button'
import { Header } from '../components/header'
import { router } from '../main'

type Props = {
  children: Child[]
  title?: string
  buttons: Child[]
}

export class CapsuleFormLayout extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { children, title, buttons } = this.props

    const close = element('div', {
      className: 'flex-1',
      children: [
        new Button({
          variant: 'tertiary',
          icon: X,
          onClick: () => router.back(),
        }).element,
      ],
    })

    const h2 = element('h2', {
      innerText: title || 'New capsule',
      className: 'flex-1 font-bold text-center',
    })

    const spacer = element('div', { className: 'flex-1' })

    const header = new Header({ children: [close, h2, spacer] })

    const buttonContainer = element('div', {
      className:
        'fixed left-4 right-4 mx-auto bottom-8 flex flex-col items-center gap-2 max-w-5xl *:w-full md:flex-row md:justify-end md:*:w-auto',
      children: buttons,
    })

    return element('div', {
      children: [header.element, ...children, buttonContainer],
    })
  }
}
