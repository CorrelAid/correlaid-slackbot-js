const querystring = require('querystring');
const responses = require('../utils/responses');
const verifyUtils = require('../utils/verifyUtils');
const utils = require('../utils/utils');

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

module.exports.handler = async function(event, context) {
  // check whether request is coming from slack
  if (!verifyUtils.requestIsVerified(event, SLACK_SIGNING_SECRET)) {
    return responses.buildForbiddenResponse();
  }

  console.log(event.body);
  const {text, command} = querystring.parse(event.body);
  
  if (command && text) {
      const commandArgs = utils.getCommandArgs(text);      
      if (commandArgs.subcommand == 'details') {
          // post telko details 
          const telkoDetails = utils.readFromFile('./src/messages/telko_details.txt');
          return responses.buildSlashCommandResponse(telkoDetails, 'in_channel');
      } else if (commandArgs.subcommand == 'poll') {
          const pollMessage = 'Ich bin heute abend um 20 Uhr bei der TelKo dabei! :+1: :-1:';
          return responses.buildSlashCommandResponse(pollMessage, 'in_channel');  
      } else {
          // unknown subcommand
          const errorMessage = 'Unknown subcommand. Available: `poll` and `details`';
          return responses.buildSlashCommandResponse(errorMessage, 'ephemeral');
      }
  }
};
