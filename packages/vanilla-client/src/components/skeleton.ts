import { Component } from '../core/component'
import { cn } from '../utils/classnames'
import { element } from '../utils/element'

type Props = {
  className: string
}

export class Skeleton extends Component<Props> {
  constructor(props?: Props) {
    super({ props })
  }

  render() {
    const { className } = this.props

    return element('div', {
      className: cn(
        'shrink-0 bg-slate-200 w-full rounded-3xl animate-pulse',
        className
      ),
    })
  }
}
