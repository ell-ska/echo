import { Component } from '../core/component'

export class TemporaryPage extends Component {
  constructor() {
    super({})
  }

  render() {
    const div = document.createElement('div')
    div.innerText = 'page not implemented yet'

    return div
  }
}
