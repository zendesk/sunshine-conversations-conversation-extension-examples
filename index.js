'use strict';
require('dotenv').config();

const express = require('express');
const Smooch = require('smooch-core');
const bodyParser = require('body-parser');
const intents = require('./intents.json')

const PORT = process.env.PORT || 8999;

const smooch = new Smooch({
  keyId: process.env.KEY_ID,
  secret: process.env.SECRET,
  scope: 'account'
});

express()
  .use(express.static('public'))
  .use(bodyParser.json())
  .post('/api/response', webviewSubmissionHandler)
  .post('/api/webhooks', appUserMessageHandler)
  .listen(PORT, () => console.log('listening on port ' + PORT));

function webviewSubmissionHandler(req, res) {
  smooch.appUsers.sendMessage(req.body.appId, req.body.userId, {
    mediaUrl: req.body.imagePath ? process.env.SERVICE_URL + req.body.imagePath : undefined,
    text: req.body.text,
    role: 'appMaker',
    type: req.body.imagePath ? 'image' : 'text',
  })
  	.then(() => res.end())
  	.catch((err) => {
  		console.log('Error in response handler', err);
  		res.status(500).send(err.message);
  	});
}

function appUserMessageHandler(req, res) {
    if (req.body.trigger !== 'message:appUser') {
      return res.end();
    }

    let messageData;

    for (const message of req.body.messages) {
    	const response = intents[message.text];
    	if (response) {
    		messageData = response;
    	}
    }

    if (messageData) {
 		return sendWebView(req.body.appUser._id, messageData.text, messageData.buttonText, messageData.path)
 			.then(() => res.end())
 			.catch((err) => {
 				console.log('Error in webhook handler', err);
 				res.status(500).send(err.message);
 			})
    }

    res.end();
}

function sendWebView(userId, text, buttonText, path) {
    return smooch.appUsers.sendMessage(process.env.APP_ID, userId, {
            role: 'appMaker',
            type: 'text',
            text: text,
            actions: [{
                type: 'webview',
                text: buttonText,
                size: 'tall',
                uri: `${process.env.SERVICE_URL}/examples/${path}?userId=${userId}&appId=${process.env.APP_ID}`,
                fallback: `${process.env.SERVICE_URL}/examples/${path}?userId=${userId}&appId=${process.env.APP_ID}`,
                extraChannelOptions: {
                  messenger: {
                    messenger_extensions: true
                  }
                }
            }]
        });
}
