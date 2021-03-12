# Datepicker Extension

## Explanation

This service listens for user messages from Sunshine Conversations and responds with a button triggering a webview. The webview acts as a multi-page form, which when submitted makes a call to the backend of this service containing the data submitted by the user. The backend then calls Sunshine Conversations to echo the selection into the conversation as a user message.

## Prerequisites

_This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app)._
_See the `package.json` for all dependencies_

## Setup

1. Run `git clone https://github.com/zendesk/sunshine-conversations-conversation-extension-examples.git` and `cd datepicker-react`
2. Run `npm install`
3. Expose the port you're running this service on (8000 is the deafult) to the web (e.g. using a service like ngrok.io)
4. Create a .env file with the credentials necessary to run this service using the .env.example as a guide
5. Run `npm start` to run the service and react app together, which by default will run on ports `8000` and `3000` respectively.
6. Configure a V2 webhook for _Conversation message_ events at `https://app.smooch.io/apps/APP_ID/webhooks` to point towards the ngrok/other link exposing the port being used at the route `/api/webhooks`

## Try it out!

1. Open your browser to your ngrok URL
2. Click the "Add Messenger" button
3. Check out the intents.js file to see what text can be used to trigger a conversation-extension button

## Overview

Port 8000 hosts the web service, which hosts the following endpoints:
- `/api/webhooks`: listens for webhooks from your Smooch app
- `/appId`: sends the `appId` to the react app to setup the messenger (based on the info provided in the `.env` file)
- `/date`: listens for the date date submitted by the user, and creates a user message with that information.

The web service will also proxy all other HTTP requests to port 3000, which hosts the React app. It includes:
- `/` the messenger page
- `/datepicker-simple` the webpage that will be sent as a webview

