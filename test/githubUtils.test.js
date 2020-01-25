require('dotenv').config()
const githubUtils = require('../src/utils/githubUtils')

test('link base64 creation', () => {
    url = 'hackmd.io/foobar11'
    title = 'this is a title'
    const expectedStr = `- [${title}](${url})\n`

    // decode again
    const baseContent = githubUtils.createLinkTextBase64(url, title)
    const str = Buffer.from(baseContent, 'base64').toString('utf-8')
    expect(str).toBe(expectedStr)
})
