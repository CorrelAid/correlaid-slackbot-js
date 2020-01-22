require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');
const utils = require('../utils/utils');
const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;

const open_conversation = user => {
  // open conversation
  // https://api.slack.com/methods/conversations.open
  // send urlencoded, not as json (authorization would be set as header)
  // -> use stringify
  return axios
    .post(
      'https://slack.com/api/conversations.open',
      querystring.stringify({
        token: SLACK_API_TOKEN,
        users: user,
      })
    )
    .then(response => {
      if (response.data.ok === false) {
        console.log(
          `error opening conversation: ${response.data.ok}: ${response.data.error}`
        );
        console.log(response);
        return response.data.error;
      } else {
        const channelId = response.data.channel.id;
        return channelId;
      }
    })
    .catch(error => {
      console.log(error);
      return false;
    });
};

async function send_welcome_message_to(user) {
  // open conversation
  const channelId = await open_conversation(user);

  if (typeof channelId != 'string') {
    console.error('something went wrong during opening the conversation.');
    return channelId;
  } else {
    const message = await utils.readFromFile('./src/messages/welcome_message.txt');
    return send_message_to(user, message);
  }
}

const send_message_to = (channelId, message) => {
  return axios
    .post(
      'https://slack.com/api/chat.postMessage',
      querystring.stringify({
        token: SLACK_API_TOKEN,
        channel: channelId,
        text: message,
        as_user: true,
      })
    )
    .then(function(response) {
      if (response.data.ok === false) {
        console.log(
          `error sending message: ${response.data.ok}: ${response.data.error}`
        );
        return response.data.error;
      }
    })
    .catch(function(error) {
      console.log(error);
      return error;
    });
};

const postToChannel = async (channelId, message) => {
  return axios
    .post(
      'https://slack.com/api/chat.postMessage',
      querystring.stringify({
        token: SLACK_API_TOKEN,
        channel: channelId,
        text: message,
      })
    )
    .then(function(response) {
      if (response.data.ok == false) {
        console.log(
          `error comenting on post: ${response.data.ok}: ${response.data.error}`
        );
        return response.data.error;
      } else {
      }
    })
    .catch(function(error) {
      console.log(error);
      return error;
    });
};

const commentOnPost = async (messageTs, channelId, message) => {
  return axios
    .post(
      'https://slack.com/api/chat.postMessage',
      querystring.stringify({
        token: SLACK_API_TOKEN,
        channel: channelId,
        text: message,
        thread_ts: messageTs,
      })
    )
    .then(function(response) {
      if (response.data.ok == false) {
        console.log(
          `error comenting on post: ${response.data.ok}: ${response.data.error}`
        );
        return response.data.error;
      } else {
        console.log('successfully commented on post.');
      }
    })
    .catch(function(error) {
      console.log(error);
      return error;
    });
};

module.exports = {
  postToChannel,
  commentOnPost,
};
