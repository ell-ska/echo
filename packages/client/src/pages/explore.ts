import { z } from 'zod'

import { CapsuleData, capsuleResponseSchema } from '@repo/validation/data'
import { ComponentWithData } from '../core/component'
import { element } from '../utils/element'
import { client } from '../lib/client'
import { Capsule } from '../components/capsule'
import { getImageUrl } from '../utils/get-image-url'
import { Countdown } from '../components/countdown'
import { Tabs } from '../components/tabs'
import { Skeleton } from '../components/skeleton'
import { cn } from '../utils/classnames'

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
      className: cn(
        'main-unauthenticated max-w-md gap-6',
        this.isLoading && 'h-[80vh] overflow-hidden mb-0'
      ),
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

    if (this.isLoading) {
      new Skeleton({ className: 'h-96' }).mount(main)
      new Skeleton({ className: 'h-96' }).mount(main)
      return main
    }

    if (!this.data || this.data.length === 0) {
      const error = element('div', {
        className: 'mt-[20vh] text-center text-xl font-bold',
        innerText:
          'Oops! The capsule vault is empty. The time travelers must be running late!',
      })
      main.appendChild(error)

      return main
    }

    this.data.forEach((capsule) => {
      if (capsule.state === 'opened') {
        const c = new Capsule({
          id: capsule._id,
          title: capsule.title,
          image: getImageUrl({
            type: 'capsule',
            capsuleId: capsule._id,
            imageName: capsule.images[0]?.name,
          }),
          openDate: capsule.openDate,
          senders: capsule.senders,
        })
        c.mount(main)
      } else if (capsule.state === 'sealed') {
        const c = new Countdown({ id: capsule._id, openDate: capsule.openDate })
        c.mount(main)
      }
    })

    return main
  }
}
