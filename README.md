# Conversation Extensions Examples

## Prerequisites

You must have node.js and npm.

## Setup

1. clone the smooch/conversation-extension-examples repository and `cd conversation-extension-examples`

2. `npm install`

3. using _.env.example_ as a template create a _.env_ file with the credentials necessary to run this service

4. expose the port you're running this service on to the web (e.g. using a service like ngrok.io)

5. `npm start`

6. configure a [Smooch appUser message webhook](https://app.smooch.io/integrations/webhook) to point to http://your_service/api/webhooks

## Try it out

1. take a look at the intents.json file to see the text that can be used to trigger a conversation-extension button

2. integrate a messaging channel to Smooch and send one of the intent messages to get started

## Use Cases Examples

Here's a preview of the current Conversation Extension examples covered in this repo. Keep checking back as we'll be adding more examples soon.

### Hotel Booking
![Hotel Booking Preview](https://smooch.io/static_assets/images/shared/hotel-booking-preview.jpg)

### Restaurant Reservation
![Hotel Booking Preview](https://smooch.io/static_assets/images/shared/restaurant-reservation-preview.jpg)

### Service Subscription
![Hotel Booking Preview](https://smooch.io/static_assets/images/shared/service-subscription-preview.jpg)

## Explanation

This service listens for appUser messages from Smooch and responds with a button triggering a webview. Each of the webviews acts as a multi-page form, which wehn submitted makes a call to the backend of this service containing the data submitted by the user. The backend then calls Smooch to echo the selection into the conversation as an appUser message.

To learn more about conversation extensions see the [Guide](https://docs.smooch.io/guide/conversation-extensions/), where you can also follow along with an example written in React.
