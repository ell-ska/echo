import { Component } from '../core/component'
import { element } from '../utils/element'
import { RegisterForm } from '../components/register-form'

export class RegisterPage extends Component {
  constructor() {
    super({})
  }

  render() {
    const message = element('h1', {
      className: 'space-x-2 text-2xl',
      children: [
        element('span', { innerText: 'Welcome to' }),
        element('span', { innerText: 'echo', className: 'font-black' }),
        element('span', { innerText: '!' }),
      ],
    })

    const link = element('a', {
      href: '/auth/login',
      className: 'text-sm hover:underline',
      children: [
        element('span', { innerText: 'Already have an account?' }),
        element('span', { innerText: ' Log in', className: 'font-bold' }),
      ],
    })

    return element('main', {
      className:
        'grow w-full max-w-xl flex flex-col items-center gap-6 md:gap-2 px-4 pt-header-sm mb-6 mt-4 md:pt-header-md md:mb-8',
      children: [
        element('div', {
          className: 'grow w-full flex flex-col items-center mt-[10vh] gap-8',
          children: [message, new RegisterForm().element],
        }),
        link,
      ],
    })
  }
}
