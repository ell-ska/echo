import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .max(20, 'password cannot be longer than 20 characters')
  .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'password must contain at least one lowercase letter')
  .regex(/\d/, 'password must contain at least one digit')
  .regex(/[!@#$%^&*]/, 'password must contain at least one special character')

export const usernameSchema = z
  .string()
  .min(3, 'username must be at least 3 characters')
  .max(30, 'username cannot be longer than 30 characters')
