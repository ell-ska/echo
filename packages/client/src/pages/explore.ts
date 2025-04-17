import { z } from 'zod'

import { CapsuleData, capsuleResponseSchema } from '@repo/validation/data'
import { ComponentWithData } from '../core/component'
import { element } from '../utils/element'
import { client } from '../lib/client'
import { Capsule } from '../components/capsule'
import { getImageUrl } from '../utils/get-image-url'
import { Countdown } from '../components/countdown'
import { Tabs } from '../components/tabs'

const schema = z.array(capsuleResponseSchema)

const getType = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('type') || 'opened'
}

export class ExplorePage extends ComponentWithData<CapsuleData[]> {
  constructor() {
    super({})
  }

  protected schema = () => schema

  protected async query() {
    return await client.get(`/capsules/public?type=${getType()}`)
  }

  render() {
    const main = element('main', {
      className: 'main-unauthenticated max-w-md gap-6',
      children: [
        new Tabs({
          tabs: [
            {
              label: 'Opened',
              href: '/?type=opened',
              isActive: getType() === 'opened',
            },
            {
              label: 'Sealed',
              href: '/?type=sealed',
              isActive: getType() === 'sealed',
            },
          ],
        }).element,
      ],
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
      } else if (capsule.state === 'sealed') {
        const c = new Countdown({ id: capsule.id, openDate: capsule.openDate })
        c.mount(main)
      }
    })

    return main
  }
}
