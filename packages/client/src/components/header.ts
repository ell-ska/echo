import { Button } from './button'
import { Component } from '../core/component'
import { element } from '../utils/element'

export class Header extends Component {
  render() {
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

    const header = element('header', {
      className:
        'w-full flex justify-between items-center max-w-5xl px-4 h-16 md:h-20',
      children: [logo, button.element],
    })

    return header
  }
}
