'use strict';
require('dotenv').config();

const express = require('express');
const Smooch = require('smooch-core');
const bodyParser = require('body-parser');
const { triggerConversationExtension } = require('./intents.js')

const PORT = process.env.PORT || 8999;
const { 
    APP_ID: appId,
    KEY_ID,
    SECRET,
    SERVICE_URL
} = process.env;

const smooch = new Smooch({
    keyId: KEY_ID,
    secret: SECRET,
    scope: 'account'
});

express()
    .use(express.static('public'))
    .use(bodyParser.json())
    .post('/api/response', webviewSubmissionHandler)
    .post('/api/webhooks', appUserMessageHandler)
    .listen(PORT, () => console.log('listening on port ' + PORT));

async function webviewSubmissionHandler(req, res) {
    const { imagePath, userId, text } = req.body;
    const mediaUrl = imagePath ? `${SERVICE_URL}${imagePath}` : undefined;

    try {
        await smooch.appUsers.sendMessage({
            appId,
            userId,
            message: {
                role: 'appUser',
                type: imagePath ? 'image' : 'text',
                mediaUrl,
                text,
            }
        });
    } catch (err) {
        console.log('Error in response handler', err);
        res.status(500).send(err.message);
    }
}

async function appUserMessageHandler(req, res) {
    const { messages, trigger, appUser: { _id: userId } } = req.body;

    if (trigger !== 'message:appUser') {
        return res.end();
    }
    try {
        for (const message of messages) {
            const text = message.text.toLowerCase();

            triggerConversationExtension.forEach(trigger => {

                (text.includes(trigger)) && sendWebView(userId);
            });
        }
    } catch (err) {
        console.log('Error in webhook handler', err);
        res.status(500).send(err.message);
    }

    res.end();
}

async function sendWebView(userId) {
    await smooch.appUsers.sendMessage({
        appId,
        userId,
        message: {
            role: 'appMaker',
            type: 'text',
            text: 'We have a range of baskets to suit any taste!',
            actions: [{
                type: 'webview',
                text: 'Choose a subscription',
                uri: `${SERVICE_URL}?userId=${userId}`,
                fallback: SERVICE_URL
            }]
        }
    });
}