import { z } from 'zod'

import { registerActionSchema } from '@repo/validation/actions'
import { router } from '../main'
import { auth } from '../lib/auth'
import { ComponentWithMutation } from '../core/component'
import { element } from '../utils/element'
import { Button } from '../components/button'
import { Input } from '../components/input'
import { Toaster } from '../components/toaster'

const schema = registerActionSchema
  .merge(z.object({ confirm: z.string() }))
  .refine(({ password, confirm }) => password === confirm, {
    message: 'passwords do not match',
    path: ['confirm'],
  })

type RegisterValues = z.infer<typeof schema>

export class RegisterForm extends ComponentWithMutation<RegisterValues> {
  constructor() {
    super({})
  }

  protected schema = () => schema

  protected async mutation(values: RegisterValues) {
    auth.register(values)
    router.navigate('/')
  }

  protected onError(message: string) {
    Toaster.show(message)
  }

  render() {
    const username = new Input({
      label: 'Username',
      name: 'username',
      value: this.values.username || '',
      error: this.validationErrors?.username?._errors[0],
    })

    const email = new Input({
      label: 'Email',
      name: 'email',
      type: 'email',
      value: this.values.email || '',
      error: this.validationErrors?.email?._errors[0],
    })

    const password = new Input({
      label: 'Password',
      name: 'password',
      type: 'password',
      value: this.values.password || '',
      error: this.validationErrors?.password?._errors[0],
    })

    const confirm = new Input({
      label: 'Confirm password',
      name: 'confirm',
      type: 'password',
      value: this.values.confirm || '',
      error: this.validationErrors?.confirm?._errors[0],
    })

    const button = new Button({
      label: 'Create account',
    })

    const inputs = element('div', {
      className: 'flex flex-col gap-6',
      children: [
        username.element,
        email.element,
        password.element,
        confirm.element,
      ],
    })

    const form = element('form', {
      on: {
        submit: (event: SubmitEvent) => {
          event.preventDefault()

          const formData = new FormData(form)
          const values = Object.fromEntries(formData.entries())

          this.mutate(values)
        },
      },
      className: 'flex flex-col gap-8 w-full',
      children: [inputs, button.element],
    })

    return form
  }
}
