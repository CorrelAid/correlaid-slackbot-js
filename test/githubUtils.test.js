require('dotenv').config()
const githubUtils = require('../src/utils/githubUtils')

test('content base64 creation', () => {
    const url = 'hackmd.io/foobar11'
    const title = 'this is a title'
    const oldContent = ''
    const expectedStr = `\n- [${title}](${url})`

    const baseContent = githubUtils.createBase64Content(oldContent, url, title)
    // decode again to compare
    const str = Buffer.from(baseContent, 'base64').toString('utf-8')
    expect(str).toBe(expectedStr)
})
