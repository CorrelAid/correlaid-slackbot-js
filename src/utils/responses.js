const buildUrlVerificationResponse = body => {
  return {
    statusCode: 200,
    body: body.challenge,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

const buildForbiddenResponse = () => {
  return {
    statusCode: 403,
    body: JSON.stringify({
      message: 'Forbidden',
      code: 403,
    }),
  };
};

const buildSuccessResponse = message => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: message,
      code: 200,
    }),
  };
};

module.exports = {
  buildUrlVerificationResponse,
  buildSuccessResponse,
  buildForbiddenResponse,
};
