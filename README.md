# correlaid-slackbot-js

reimplemenation of correlaid slackbot in javascript.

# install

install nodejs dependencies:

```
yarn install
```

# test

```
yarn test
```

# lint 
so far, only code formatting via `prettier` is implemented. To run:

```
yarn lint
```

# deploy to aws

## requirements

You need a `yml` file in the root folder with the environment variables for the application. The file name should follow `env_{stage}.yml`, depending on to which stage you want to deploy to. Examples:

- `env_dev.yml`
- `env_prod.yml`

The variables are (used in `serverless.yml`):

- `SLACK_API_TOKEN`: the "Bot User Oauth Access Token" of the CorrelBot Slack App. You can find it on the "OAuth & Permissins" subpage of the CorrelBot Slack App page (only accessible with the suitable permissions for the CorrelAid workspace).
- `SLACK_SIGNING_SECRET`: the signing secret that slack uses to generate the [signature header](https://api.slack.com/docs/verifying-requests-from-slack). You can find it on the "Basic Information" page of the CorrelBot Slack App (only accessible with the suitable permissions for the CorrelAid workspace).
- `SLACK_PROJECTS_CHANNEL`: ID of channel where the automated project update should be posted each Monday morning.
- `GITHUB_PAT`: Github personal access token (PAT) from a user with write access to the `CorrelAid/projects` repository.
- `GITHUB_OWNER`: owner of the repository. In this case, "correlaid". 
- `GITHUB_REPO`: name of repository. In this case, "projects".
- `GITHUB_PROJECT_ID`: ID of the "projects" project in GitHub.

Check `env_template.yml` for how the `env_{stage}.yml` file should look like and generate it accordingly.

## aws credentials

You need to have set up your aws credentials. See [this guide](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

## serverless

You need to have serverless installed.
Find the installation instructions [here](https://serverless.com/framework/docs/getting-started/).

# deploy

## dev

You can deploy the service to the dev stage AWS Lambda with the following command:

```
serverless deploy --aws-profile yourprofilename
```

where `yourprofilename` is the AWS profile you generated earlier when setting up the AWS credentials (e.g. "default").

## prod

```
serverless deploy --aws-profile yourprofilename --stage prod
```

# configure app endpoints

The two `endpoints` that are shown in the serverless output are the ones that need to be put in the slack app configuration:

- POST endpoint ending in `slack-slash` is for the slash command:
  - go to subpage "Slash commands"
  - create slash command if not there
  - under request URL put the POST endpoint
- POST endpoint ending in `slack-events` is for the CorrelBot that reacts to the hackmd messages
  - go to subpage "event subscriptions"#
  - under "subscribe to workspace events", subscribe to the `link_shared` event
  - under request URL put the POST endpoint

# deprecated functionality

The bot also used to send welcome messages to new members of the workspace. This is now replaced by a [Slack workflow](https://slackhq.com/automate-tasks-in-slack-with-workflow-builder).
