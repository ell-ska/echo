import { LogInForm } from '../components/log-in-form'
import { Component } from '../core/component'
import { element } from '../utils/element'

export class LogInPage extends Component {
  constructor() {
    super({})
  }

  render() {
    const message = element('h1', {
      className: 'space-x-2 text-2xl',
      children: [
        element('span', { innerText: 'Welcome back to' }),
        element('span', { innerText: 'echo', className: 'font-black' }),
        element('span', { innerText: '!' }),
      ],
    })

    const link = element('a', {
      href: '/auth/register',
      className: 'text-sm hover:underline',
      children: [
        element('span', { innerText: "Don't have an account?" }),
        element('span', { innerText: ' Create one', className: 'font-bold' }),
      ],
    })

    return element('main', {
      className: 'main-with-header max-w-xl gap-6 md:gap-2',
      children: [
        element('div', {
          className: 'grow w-full flex flex-col items-center mt-[10vh] gap-8',
          children: [message, new LogInForm().element],
        }),
        link,
      ],
    })
  }
}
