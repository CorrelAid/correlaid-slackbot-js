const verifyUtils = require('../src/utils/verifyUtils');
describe('verify request from slack', () => {
  const req = {
    headers: {
      'X-Slack-Request-Timestamp': '1531420618',
      'X-Slack-Signature':
        'v0=9934ca6c7f0c1722aae9c49560cdab6fca9f3f42b10f54f0defe1265fa43e548',
    },
    body:
      'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c',
  };

  test('create basestring', () => {
    const basestring = verifyUtils.createBasestring(req);
    expect(basestring).toBe(
      'v0:1531420618:token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c'
    );
  });

  test('create signature', () => {
    const secret = 'MY_SLACK_SIGNING_SECRET';
    const signature = verifyUtils.createSignature(req, secret);
    expect(signature).toBe(req.headers['X-Slack-Signature']);
  });

  test('is verified', () => {
    const secret = 'MY_SLACK_SIGNING_SECRET';
    expect(verifyUtils.requestIsVerified(req, secret)).toBe(true);
  });

  test('is not verified', () => {
    const secret = 'MY_SLACK_SIGNING_SECRET';
    const falseReq = {
      headers: {
        'X-Slack-Request-Timestamp': '1531420618',
        'X-Slack-Signature': 'v0=wrongsignature',
      },
      body:
        'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c',
    };
    expect(verifyUtils.requestIsVerified(falseReq, secret)).toBe(false);
  });
});
