import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
var path = require('path')

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should upload files', async () => {
  const imgDir = path.join(
    __dirname,
    '../images/'
  )

  const filesNames = await readdir(imgDir)

  const files = filesNames.map(f => imgDir + f)

  await page.goto('http://localhost:3333/uploads', {
    waitUntil: 'networkidle2'
  })

  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('form')
  ])

  fileChooser.accept(files)

  // Wait for all files to upload, when a file uploaded a div with data-testid-upload-name="${fileName}" will be added to the dom inside ".uploads" class
  const waitForArr = []
  for (const file of filesNames) {
    waitForArr.push(page.waitForSelector(`[data-testid-upload-name="${file}"]`, { timeout: 300000 }))
  }

  await Promise.all(waitForArr)
})

afterAll(async () => {
  await page.close()
})
