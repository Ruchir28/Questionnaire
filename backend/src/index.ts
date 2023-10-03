import express from 'express';
const app = express()
const port = 8000

app.get('/', (req: express.Request, res: express.Response) => {
  console.log('Hello World!')
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
