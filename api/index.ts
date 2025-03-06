import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'

import { router } from './routes'

const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())

app.use(router)

app.listen(process.env.PORT, () => {
  console.log(`server ready on port ${process.env.PORT}`)
})

export default app
