import { X } from 'lucide'
import { v4 as uuid } from 'uuid'

import { Component } from '../core/component'
import { element } from '../utils/element'
import { Button } from './button'

type Props = {
  files: File[] | undefined
  name: string
  onChange: (files: File[]) => void
  onDelete: (remainingFiles: File[]) => void
}

export class Upload extends Component<
  Omit<Props, 'files'> & { files: { id: string; file: File }[] }
> {
  constructor(props: Props) {
    const { files, ...rest } = props

    super({
      props: {
        ...rest,
        files: files ? files.map((file) => ({ file: file, id: uuid() })) : [],
      },
    })
  }

  render() {
    const input = element('input', {
      hidden: true,
      type: 'file',
      accept: 'image/*',
      multiple: true,
      name: this.props.name,
      id: this.props.name,
      on: {
        change: () => {
          const files = Array.from(input.files || [])
          this.props.onChange(files)
        },
      },
    })

    const button = new Button({
      label: 'Upload image',
      variant: 'secondary',
      size: 'sm',
      type: 'button',
      onClick: () => {
        input.click()
      },
    })

    const preivew = element('div', { className: 'flex flex-wrap gap-2' })

    this.props.files.forEach(({ file, id }) => {
      const img = element('div', {
        className: 'relative',
        children: [
          element('img', {
            src: URL.createObjectURL(file),
            className: 'h-28 object-cover border border-white rounded-2xl',
          }),
          new Button({
            icon: X,
            size: 'sm',
            classes: 'absolute -top-1 -right-1',
            type: 'button',
            onClick: () => {
              const remaining = this.props.files?.filter(
                (file) => file.id !== id
              )
              this.props.onDelete(remaining.map(({ file }) => file))
            },
          }).element,
        ],
      })
      preivew.appendChild(img)
    })

    return element('div', {
      className: 'flex flex-col items-start gap-2',
      children: [preivew, input, button.element],
    })
  }
}
