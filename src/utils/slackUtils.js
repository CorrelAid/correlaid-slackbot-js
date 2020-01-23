require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');
const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;

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

module.exports = {
  postToChannel,
};
