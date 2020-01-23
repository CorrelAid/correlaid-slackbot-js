crypto = require('crypto')
const createBasestring = req => {
    const version = 'v0'
    const ts = req.headers['X-Slack-Request-Timestamp']
    const body = req.body
    return `${version}:${ts}:${body}`
}

const createSignature = (req, secret) => {
    const baseString = createBasestring(req)
    const hash = crypto
        .createHmac('sha256', secret)
        .update(baseString)
        .digest('hex')
    return 'v0=' + hash
}

const requestIsVerified = (req, secret) => {
    const sig = createSignature(req, secret)
    return req.headers['X-Slack-Signature'] === sig
}

module.exports = {
    createBasestring,
    createSignature,
    requestIsVerified,
}
