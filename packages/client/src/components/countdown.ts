import { intervalToDuration, isBefore } from 'date-fns'

import { Component } from '../core/component'
import { element } from '../utils/element'
import { Button } from './button'
import { cn } from '../utils/classnames'

type Props = {
  id: string
  openDate: Date
}

type State = {
  hasOpened: boolean
}

export class Countdown extends Component<Props, State> {
  private countdown?: ReturnType<typeof setInterval>

  constructor(props: Props) {
    super({ props, state: { hasOpened: false } })
  }

  render() {
    const { id, openDate } = this.props

    const years = element('span')
    const days = element('span')
    const hours = element('span')
    const minutes = element('span')
    const seconds = element('span')

    const updateDuration = () => {
      if (this.state.hasOpened) {
        clearInterval(this.countdown)
        return
      }

      const start = new Date()
      const end = openDate

      if (isBefore(end, start)) {
        clearInterval(this.countdown)
        this.setState({ hasOpened: true })
      }

      const duration = intervalToDuration({
        start,
        end,
      })

      years.innerText = String(duration.years || '0')
      days.innerText = String(duration.days || '0')
      hours.innerText = String(duration.hours || '0')
      minutes.innerText = String(duration.minutes || '0')
      seconds.innerText = String(duration.seconds || '0')
    }

    updateDuration()
    this.countdown = setInterval(() => {
      updateDuration()
    }, 1000)

    const commonClasses =
      'flex justify-between items-center gap-1 w-full border border-zinc-100 rounded-3xl bg-white'

    if (this.state.hasOpened) {
      return element('a', {
        href: `/capsule/${id}`,
        className: cn(commonClasses, 'p-2 pl-3 transition hover:bg-zinc-100'),
        children: [
          element('p', {
            innerText: 'The wait is finally over!',
            className: 'font-bold',
          }),
          new Button({ label: 'View capsule', size: 'sm' }).element,
        ],
      })
    }

    const durationClasses =
      'flex flex-col items-center gap-1 text-xs *:text-2xl *:font-black'

    return element('div', {
      className: cn(commonClasses, 'p-3'),
      children: [
        element('div', {
          className: durationClasses,
          children: [years, 'Years'],
        }),
        element('div', {
          className: durationClasses,
          children: [days, 'Days'],
        }),
        element('div', {
          className: durationClasses,
          children: [hours, 'Hours'],
        }),
        element('div', {
          className: durationClasses,
          children: [minutes, 'Minutes'],
        }),
        element('div', {
          className: durationClasses,
          children: [seconds, 'Seconds'],
        }),
      ],
    })
  }
}
