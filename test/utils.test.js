const utils = require('../src/utils/utils')

describe('containsLinkFromDomain', () => {
    test('empty -> negative ', async () => {
        const targetDomain = 'hackmd.io'
        const linkList = []

        const response = await utils.containsLinkFromDomain(
            linkList,
            targetDomain
        )

        expect(response).toBe(false)
    })

    test('one link - one positive ', async () => {
        const targetDomain = 'hackmd.io'
        const linkList = [
            { url: 'https://hackmd.io/xxejfklejwlerj', domain: 'hackmd.io' },
        ]

        const response = await utils.containsLinkFromDomain(
            linkList,
            targetDomain
        )

        expect(response).toBe(true)
    })

    test('one link - one negative ', async () => {
        const targetDomain = 'hackmd.io'
        const linkList = [
            { url: 'https://foo.io/xxejfklejwlerj', domain: 'foo.io' },
        ]

        const response = await utils.containsLinkFromDomain(
            linkList,
            targetDomain
        )

        expect(response).toBe(false)
    })

    test('two links - one positive ', async () => {
        const targetDomain = 'hackmd.io'
        const linkList = [
            { url: 'https://hackmd.io/xxejfklejwlerj', domain: 'hackmd.io' },
            { url: 'https://foo.io/xxejfklejwlerj', domain: 'foo.io' },
        ]

        const response = await utils.containsLinkFromDomain(
            linkList,
            targetDomain
        )

        expect(response).toBe(true)
    })
})

describe('stringifyError function', () => {
    test('formats error', () => {
        const message = utils.stringifyErr(Error('foo bar', 'a text:'))
        expect(message).toMatch('Error: foo bar')
    })

    test('non-existing file', () => {
        expect(() => {
            const message = utils.readFromFile('./test/data/doesnotexist.txt')
        }).toThrow()
    })
})

describe('readFromFile function', () => {
    test('read in file', () => {
        const message = utils.readFromFile('./test/data/welcome_message.txt')
        expect(message).toBe('Hi you!')
    })

    test('non-existing file', () => {
        expect(() => {
            const message = utils.readFromFile('./test/data/doesnotexist.txt')
        }).toThrow()
    })
})

describe('getCommandArgs', () => {
    test('no command args', () => {
        const text = ''
        const args = utils.getCommandArgs(text)
        expect(args.subcommand).toBe(undefined)
        expect(args.subcommandArgs).toBe(undefined)
    })

    test('no command args - a lot of whitespace', () => {
        const text = '           \n'
        const args = utils.getCommandArgs(text)
        expect(args.subcommand).toBe(undefined)
        expect(args.subcommandArgs).toBe(undefined)
    })

    test('command args - only subcommand', () => {
        const text = 'poll'
        const args = utils.getCommandArgs(text)
        expect(args.subcommand).toBe('poll')
        expect(args.subcommandArgs).toBe(undefined)
    })

    test('command args - more than one whitespace in between', () => {
        const text = 'poll    \n  \t  foo bar \n  '
        const args = utils.getCommandArgs(text)
        expect(args.subcommand).toBe('poll')
        expect(args.subcommandArgs.length).toBe(2)
        expect(args.subcommandArgs[0]).toBe('foo')
        expect(args.subcommandArgs[1]).toBe('bar')
    })

    test('command args special chars', () => {
        const text = 'poll di lo ##22 +2329 &&'
        const args = utils.getCommandArgs(text)
        expect(args.subcommand).toBe('poll')
        expect(args.subcommandArgs.length).toBe(5)
        expect(args.subcommandArgs).toMatchObject([
            'di',
            'lo',
            '##22',
            '+2329',
            '&&',
        ])
    })
})
