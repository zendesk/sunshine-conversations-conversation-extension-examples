require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Smooch = require('smooch-core');
const moment = require('moment');
const { triggerConversationExtension } = require('./intents');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

const {
    APP_ID: appId,
    KEY_ID,
    SECRET,
    REACT_APP_SERVER_URL
} = process.env;
const REACT_APP_PORT = process.env.PORT || 3000;

const smooch = new Smooch({
    keyId: KEY_ID,
    secret: SECRET,
    scope: 'account'
});

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.get('/appId', sendAppId);
app.post('/date', handleDate);
app.post('/webhooks', handleMessage);

// Proxy all other routes to the react app
app.get('*', (req, res) => {
    proxy.web(req, res, {target: `http://localhost:${REACT_APP_PORT}`});
});

function sendAppId(req, res) {
    res.send(JSON.stringify({ appId }));
}

async function handleDate(req, res) {
    const { selectedDate, userId } = req.body;
    const formattedDate = moment(selectedDate).format('MMM Do YYYY');
    try {
        await smooch.appUsers.sendMessage({
            appId,
            userId: userId,
            message: {
                type: 'text',
                role: 'appUser',
                text: formattedDate
            }
        });
    } catch (error) {
        console.log('handleDate ERROR: ', error);
    }
    res.end();
}

async function handleMessage(req, res) {
    const {
        messages,
        trigger,
        appUser: {
            _id: userId
        }
    } = req.body;

    // Ignore if it is not a user message
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
            text: 'Select your delivery date from the calendar.',
            actions: [{
                type: 'webview',
                size: 'full',
                text: 'Select Date',
                uri: `${REACT_APP_SERVER_URL}/datepicker-simple?userId=${userId}`,
                fallback: REACT_APP_SERVER_URL
            }]
        }
    });
}

module.exports = app;
