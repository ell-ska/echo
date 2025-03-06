import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'

import { db } from '../db'
import { router } from './routes'
import { logger } from '../lib/logger'

const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())

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
