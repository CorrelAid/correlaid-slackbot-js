const githubUtils = require('../src/utils/githubUtils')

describe('gets repository structure', () => {
    test('empty -> negative ', async () => {
        const linkList = []

        const response = await githubUtils.getGitHubProjects()
        console.log(reponse)
        expect(response).toBe(false)
    })
})
