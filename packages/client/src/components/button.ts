import { cva } from 'class-variance-authority'
import { createElement, type IconNode } from 'lucide'

import { ComponentWithProps } from '../core/component'
import { element } from '../utils/element'
import { cn } from '../utils/classnames'

const variants = cva(
  'flex gap-2 items-center justify-center rounded-full bg-zinc-800 text-white border border-transparent outline-primary-bright cursor-pointer whitespace-nowrap transition hover:bg-zinc-700',
  {
    variants: {
      variant: {
        primary: '',
        secondary: [
          'bg-white text-zinc-800 border-zinc-800',
          'hover:bg-zinc-800 hover:text-white',
        ],
        round: '',
      },
      size: {
        sm: 'text-xs py-2 px-4',
        md: 'text-base py-2 px-6',
      },
    },
    compoundVariants: [
      {
        variant: 'round',
        size: 'sm',
        class: 'size-6 p-0',
      },
      {
        variant: 'round',
        size: 'md',
        class: 'size-8 p-0',
      },
    ],
  }
)

type Props = {
  label?: string
  icon?: IconNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  href?: string
  onClick?: (event: MouseEvent) => void
}

export class Button extends ComponentWithProps<Props> {
  render({
    label,
    icon: iconNode,
    variant = 'primary',
    size = 'md',
    href,
    onClick,
  }: Props) {
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
    const className = cn(variants({ variant: icon ? 'round' : variant, size }))

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
    })

    if (onClick) {
      button.addEventListener('click', (event) => onClick(event))
    }

    return button
  }
}
