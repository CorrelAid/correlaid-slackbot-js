require('dotenv').config()
const { Octokit } = require('@octokit/rest')
const { reject } = require('bluebird')
const GITHUB_PAT = ''
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_FILE = process.env.GITHUB_FILE

const octokit = new Octokit({
    auth: GITHUB_PAT,
})

const getBoardColumns = async () => {
    return await octokit.projects
        .listColumns({
            project_id: 3771798,
        })
        .then(response => {
            if (response.status === 200) {
                return response.data
            }
        })
        .catch(e => {
            reject(e)
        })
}

const unifyElement = async card => {
    if (card.content_url) {
        return await unifyIssue(card)
    } else {
        return await unifyNote(card)
    }
}
const unifyNote = card => {
    // get first row of card -> should be title
    let title = card.note.split('\n')[0]
    return {
        title: title,
        id: card.id,
        content_url: card.content_url,
        updated_at: card.updated_at,
    }
}

const unifyIssue = async card => {
    let issue_no = card.content_url.split('/').slice(-1)[0]
    let title = await octokit.issues
        .get({
            owner: 'CorrelAid',
            repo: 'projects',
            issue_number: issue_no,
        })
        .then(res => {
            return res.title
        })
        .catch(e => reject(e))
    return {
        title: title,
        id: card.id,
        content_url: card.content_url,
        updated_at: card.updated_at,
    }
}

const getColumnCards = async (col_id, col_name) => {
    return await octokit.projects
        .listCards({ column_id: col_id })
        .then(response => {
            return response.data
        })
        .then(elements => elements.map(el => unifyElement(el)))
        .then(elements => {
            return {
                column_id: col_id,
                column_name: col_name,
                elements: elements,
            }
        })
        .catch(e => {
            console.log(e)
        })
}

const getCards = async () => {
    let columns = await getBoardColumns()

    const a = columns.map(
        async column => await getColumnCards(column.id, column.name)
    )
    return await Promise.all(a)
}

const getCards2 = async () => {
    let columns = await getBoardColumns()

    return columns.map(col => getColumnCards(col.id, col.name))
    getBoardColumns()
        .then(columns =>
            columns.map(async col => await getColumnCards(col.id, col.name))
        )
        .then(res => console.log(res))
        .catch(e => console.log(e))
}
const test = getBoardColumns().then(res => res)
//const testColCards = getColumnCards(7613959).then(res => console.log(res))

const cards = getCards()
cards.then(res => console.log(res[0].elements))
console.log(cards.length)
