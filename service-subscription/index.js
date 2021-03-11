"use strict";
require("dotenv").config();

const express = require("express");
const SunshineConversationsApi = require("sunshine-conversations-client");
const bodyParser = require("body-parser");
const path = require("path");
const { triggerConversationExtension } = require("./intents.js");

const PORT = process.env.PORT || 8999;
const { APP_ID: appId, INTEGRATION_ID: integrationId, KEY_ID, SECRET, SERVICE_URL } = process.env;

const defaultClient = SunshineConversationsApi.ApiClient.instance;
const basicAuth = defaultClient.authentications["basicAuth"];
basicAuth.username = KEY_ID;
basicAuth.password = SECRET;

const messagesApiInstance = new SunshineConversationsApi.MessagesApi();

express()
  .use(express.static(path.join(__dirname + "/public")))
  .use(bodyParser.json())
  .post("/api/response", webviewSubmissionHandler)
  .post("/api/webhooks", userMessageHandler)
  .get("/api/appId", sendAppId)
  .get("/api/integrationId", sendIntegrationId)
  .get("/", showMessenger)
  .listen(PORT, () => console.log("listening on port " + PORT));

function showMessenger(req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
}

function sendAppId(req, res) {
  res.send(JSON.stringify({ appId }));
}

function sendIntegrationId(req, res) {
  res.send(JSON.stringify({ integrationId }));
}

async function webviewSubmissionHandler(req, res) {
  const { imagePath, userId, text, conversationId } = req.body;
  const mediaUrl = imagePath ? `${SERVICE_URL}${imagePath}` : undefined;

  try {
    let messagePost = new SunshineConversationsApi.MessagePost();
    messagePost.setAuthor({ type: "user", userId });
    messagePost.setContent({
      type: imagePath ? "image" : "text",
      mediaUrl,
      text,
    });
    await messagesApiInstance.postMessage(appId, conversationId, messagePost);
  } catch (err) {
    console.log("Error in response handler", err);
    res.status(500).send(err.message);
  }
}

async function userMessageHandler(req, res) {
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
    text: "We have a range of baskets to suit any taste!",
    actions: [
      {
        type: "webview",
        text: "Choose a subscription",
        uri: `${SERVICE_URL}/subscription.html?userId=${userId}&conversationId=${conversationId}`,
        fallback: SERVICE_URL,
      },
    ],
  });
  await messagesApiInstance.postMessage(appId, conversationId, messagePost);
}
