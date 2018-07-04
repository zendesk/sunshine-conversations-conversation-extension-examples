# Datepicker Extension

## Explanation

This service listens for appUser messages from Smooch and responds with a button triggering a webview. The webview acts as a multi-page form, which when submitted makes a call to the backend of this service containing the data submitted by the user. The backend then calls Smooch to echo the selection into the conversation as an appUser message.

## Prerequisites

_This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app)._
_See the `package.json` for all dependencies_

## SETUP

1. run `git clone this_repo`
2. run `npm install`
3. expose the port you're running this service on to the web (e.g. using a service like ngrok.io)
4. create a .env file with the credentials necessary to run this service using the .env.example as a guide
5. run `npm run develop` to run the server
6. configure a webhook for All basic triggers at 'https://app.smooch.io/apps/APP_ID/webhooks' to point towards the ngrok/other link exposing the port being used at the route '/webhooks'

## Try it out!

1. open your browser to localhost:3000 (this is where the react app is deployed)
2. click the "Add Messenger" button
3. check out the intents.js file to see what text can be used to trigger a conversation-extension button

## Note

The React app includes
- `/` the messenger page
- `/datepicker-simple` the webpage that will be sent as a webview

The server has the following endpoints:
- `/webhooks`: listens for wbhooks from your Smooch app
- `/appId`: sends the `appId` to the react app to setup the messenger (based on the info provided in the `.env` file)
- `/date`: listens for the date date submitted by the user, and creates a user message with that information.