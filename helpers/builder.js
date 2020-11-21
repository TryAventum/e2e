import puppeteer from 'puppeteer'
require('dotenv-flow').config()

export default class Builder {
  static async build() {
    const launchOptions = {
      // slowMo: 100,
      devtools: true,
      headless: false,
      defaultViewport: null, // Defaults to an 800x600 viewport
      args: [
        '--start-maximized', // you can also use '--start-fullscreen'
        '--no-sandbox',
        '--disable-setui-sandbox',
        '--disable-web-security',
      ],
    }

    const browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    const extendedPage = new Builder(page)
    await page.setDefaultTimeout(50000)

    return new Proxy(extendedPage, {
      get: function (_target, property) {
        return extendedPage[property] || browser[property] || page[property]
      },
    })
  }

  constructor(page) {
    this.page = page
  }

  async waitAndClick(selector) {
    await this.page.waitForSelector(selector)
    await this.page.click(selector)
  }

  async waitAndType(selector, text) {
    await this.page.waitForSelector(selector)
    await this.page.type(selector, text)
  }

  async getText(selector) {
    await this.page.waitForSelector(selector)
    const text = await this.page.$eval(selector, (e) => e.innerHTML)
    return text
  }

  async getCount(selector) {
    await this.page.waitForSelector(selector)
    const count = await this.page.$$eval(selector, (items) => items.length)
    return count
  }

  async waitForXPathAndClick(xpath) {
    await this.page.waitForXPath(xpath)
    const elements = await this.page.$x(xpath)
    if (elements.length > 1) {
      console.warn('waitForXPathAndClick returned more than one result')
    }
    await elements[0].click()
  }

  async isElementExist(selector) {
    if (await this.page.$(selector)) {
      return true
    }
    return false
  }

  async isElementVisible(selector) {
    let visible = true
    await this.page
      .waitForSelector(selector, { visible: true, timeout: 300 })
      .catch(() => {
        visible = false
      })
    return visible
  }

  async isXPathVisible(selector) {
    let visible = true
    await this.page
      .waitForXPath(selector, { visible: true, timeout: 300 })
      .catch(() => {
        visible = false
      })
    return visible
  }

  async clearAndType({ inputSelector, value, pressEnter = false }) {
    // Puppeteer needs the value to be string
    value = value + ''

    // Get the input field
    let input
    if (typeof inputSelector === 'string') {
      input = await this.page.$(inputSelector)
    } else {
      input = inputSelector
    }

    // Click three time to select all text and type over it.
    await input.click({ clickCount: 3 })
    await input.type(value)

    if (pressEnter) {
      await this.page.keyboard.press('Enter')
    }
  }
}
