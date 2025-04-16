import { z } from 'zod'

import { ComponentWithMutation } from '../core/component'
import { element } from '../utils/element'
import { router } from '../main'
import { Button } from '../components/button'
import { Input } from '../components/input'
import { Toaster } from '../components/toaster'
import { auth } from '../lib/auth'

const schema = z
  .object({
    identifier: z.string().min(1),
    password: z.string().min(1),
  })
  .transform(({ identifier, password }) => {
    const { success: isEmail } = z.string().email().safeParse(identifier)

    return {
      ...(isEmail ? { email: identifier } : { username: identifier }),
      password,
    }
  })

type LoginInput = z.input<typeof schema>
type LoginOutput = z.output<typeof schema>

export class LogInForm extends ComponentWithMutation<LoginInput, LoginOutput> {
  constructor() {
    super({})
  }

  protected schema = () => schema

  protected async mutation(values: LoginOutput) {
    await auth.logIn(values)
    router.navigate('/')
  }

  protected onError(message: string) {
    Toaster.show(message)
  }

  render() {
    const identifier = new Input({
      label: 'Username or email',
      name: 'identifier',
      value: this.values.identifier || '',
      error: this.validationErrors?.identifier?._errors[0],
    })

    const password = new Input({
      label: 'Password',
      name: 'password',
      type: 'password',
      value: this.values.password || '',
      error: this.validationErrors?.password?._errors[0],
    })

    const button = new Button({
      label: 'Log in',
    })

    const inputs = element('div', {
      className: 'flex flex-col gap-6',
      children: [identifier.element, password.element],
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
