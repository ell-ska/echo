import { z } from 'zod'

import { CapsuleData, capsuleResponseSchema } from '@repo/validation/data'
import { ComponentWithData } from '../core/component'
import { element } from '../utils/element'
import { client } from '../lib/client'
import { Capsule } from '../components/capsule'
import { getImageUrl } from '../utils/get-image-url'

const schema = z.array(capsuleResponseSchema)

export class ExplorePage extends ComponentWithData<CapsuleData[]> {
  constructor() {
    super({})
  }

  protected schema = () => schema

  protected async query() {
    return await client.get(`/capsules/public`)
  }

  render() {
    const main = element('main', {
      className: 'main-unauthenticated max-w-md gap-6',
    })

    // TODO: display loader

    if (!this.data) {
      // TODO: display error
      return element('main', { innerText: 'error' })
    }

    this.data.forEach((capsule) => {
      if (capsule.state === 'opened') {
        const c = new Capsule({
          id: capsule.id,
          title: capsule.title,
          image: getImageUrl({
            type: 'capsule',
            capsuleId: capsule.id,
            imageName: capsule.images[0]?.name,
          }),
          openDate: capsule.openDate,
          senders: capsule.senders,
        })

        c.mount(main)
      }
    })

    return main
  }
}
