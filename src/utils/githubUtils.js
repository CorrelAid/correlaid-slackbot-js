require('dotenv').config()
const { Octokit } = require('@octokit/rest')
const utils = require('../utils/utils')
const GITHUB_PAT = process.env.GITHUB_PAT
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_PROJECT_ID = process.env.GITHUB_PROJECT_ID
const EMOJIS = [
    ':thinking_face:',
    ':speech_balloon:',
    ':busts_in_silhouette:',
    ':hammer_and_wrench:',
    ':mag_right:',
    ':handshake:',
    ':writing_hand:',
    ':white_check_mark:',
    ':x:',
]

const octokit = new Octokit({
    auth: GITHUB_PAT,
})

const getBoardColumns = async () => {
    let projects = await octokit.projects
        .listColumns({
            project_id: GITHUB_PROJECT_ID,
        })
        .then(res => res.data)
        .catch(e => Promise.reject(e))
    return projects
}

const unifyEl = async el => {
    if (el.note) {
        let unifiedEl = unifyNote(el)
        return unifiedEl
    } else {
        let unifiedEl = await unifyIssue(el)
        return unifiedEl
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
    return await octokit.issues
        .get({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            issue_number: issue_no,
        })
        .then(res => {
            return {
                title: res.data.title,
                id: card.id,
                content_url: card.content_url,
                updated_at: card.updated_at,
            }
        })
        .catch(e => Promise.reject(e))
}

const getColumnCards = async (col_id, col_name) => {
    let columnElements = await octokit.projects
        .listCards({ column_id: col_id })
        .then(res => res.data)
        .catch(e => Promise.reject(e))

    let unifiedEls = []
    for (const el of columnElements) {
        let unifiedEl = await unifyEl(el)
        unifiedEls.push(unifiedEl)
    }
    return { column_id: col_id, column_name: col_name, elements: unifiedEls }
}

const getCardsByCol = async () => {
    let columns = await getBoardColumns()
    let cardsByCol = []
    for (const column of columns) {
        let columnCards = await getColumnCards(column.id, column.name)
        cardsByCol.push(columnCards)
    }
    return cardsByCol
}
const createBoardSummaryText = columns => {
    // const emojis = {} // define emoijs for each column
    colTexts = ['This is the current status of the project board']
    columns.forEach((col, index) => {
        colTexts.push(
            `${EMOJIS[index]} ${col.column_name}: ${col.elements.length} projects`
        )
    })
    colTexts.push(
        'Note: there are still >30 older projects outside the board which are not counted in this summary.'
    )
    return colTexts.join('\n')
}

const createColumnSummaryTexts = columns => {
    colTexts = []
    columns.forEach((col, index) => {
        let txt = `${EMOJIS[index]} ${col.column_name}: ${col.elements.length}`
        let projectTexts = col.elements.map(proj => `- ${proj.title}`)
        let fullText = [txt, ...projectTexts].join('\n')
        colTexts.push(fullText)
    })
    return colTexts
}

module.exports = {
    getCardsByCol,
    createColumnSummaryTexts,
    createBoardSummaryText,
}
