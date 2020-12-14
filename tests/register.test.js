import faker from 'faker'
import Page from '../helpers/builder'

let page

beforeAll(async () => {
  page = await Page.build()
})

test('should create first super user', async () => {
  await page.goto('http://localhost:3333/register', {
    waitUntil: 'networkidle2',
  })
  const usersToRegister = Number(process.env.USERS_TO_REGISTER)
  for (let i = 1; i <= usersToRegister; i++) {
    await page.waitAndType('#firstName', faker.name.firstName())
    await page.type('#lastName', faker.name.lastName())
    await page.type('#email', faker.internet.email())
    await page.type('#password', '000000')
    await page.type('#passwordConfirmation', '000000')
    await page.click('button')

    await page.waitForFunction('document.querySelector(".msg")')

    const successMessage = await page.$eval('.msg', (el) => el.innerHTML)
    expect(successMessage).toEqual('Successfully registered!')

    if (i < usersToRegister) {
      await page.reload({
        waitUntil: 'networkidle2',
      })
    }
  }
})

afterAll(async () => {
  await page.close()
})
