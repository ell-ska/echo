import { Component } from '../core/component'
import { element } from '../utils/element'
import { cn } from '../utils/classnames'

type Props = { size: 'md' | 'lg'; initials?: string; src?: string }

export class Profile extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { size, initials, src } = this.props

    const commonClasses = 'rounded-full border border-white'
    const sizeClasses = cn(
      size === 'md' && 'size-8 text-sm font-bold',
      size === 'lg' && 'size-20 text-2xl font-black'
    )

    const image = element('img', {
      src: src,
      onerror: () => {
        image.classList.add('hidden')
        fallback.classList.remove('hidden')
        fallback.classList.add('flex')
      },
      onload: () => {
        image.classList.add('block')
        fallback.classList.add('hidden')
      },
      className: cn(commonClasses, sizeClasses),
    })

    const fallback = element('div', {
      innerText: initials || '',
      className: cn(
        commonClasses,
        sizeClasses,
        'hidden bg-primary-subtle items-center justify-center text-primary-bright uppercase'
      ),
    })

    return element('div', {
      children: [image, fallback],
    })
  }
}
