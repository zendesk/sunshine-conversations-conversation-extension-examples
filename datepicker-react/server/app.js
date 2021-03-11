require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const SunshineConversationsApi = require("sunshine-conversations-client");
const moment = require("moment");
const { triggerConversationExtension } = require("./intents");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

const { APP_ID: appId, INTEGRATION_ID: integrationId, KEY_ID, SECRET, REACT_APP_SERVER_URL } = process.env;
const REACT_APP_PORT = process.env.PORT || 3000;

const defaultClient = SunshineConversationsApi.ApiClient.instance;
const basicAuth = defaultClient.authentications["basicAuth"];
basicAuth.username = KEY_ID;
basicAuth.password = SECRET;

const messagesApiInstance = new SunshineConversationsApi.MessagesApi();

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());
app.get("/appId", sendAppId);
app.get("/integrationId", sendIntegrationId);
app.post("/date", handleDate);
app.post("/api/webhooks", handleMessage);

// Proxy all other routes to the react app
app.get("*", (req, res) => {
  proxy.web(req, res, { target: `http://localhost:${REACT_APP_PORT}` });
});

function sendAppId(req, res) {
  res.send(JSON.stringify({ appId }));
}

function sendIntegrationId(req, res) {
  res.send(JSON.stringify({ integrationId }));
}

async function handleDate(req, res) {
  const { selectedDate, userId, conversationId } = req.body;
  const formattedDate = moment(selectedDate).format("MMM Do YYYY");
  try {
    let messagePost = new SunshineConversationsApi.MessagePost();
    messagePost.setAuthor({ type: "user", userId });
    messagePost.setContent({ type: "text", text: formattedDate });
    await messagesApiInstance.postMessage(appId, conversationId, messagePost);
  } catch (error) {
    console.log("handleDate ERROR: ", error);
  }
  res.end();
}

async function handleMessage(req, res) {
  // Ignore v1 webhooks
  if (req.body.version) {
    console.log("Old version webhooks are received. Please use v2 webhooks.");
    return res.end();
  }

  const message = req.body.events[0].payload.message;
  const trigger = req.body.events[0].type;
  const conversationId = req.body.events[0].payload.conversation.id;
  const author = req.body.events[0].payload.message.author.type;
  const userId = req.body.events[0].payload.message.author.userId;

  // Ignore if it is not a user message
  if (trigger !== "conversation:message" || author !== "user") {
    return res.end();
  }

  try {
    const text = message.content.text.toLowerCase();
    triggerConversationExtension.forEach((trigger) => {
      text.includes(trigger) && sendWebView(conversationId, userId);
    });
  } catch (err) {
    console.log("Error in webhook handler", err);
    res.status(500).send(err.message);
  }

  res.end();
}

async function sendWebView(conversationId, userId) {
  let messagePost = new SunshineConversationsApi.MessagePost();
  messagePost.setAuthor({ type: "business" });
  messagePost.setContent({
    type: "text",
    text: "Select your delivery date from the calendar.",
    actions: [
      {
        type: "webview",
        size: "full",
        text: "Select Date",
        uri: `${REACT_APP_SERVER_URL}/datepicker-simple?userId=${userId}&conversationId=${conversationId}`,
        fallback: REACT_APP_SERVER_URL,
      },
    ],
  });
  await messagesApiInstance.postMessage(appId, conversationId, messagePost);
}

module.exports = app;
