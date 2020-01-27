const fs = require('fs')

const readFromFile = path => {
    try {
        const message = fs.readFileSync(path, 'utf-8')
        return message
    } catch (error) {
        console.error('error during reading file:', error)
        throw error
    }
}

const stringifyErr = (error, beforeTxt = '') => {
    strErr = JSON.stringify(error, null, 2)
    strErr = `${beforeTxt} ${error.stack}}`
    return strErr
}

const getCommandArgs = text => {
    let commandArgsList = text.trim().split(' ')

    // filter out '' and extract data from list
    commandArgsList = commandArgsList.filter(
        word => !['', '\t', '\n'].includes(word)
    )
    const subcommand = commandArgsList[0]
    const subcommandArgs = commandArgsList.slice(1)

    return {
        subcommand: subcommand,
        subcommandArgs: subcommandArgs.length == 0 ? undefined : subcommandArgs,
    }
}

const containsLinkFromDomain = (linkList, targetDomain) => {
    const linksFiltered = linkList.filter(link => link.domain === targetDomain)
    return linksFiltered.length > 0
}

module.exports = {
    containsLinkFromDomain,
    readFromFile,
    getCommandArgs,
    stringifyErr,
}
