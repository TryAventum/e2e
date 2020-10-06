import ContentHelpers from '../helpers/content'
import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
import cloneDeep from 'lodash/cloneDeep'
const comments = require('../schemas/comments.json')
const sampleSize = require('lodash/sampleSize')
const range = require('lodash/range')
const random = require('lodash/random')
const pullAt = require('lodash/pullAt')
const conditionalLogic = require('../schemas/conditional-logic.json')

// By default the values generated randomly using faker in order to test for example selecting a specific comments we need some comments we know their values
const knownComments = require('../schemas/comments.items.json')

const contents = [comments]

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should create comments items', async () => {
  for (const content of contents) {
    await page.goto(`http://localhost:3333/contents/${content.name}/new`, {
      waitUntil: 'networkidle2'
    })
    const commentsToCreate = Number(process.env.COMMENTS_TO_CREATE)
    const randomPositionsToInsertTheKnownCommentsIn = sampleSize(range(commentsToCreate), knownComments.length)
    for (let i = 1; i <= commentsToCreate; i++) {
      const values = randomPositionsToInsertTheKnownCommentsIn.includes(i) ? pullAt(knownComments, [random(0, knownComments.length - 1)])[0] : null

      let _fields = content.fields

      if (values) {
        _fields = cloneDeep(_fields)
        for (const f of _fields) {
          f.value = values[f.name]
        }
      }

      await ContentHelpers.valuesSetter({ fields: _fields, page, conditionalLogic })

      await page.click('[data-testid-button-id="save"]')

      if (i < commentsToCreate) {
        await page.reload({
          waitUntil: 'networkidle2'
        })
      }
    }
  }
})

afterAll(async () => {
  // await page.waitFor(10000)
  await page.close()
})
