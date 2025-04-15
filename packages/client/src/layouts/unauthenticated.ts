import { Header } from '../components/header'
import { Component } from '../core/component'
import { Child, element } from '../utils/element'

type Props = {
  children: Child[]
}

export class UnauthenticatedLayout extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { children } = this.props
    const header = new Header()

    const div = element('div', {
      children: [header.element, ...children],
    })

    return div
  }
}
