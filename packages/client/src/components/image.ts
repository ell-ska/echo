import { z } from 'zod'
import { ComponentWithData } from '../core/component'
import { client } from '../lib/client'
import { element } from '../utils/element'

type Data = Blob

type Props = {
  url: string
  className?: string
  fallback?: Element
}

export class Image extends ComponentWithData<Data, Props> {
  constructor(props: Props) {
    super({ props })
  }

  schema = () => z.instanceof(Blob)

  async query() {
    return await client.get(this.props.url, { responseType: 'blob' })
  }

  render() {
    if (!this.data) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return element('div', { className: 'hidden' })
    }

    const src = URL.createObjectURL(this.data)

    return element('img', {
      src,
      className: this.props.className,
    })
  }
}
