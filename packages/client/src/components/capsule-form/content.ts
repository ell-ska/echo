import { z } from 'zod'

import { capsuleActionSchema } from '@repo/validation'
import { ComponentWithMutation } from '../../core/component'
import { element } from '../../utils/element'
import { Input } from '../input'
// import { Upload } from '../upload'
import { client } from '../../lib/client'
import { Toaster } from '../toaster'
import { router } from '../../main'

const schema = capsuleActionSchema.pick({
  title: true,
  content: true,
  images: true,
})

type Values = z.input<typeof schema>

type Props = // this is temporary
  (
    | {
        type: 'edit'
        id: string
      }
    | { type: 'create' }
  ) &
    Partial<Values>

type State = {
  files: File[] | undefined
}

export class CapsuleFormContent extends ComponentWithMutation<
  Values,
  Values,
  Props,
  State
> {
  constructor(props: Props) {
    super({ props, state: { files: [] } })
  }

  protected schema = () => schema

  protected async mutation(values: Values) {
    // TODO: move to the next step of the process instead
    // TODO: images are not working
    if (this.props.type === 'create') {
      const data = await client.post('/capsules', {
        title: values.title,
        content: values.content,
        visibility: 'public',
      })
      router.navigate(`/capsule/${data.data.id}`)
    } else {
      await client.put(`/capsules/${this.props.id}`, {
        title: values.title,
        content: values.content,
      })
      router.navigate(`/capsule/${this.props.id}`)
    }
  }

  protected onError(message: string) {
    Toaster.show(message)
  }

  render() {
    const title = new Input({
      label: 'Title',
      name: 'title',
      value: this.values.title || this.props.title || '',
      error: this.validationErrors?.title?._errors[0],
    })
    const content = new Input({
      label: 'Content',
      name: 'content',
      textarea: true,
      value: this.values.content || this.props.content || '',
      error: this.validationErrors?.content?._errors[0],
    })

    // const upload = new Upload({
    //   name: 'images',
    //   files: this.state.files,
    //   onChange: (files) => {
    //     this.setState({ files })
    //   },
    //   onDelete: (remainingFiles) => {
    //     this.setState({ files: remainingFiles })
    //   },
    // })

    const form = element('form', {
      on: {
        submit: (event: SubmitEvent) => {
          event.preventDefault()

          const formData = new FormData(form)

          const title = formData.get('title')
          const content = formData.get('content')

          this.mutate({
            title,
            content,
            images: this.state.files?.length ? this.state.files : undefined,
          })
        },
      },
      id: 'capsule-form',
      className: 'flex flex-col gap-8',
      children: [
        element('div', {
          className: 'flex flex-col gap-6',
          children: [title.element, content.element],
        }),
        // upload.element,
      ],
    })

    return form
  }
}
