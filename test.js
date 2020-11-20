require('dotenv').config()
const { Octokit } = require('@octokit/rest')
const GITHUB_PAT = ''
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_FILE = process.env.GITHUB_FILE

const octokit = new Octokit({
    auth: GITHUB_PAT,
})

const getIssues = async () => {
    // TODO: make it work with more than 100 issues
    let issues = await octokit.issues
        .listForRepo({
            owner: 'CorrelAid',
            repo: 'projects',
            state: 'all',
            assignee: '*',
        })
        .then(res => res.data)
        .catch(e => Promise.reject(e))
    return issues
}
const getBoardColumns = async () => {
    let projects = await octokit.projects
        .listColumns({
            project_id: 3771798,
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
            owner: 'CorrelAid',
            repo: 'projects',
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
    const cols = columns.map(col => {
        return `${col.column_name}: ${col.elements.length} projects`
    })

    return cols.join('\n')
}

const createColumnSummaryTexts = columns => {
    // const emojis = {} // define emoijs for each column
    colTexts = []
    columns.forEach(col => {
        let txt = `${col.column_name}: ${col.elements.length}`
        let projectTexts = col.elements.map(proj => proj.title)
        let fullText = [txt, ...projectTexts].join('\n')
        colTexts.push(fullText)
    })
    return colTexts
}

const test = getCardsByCol()
//const testColCards = getColumnCards(7880481).then(res => console.log(res))

const txt = test
    .then(cards => createBoardSummaryText(cards))
    .then(res => console.log(res))

const txt2 = test
    .then(cards => createColumnSummaryTexts(cards))
    .then(res => console.log(res.length))

//console.log('column texts: ', txt2)
