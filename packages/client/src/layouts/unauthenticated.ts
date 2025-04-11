import { Header } from '../components/header'
import { ComponentWithProps } from '../core/component'
import { Child, element } from '../utils/element'

type Props = {
  children: Child[]
}

export class UnauthenticatedLayout extends ComponentWithProps<Props> {
  render({ children }: Props) {
    const header = new Header()

    const div = element('div', {
      children: [header.element, ...children],
    })

    return div
  }
}
