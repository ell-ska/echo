import { Button } from '../components/button'
import { CapsuleFormContent } from '../components/capsule-form/content'
import { Component } from '../core/component'
import { CapsuleFormLayout } from '../layouts/capsule-form'
import { element } from '../utils/element'

export class CreateCapsulePage extends Component {
  constructor() {
    super({})
  }

  render() {
    return new CapsuleFormLayout({
      children: [
        element('main', {
          className: 'main-with-header max-w-sm *:w-full',
          children: [new CapsuleFormContent().element],
        }),
      ],
      buttons: [
        new Button({
          label: 'Next',
          form: 'capsule-form',
        }).element,
      ],
    }).element
  }
}
