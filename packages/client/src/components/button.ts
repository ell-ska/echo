import { cva } from 'class-variance-authority'
import { createElement, type IconNode } from 'lucide'

import { Component } from '../core/component'
import { element } from '../utils/element'
import { cn } from '../utils/classnames'

const variants = cva(
  'flex gap-2 items-center justify-center rounded-full border border-transparent outline-primary-bright cursor-pointer whitespace-nowrap transition',
  {
    variants: {
      variant: {
        primary: ['bg-zinc-800 text-white', 'hover:bg-zinc-700'],
        secondary: [
          'bg-white text-zinc-800 border-zinc-800',
          'hover:bg-zinc-800 hover:text-white',
        ],
        tertiary: ['bg-transparent text-zinc-800', 'hover:bg-slate-200'],
      },
      size: {
        sm: 'text-xs py-2 px-4',
        md: 'text-base py-2 px-6',
      },
      shape: {
        pill: '',
        round: '',
      },
    },
    compoundVariants: [
      {
        shape: 'round',
        size: 'sm',
        class: 'size-6 p-0',
      },
      {
        shape: 'round',
        size: 'md',
        class: 'size-8 p-0',
      },
    ],
  }
)

type Props = {
  label?: string
  icon?: IconNode
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md'
  href?: string
  onClick?: (event: MouseEvent) => void
  type?: HTMLButtonElement['type']
}

export class Button extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const {
      label,
      icon: iconNode,
      variant = 'primary',
      size = 'md',
      href,
      onClick,
      type,
    } = this.props

    const span = label
      ? element('span', {
          innerText: label,
        })
      : null

    const icon = iconNode
      ? createElement(iconNode, {
          class: cn(size === 'sm' && 'size-3', size === 'md' && 'size-4'),
        })
      : null

    const children = [icon, span]
    const className = cn(
      variants({ variant, shape: icon ? 'round' : 'pill', size })
    )

    if (href) {
      return element('a', {
        children,
        className,
        href,
      })
    }

    const button = element('button', {
      children,
      className,
      type,
    })

    if (onClick) {
      button.addEventListener('click', (event) => onClick(event))
    }

    return button
  }
}
