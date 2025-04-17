import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import type { UserData } from '@repo/validation/data'
import { Component } from '../core/component'
import { Profile } from './profile'
import { element } from '../utils/element'
import { getImageUrl } from '../utils/get-image-url'

dayjs.extend(relativeTime)

type Props = {
  id: string
  title: string
  image?: string
  openDate: Date
  senders: UserData[]
}

export class Capsule extends Component<Props> {
  constructor(props: Props) {
    super({ props })
  }

  render() {
    const { id, title, image: imageUrl, senders, openDate } = this.props

    const h3 = element('h3', {
      innerText: title,
      className: 'text-xl font-black',
    })

    const profiles = element('div', {
      className: 'flex -space-x-3',
    })

    senders.forEach((sender) => {
      new Profile({
        size: 'md',
        src: getImageUrl({ type: 'user', id: sender._id }),
        initials:
          sender.firstName && sender.lastName
            ? `${sender.firstName[0]}${sender.lastName[0]}`
            : undefined,
      }).mount(profiles)
    })

    const dateFromNow = element('time', {
      className: 'text-sm text-zinc-600',
      innerText: dayjs(openDate).fromNow(),
    })

    const info = element('div', {
      className:
        'flex flex-col gap-1 p-3 bg-white transition group-hover:bg-zinc-100',
      children: [
        h3,
        element('div', {
          className: 'flex justify-between items-end',
          children: [profiles, dateFromNow],
        }),
      ],
    })

    const image = element('img', {
      className: 'max-h-[60vh] object-cover w-full',
      src: imageUrl,
      onerror: () => {
        image.classList.add('hidden')
      },
    })

    return element('a', {
      href: `/capsule/${id}`,
      className:
        'group w-full border border-zinc-100 rounded-3xl overflow-hidden',
      children: [image, info],
    })
  }
}
