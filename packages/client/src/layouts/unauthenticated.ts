import { Button } from '../components/button'
import { Header } from '../components/header'
import { Component } from '../core/component'
import { Child, element } from '../utils/element'

type Props = {
  children: Child[]
}

export class UnauthenticatedLayout extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { children } = this.props

    const logo = element('a', {
      innerText: 'echo',
      href: '/',
      className: 'text-lg font-black',
    })

    const button = new Button({
      label: 'Log in',
      size: 'sm',
      href: '/auth/log-in',
    })

    const header = new Header({ children: [logo, button.element] })

    const div = element('div', {
      children: [header.element, ...children],
    })

    return div
  }
}
