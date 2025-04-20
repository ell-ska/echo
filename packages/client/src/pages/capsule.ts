import {
  type CapsuleData,
  capsuleResponseSchema,
  type UserData,
} from '@repo/validation/data'
import { ComponentWithData } from '../core/component'
import { element } from '../utils/element'
import { client } from '../lib/client'
import { cn } from '../utils/classnames'
import type { Params } from '../core/router'
import { formatDistanceToNow } from 'date-fns'
import { getImageUrl } from '../utils/get-image-url'
import { Profile } from '../components/profile'
import { isSender } from '../utils/is-sender'
import { DeleteCapsuleButton } from '../components/delete-capsule-button'
import { Countdown } from '../components/countdown'

type Props = { params: Params }

export class CapsulePage extends ComponentWithData<CapsuleData, Props> {
  constructor(props: Props) {
    super({ props, authenticate: true })
  }

  protected schema = () => capsuleResponseSchema

  protected async query() {
    return await client.get(`/capsules/${this.props.params.id}`)
  }

  render() {
    // TODO: loading state

    // TODO: error handling
    if (!this.data) {
      return element('div', { innerText: 'error' })
    }

    const main = element('main', {
      className: cn(
        'main-unauthenticated max-w-5xl gap-8 md:flex-row md:items-start md:justify-between'
      ),
    })

    // TODO: edit button
    const options =
      this.user && isSender(this.user._id, this.data.senders)
        ? element('div', {
            className: 'self-end md:order-1',
            children: [new DeleteCapsuleButton({ id: this.data._id }).element],
          })
        : null

    if (this.data.state === 'sealed') {
      const countdown = new Countdown({
        openDate: this.data.openDate,
        openAction: 'reload',
      })

      main.append(
        element('div', {
          className: 'w-full md:flex-1',
          children: [countdown.element],
        })
      )
      main.append(
        element('div', {
          className: 'flex flex-col w-full md:flex-1',
          children: [options],
        })
      )
    }

    // TODO: unsealed state
    if (this.data.state === 'opened') {
      const title = element('h1', {
        innerText: this.data.title,
        className: 'text-xl font-black',
      })

      const date = element('time', {
        innerText: `${formatDistanceToNow(this.data.openDate)} ago`,
        className: 'text-sm text-zinc-600 whitespace-nowrap',
      })

      const header = element('header', {
        className: 'flex justify-between gap-4 mb-0.5',
        children: [title, date],
      })

      const content = this.data.content
        ? element('p', {
            innerText: this.data.content,
          })
        : null

      const images = this.data.images.length
        ? element('div', { className: 'flex flex-wrap gap-1 mt-4' })
        : null

      this.data.images.forEach((image) => {
        const img = element('img', {
          className:
            'h-36 object-cover border border-white rounded-2xl md:h-40',
          src: getImageUrl({
            type: 'capsule',
            capsuleId: this.data!._id,
            imageName: image.name,
          }),
          onerror: () => {
            img.classList.add('hidden')
          },
        })

        images?.appendChild(img)
      })

      const article = element('article', {
        className: 'w-full md:flex-1',
        children: [header, content, images],
      })

      const from = element('div', {
        className:
          'flex-1 flex flex-col gap-1 md:flex-row md:items-center md:gap-4',
        children: [
          element('span', { className: 'font-bold', innerText: 'From' }),
        ],
      })

      this.data.senders.forEach((sender) => {
        const div = getUserElement(sender)
        from.appendChild(div)
      })

      const to = this.data.receivers.length
        ? element('div', {
            className:
              'flex-1 flex flex-col gap-1 md:flex-row md:items-center md:gap-4',
            children: [
              element('span', { className: 'font-bold', innerText: 'To' }),
            ],
          })
        : null

      this.data.receivers.forEach((receiver) => {
        const div = getUserElement(receiver)
        from.appendChild(div)
      })

      const users = element('div', {
        className: 'flex gap-8 md:order-2',
        children: [from, to],
      })

      main.appendChild(article)
      main.appendChild(
        element('div', {
          className:
            'flex flex-col gap-8 w-full md:flex-1 md:items-end md:gap-6',
          children: [users, options],
        })
      )
    }

    return main
  }
}

const getUserElement = (user: UserData) => {
  return element('div', {
    className: 'flex gap-2 items-center',
    children: [
      new Profile({
        size: 'md',
        src: getImageUrl({ type: 'user', id: user._id }),
        initials:
          user.firstName && user.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`
            : undefined,
      }).element,
      element('span', { innerText: `@${user.username}` }),
    ],
  })
}
