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

    if (src) {
      return element('img', {
        src: this.props.src,
        className: cn(commonClasses, sizeClasses),
      })
    }

    if (initials) {
      return element('div', {
        innerText: this.props.initials,
        className: cn(
          commonClasses,
          sizeClasses,
          'bg-primary-subtle flex items-center justify-center text-primary-bright'
        ),
      })
    }

    return element('div', {
      className: cn(commonClasses, sizeClasses, 'bg-primary-subtle'),
    })
  }
}
