import { Component } from '../core/component'
import { element } from '../utils/element'
import { cn } from '../utils/classnames'

type Props = {
  tabs: {
    label: string
    href: string
    isActive: boolean
  }[]
}

export class Tabs extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { tabs } = this.props

    const div = element('div', {
      className:
        'fixed z-40 bottom-8 flex gap-2 p-1 bg-white rounded-full shadow-float',
    })

    tabs.forEach(({ label, href, isActive }) => {
      const a = element('a', {
        innerText: label,
        href,
        className: cn(
          'py-2 px-3 text-xs text-zinc-600 bg-white rounded-full transition hover:bg-slate-100',
          isActive && 'bg-slate-800 text-white hover:bg-slate-700'
        ),
      })
      div.appendChild(a)
    })

    return div
  }
}
