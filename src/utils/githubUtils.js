require('dotenv').config()
const { Octokit } = require('@octokit/rest')
const utils = require('../utils/utils')
const GITHUB_PAT = process.env.GITHUB_PAT
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_FILE = process.env.GITHUB_FILE

const octokit = new Octokit({
    auth: GITHUB_PAT,
})

const getColumnCards = async (col_id, col_name) => {
    return await octokit.projects
        .listCards({ column_id: col_id })
        .then(response => {
            if (response.status === 200) {
                return {
                    column_id: col_id,
                    column_name: col_name,
                    cards: response.data,
                }
            }
        })
        .catch(e => {
            reject(e)
        })
}
const getAllCards = async () => {
    let columns = await getBoardColumns()

    const a = columns.map(
        async column => await getColumnCards(column.id, column.name)
    )

    return await Promise.all(a)
}
module.exports = {
    getColumnCards,
    getAllCards,
}
