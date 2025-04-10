import { Component } from '../core/component'

export class TemporaryPage extends Component {
  render() {
    const div = document.createElement('div')
    div.innerText = 'page not implemented yet'

    return div
  }
}
