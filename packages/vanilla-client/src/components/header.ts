import { Component } from '../core/component'
import { type Child, element } from '../utils/element'

type Props = {
  children: Child[]
}

export class Header extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    return element('header', {
      className:
        'fixed z-40 w-full flex justify-between items-center max-w-5xl px-4 h-header-sm bg-slate-50/80 backdrop-blur-xs md:h-header-md',
      children: this.props.children,
    })
  }
}
