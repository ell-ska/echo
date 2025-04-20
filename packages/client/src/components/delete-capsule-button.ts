import { ComponentWithMutation } from '../core/component'
import { Button } from './button'
import { client } from '../lib/client'
import { Toaster } from './toaster'
import { router } from '../main'

type Props = {
  id: string
}

export class DeleteCapsuleButton extends ComponentWithMutation<
  void,
  void,
  Props
> {
  constructor(props: Props) {
    super({ props })
  }

  async mutation() {
    await client.delete(`/capsules/${this.props.id}`)
    router.navigate('/')
  }

  onError(message: string) {
    Toaster.show(message)
  }

  render() {
    return new Button({
      label: 'Delete',
      size: 'sm',
      variant: 'secondary',
      onClick: () => this.mutate(),
    }).element
  }
}
