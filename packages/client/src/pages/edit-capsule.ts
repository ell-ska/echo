import { type CapsuleData, capsuleResponseSchema } from '@repo/validation/data'
import { Button } from '../components/button'
import { CapsuleFormContent } from '../components/capsule-form/content'
import { ComponentWithData } from '../core/component'
import { CapsuleFormLayout } from '../layouts/capsule-form'
import { client } from '../lib/client'
import { element } from '../utils/element'
import { type Params } from '../core/router'
import { router } from '../main'
import { Skeleton } from '../components/skeleton'

type Props = { params: Params }

export class EditCapsulePage extends ComponentWithData<CapsuleData, Props> {
  constructor(props: Props) {
    super({ props, authenticate: true })
  }

  protected schema = () => capsuleResponseSchema

  protected async query() {
    return await client.get(`/capsules/${this.props.params.id}`)
  }

  render() {
    const main = element('main', {
      className: 'main-with-header max-w-sm *:w-full',
    })

    const layout = new CapsuleFormLayout({
      children: [main],
      title:
        this.data && this.data.state === 'unsealed'
          ? this.data.title
          : undefined,
      buttons: [
        new Button({
          label: 'Create',
          form: 'capsule-form',
        }).element,
      ],
    }).element

    if (this.isLoading) {
      new Skeleton({ className: 'h-10 w-full mb-6' }).mount(main)
      new Skeleton({ className: 'h-56 w-full' }).mount(main)

      return layout
    }

    if (this.data?.state !== 'unsealed') {
      router.notFound()
      // TODO: again, this should not be here
      return element('div')
    }

    new CapsuleFormContent({
      type: 'edit',
      title: this.data.title,
      content: this.data.content,
      id: this.data._id,
    }).mount(main)

    return layout
  }
}
