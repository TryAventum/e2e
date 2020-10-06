import Page from '../helpers/builder'

let page

beforeAll(async () => {
  page = await Page.build()
})

test('should create first super user', async () => {
  await page.goto('http://localhost:3333/register', { waitUntil: 'networkidle2' })
  await page.waitAndType('#firstName', process.env.USER_FIRST_NAME)
  await page.type('#lastName', process.env.USER_LAST_NAME)
  await page.type('#email', process.env.USER_EMAIL)
  await page.type('#password', process.env.USER_PASSWORD)
  await page.type('#passwordConfirmation', process.env.USER_PASSWORD)
  await page.click('button')

  await page.waitForFunction('document.querySelector(".msg")')

  const successMessage = await page.$eval('.msg', (el) => el.innerHTML)
  expect(successMessage).toEqual('Successfully registered!')
})

afterAll(async () => {
  await page.close()
})
