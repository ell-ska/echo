import { Component } from '../core/component'
import { element } from '../utils/element'

export class ExplorePage extends Component {
  constructor() {
    super({})
  }

  render() {
    return element('main', { innerText: 'explore', className: 'w-full' })
  }
}
