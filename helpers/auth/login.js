module.exports.login = async (page) => {
  await page.goto('http://localhost:3333/login', { waitUntil: 'networkidle2' })
  await page.waitAndType('#email', process.env.USER_EMAIL)
  await page.type('#password', process.env.USER_PASSWORD, { delay: 1 })
  await page.click('button')

  await page.waitForFunction('document.querySelector(".msg")')

  const loginSuccessMessage = await page.$eval('.msg', (el) => el.innerHTML)

  if (loginSuccessMessage === 'Successfully signed in!') {
    return true
  }

  return false
}
