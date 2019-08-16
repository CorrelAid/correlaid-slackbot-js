slackUtils = require('../src/utils/slackUtils');

describe('containsLinkFromDomain', () => {
  test('empty -> negative ', async () => {
    const targetDomain = 'hackmd.io';
    const linkList = [];

    const response = await slackUtils.containsLinkFromDomain(
      linkList,
      targetDomain
    );

    expect(response).toBe(false);
  });

  test('one link - one positive ', async () => {
    const targetDomain = 'hackmd.io';
    const linkList = [
      { url: 'https://hackmd.io/xxejfklejwlerj', domain: 'hackmd.io' },
    ];

    const response = await slackUtils.containsLinkFromDomain(
      linkList,
      targetDomain
    );

    expect(response).toBe(true);
  });

  test('one link - one negative ', async () => {
    const targetDomain = 'hackmd.io';
    const linkList = [
      { url: 'https://foo.io/xxejfklejwlerj', domain: 'foo.io' },
    ];

    const response = await slackUtils.containsLinkFromDomain(
      linkList,
      targetDomain
    );

    expect(response).toBe(false);
  });

  test('two links - one positive ', async () => {
    const targetDomain = 'hackmd.io';
    const linkList = [
      { url: 'https://hackmd.io/xxejfklejwlerj', domain: 'hackmd.io' },
      { url: 'https://foo.io/xxejfklejwlerj', domain: 'foo.io' },
    ];

    const response = await slackUtils.containsLinkFromDomain(
      linkList,
      targetDomain
    );

    expect(response).toBe(true);
  });
});

describe('readFromFile function', () => {
  test('read in file', () => {
    const message = slackUtils.readFromFile('./test/data/welcome_message.txt');
    expect(message).toBe('Hi you!');
  });

  test('non-existing file', () => {
    expect(() => {
      const message = slackUtils.readFromFile('./test/data/doesnotexist.txt');
    }).toThrow();
  });
});
