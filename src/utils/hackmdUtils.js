require("dotenv").config();
const axios = require("axios");
const querystring = require("querystring");
const utils = require("../utils/utils");
const cheerio = require("cheerio");
const request = require("request");
const slackUtils = require("../utils/slackUtils");

const cleanUrl = url => {
  editRegex = /\?both$/;
  return url.replace(editRegex, "");
};

const checkHackmdInDynamo = async (dynamoDb, url) => {
  const params = {
    TableName: process.env.HACKMD_TABLE,
    Key: {
      url: url
    }
  };

  isInDynamoDb = await dynamoDb
    .get(params)
    .promise()
    .then(result => {
      if (result.Item) {
          return true
      } 
      return false
    })
    .catch(error => {
      console.error("couldn't find hackmd", error);
      return false;
    });
    return isInDynamoDb;
};

const addHackmdToDynamo = async (dynamoDb, url, data) => {
  const isAlreadyInDynamo = await checkHackmdInDynamo(dynamoDb, url)
  if (isAlreadyInDynamo) {
    message = `${url} already in dynamodb. doing nothing.`
    console.log(message);
    slackUtils.postToChannel(process.env.DEBUG_CHANNEL, message);
    return;
  }
  const $ = await loadHtml(url);
  const title = getTitle($);
  await createHackmdEntry(dynamoDb, url, title, data);
};

const createHackmdEntry = async (dynamoDb, url, title, data) => {
  const params = {
    TableName: process.env.HACKMD_TABLE,
    Item: {
      url: url,
      title: title,
      data: data
    }
  };
  await dynamoDb.put(params, function(err, data) {
    if (err) {
      strErr = `unable to add item: ${JSON.stringify(err, null, 2)}`;
      console.error(strErr);
      slackUtils.postToChannel(process.env.DEBUG_CHANNEL, strErr);
    } else {
      message = `added item: ${JSON.stringify(params, null, 2)}`;
      console.log(message);
      slackUtils.postToChannel(process.env.DEBUG_CHANNEL, message);
    }
  });
};

const loadHtml = async hackmdURL => {
  const $ = await axios
    .get(hackmdURL)
    .then(response => {
      if (response.status === 200) {
        return cheerio.load(response.data);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  return $;
};

const getMarkdown = $ => {
  return $("div#doc").text();
};

const getTitle = $ => {
  fullTitle = $("head title").text();
  const regex = / - HackMD$/;

  // strip " - HackMD" from title
  try {
    title = fullTitle.replace(regex, "");
  } catch (error) {
    console.log(error);
    title = fullTitle;
  }
  return title;
};
module.exports = {
  loadHtml,
  getTitle,
  cleanUrl,
  getMarkdown,
  createHackmdEntry,
  addHackmdToDynamo
};
