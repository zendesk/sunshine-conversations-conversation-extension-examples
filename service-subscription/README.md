# Service Subscription
![Service Subscription Preview](https://smooch.io/static_assets/images/shared/service-subscription-preview.jpg)

## Prerequisites

This example is built with `node.js` and `express`.

## Setup

1. `npm install`

2. using _.env.example_ as a template create a _.env_ file with the credentials necessary to run this service

3. expose the port you're running this service on to the web (e.g. using a service like ngrok.io)

4. `npm start`

5. configure a [Smooch appUser message webhook](https://app.smooch.io/integrations/webhook) to point to http://your_service/api/webhooks

## Try it out

1. take a look at the intents.json file to see the text that can be used to trigger a conversation-extension button

2. integrate a messaging channel to Smooch and send one of the intent messages to get started

## Learn More

To learn more about conversation extensions see the [Guide](https://docs.smooch.io/guide/conversation-extensions/), where you can also follow along with an example written in React.
