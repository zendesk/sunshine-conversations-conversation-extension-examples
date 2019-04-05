'use strict';
require('dotenv').config();

const express = require('express');
const Smooch = require('smooch-core');
const bodyParser = require('body-parser');
const path = require('path');
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
    scope: 'app'
});

express()
    .use(express.static(path.join(__dirname + '/public')))
    .use(bodyParser.json())
    .post('/api/response', webviewSubmissionHandler)
    .post('/api/webhooks', appUserMessageHandler)
    .get('/api/appId', sendAppId)
    .get('/', showMessenger)
    .listen(PORT, () => console.log('listening on port ' + PORT));

function showMessenger(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
}

function sendAppId(req, res) {
    res.send(JSON.stringify({ appId }));
}

async function webviewSubmissionHandler(req, res) {
    const {
        imagePath,
        userId,
        text
    } = req.body;
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
    const {
        messages,
        trigger,
        appUser: {
            _id: userId
        }
    } = req.body;

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
            text: 'We have the following suites available with connecting rooms for 2 nights arriving on Tuesday, December 12th.',
            actions: [{
                type: 'webview',
                text: 'Choose a room',
                uri: `${SERVICE_URL}/hotel-booking.html?userId=${userId}`,
                fallback: SERVICE_URL
            }]
        }
    });
}
