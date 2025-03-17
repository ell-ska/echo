import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import { db } from '../db'
import { router } from './routes'
import { logger } from '../lib/logger'

const app = express()
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

app.use(router)

db.connect().then(() => {
  app.listen(process.env.PORT, () => {
    logger.information({
      identifier: 'server_start',
      message: `server ready on port ${process.env.PORT}`,
    })
  })
})

export default app
