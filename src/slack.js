const axios = require('axios');
const responses = require('./utils/responses');
const logger = require('./utils/logger');
const slackUtils = require('./utils/slackUtils');
const verifyUtils = require('./utils/verifyUtils');

const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

module.exports.handler = async function(event, context) {
  // check whether request is coming from slack
  if (!verifyUtils.requestIsVerified(event, SLACK_SIGNING_SECRET)) {
    return responses.buildForbiddenResponse();
  }

  const eventBody = JSON.parse(event.body);
  console.log(eventBody);

  if (eventBody.type === 'url_verification') {
    const urlVerificationResponse = responses.buildUrlVerificationResponse(
      eventBody
    );
    return urlVerificationResponse;
  } else if (eventBody.type === 'event_callback') {
    const slackEvent = eventBody.event;
    console.debug(slackEvent);
    // send welcome message
    if (slackEvent.type === 'member_joined_channel') {
      const channel = slackEvent.channel;
      const user = slackEvent.user;
      // only if user joined #willkommen
      if (channel === 'C1G5WNB7C') {
        await slackUtils.send_welcome_message_to(user);
        return responses.buildSuccessResponse('success');
      }
    } else if (slackEvent.type === 'link_shared') {
      if (slackUtils.containsLinkFromDomain(slackEvent.links, 'hackmd.io')) {
        const message = slackUtils.readFromFile(
          './src/messages/link_to_orgapad.txt'
        );
        await slackUtils.commentOnPost(
          slackEvent.message_ts,
          slackEvent.channel,
          message
        );
        return responses.buildSuccessResponse('success');
      }
    }
  }
};
