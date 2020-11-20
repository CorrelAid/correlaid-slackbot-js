const hackmdUtils = require('../src/utils/hackmdUtils')
const utils = require('../src/utils/utils')
const cheerio = require('cheerio')

// skipped to not always make requests to hackmd
test.skip('loadHTML', async () => {
    const md = utils.readFromFile('./test/data/test_hackmd.md')
    const $ = await hackmdUtils.loadHtml(
        'https://hackmd.io/GqxJyjcsRxGrjuqpN5qfBA?both'
    )
    expect($('div#doc').text()).toBe(md)
    expect($('head title').text()).toContain('this is the title')
})

describe('getMarkdown', () => {
    test('parse HTML correctly and extract markdown content', async () => {
        const md = utils.readFromFile('./test/data/test_hackmd.md')

        const raw = utils.readFromFile('./test/data/test_hackmd.html')
        const $ = cheerio.load(raw)
        const parsedMD = hackmdUtils.getMarkdown($)
        expect(parsedMD).toBe(md)
    })
})

describe('getTitle', () => {
    test('get the title from the document', async () => {
        const raw = utils.readFromFile('./test/data/test_hackmd.html')

        const $ = cheerio.load(raw)
        const mdTitle = hackmdUtils.getTitle($)

        expect(mdTitle).toBe('this is the title')
    })
})

describe('cleanURL', () => {
    test('clean ?both url', () => {
        const url = 'https://hackmd.io/dlfjlds?both'
        expect(hackmdUtils.cleanUrl(url)).toBe('https://hackmd.io/dlfjlds')
    })

    test('clean ?edit url', () => {
        const url = 'https://hackmd.io/dlfjlds?edit'
        expect(hackmdUtils.cleanUrl(url)).toBe('https://hackmd.io/dlfjlds')
    })

    test('url without ext', () => {
        const url = 'https://hackmd.io/dlfjlds'
        expect(hackmdUtils.cleanUrl(url)).toBe('https://hackmd.io/dlfjlds')
    })
})
