"use strict";
require("dotenv").config();

const express = require("express");
const SunshineConversationsApi = require("sunshine-conversations-client");
const bodyParser = require("body-parser");
const path = require("path");
const { triggerConversationExtension } = require("./intents.js");

const PORT = process.env.PORT || 8999;

const { APP_ID: appId, INTEGRATION_ID: integrationId, KEY_ID, SECRET, REACT_APP_SERVER_URL: SERVICE_URL, BASE_URL: baseUrl } = process.env;

const defaultClient = SunshineConversationsApi.ApiClient.instance;

// Configure base path for Zendesk environments
if (baseUrl) {
  defaultClient.basePath = `${baseUrl}/sc`;
}

const basicAuth = defaultClient.authentications["basicAuth"];
basicAuth.username = KEY_ID;
basicAuth.password = SECRET;

const messagesApiInstance = new SunshineConversationsApi.MessagesApi();

express()
  .use(express.static(path.join(__dirname + "/public")))
  .use(bodyParser.json())
  .post("/api/response", webviewSubmissionHandler)
  .post("/api/webhooks", userMessageHandler)
  .get("/api/config", sendConfig)
  .get("/", showMessenger)
  .listen(PORT, () => console.log("listening on port " + PORT));

function showMessenger(req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
}

function sendConfig(req, res) {
  const config = { integrationId };
  if (baseUrl) {
    config.configBaseUrl = `${baseUrl}/sc/sdk`;
  }
  res.send(JSON.stringify(config));
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

  const event = req.body.events[0];
  const trigger = event.type;

  // Log event type for debugging
  console.log("Received webhook event:", trigger);

  // Only process conversation:message events
  if (trigger !== "conversation:message") {
    console.log("Ignoring non-message event:", trigger);
    return res.end();
  }

  // Check if message exists in payload
  if (!event.payload.message) {
    console.log("No message in payload for conversation:message event");
    return res.end();
  }

  const message = event.payload.message;
  const conversationId = event.payload.conversation.id;
  const author = message.author.type;
  const userId = message.author.userId;

  // Ignore if it is not a user message
  if (author !== "user") {
    console.log("Ignoring non-user message from:", author);
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
    text:
      "We have the following suites available with connecting rooms for 2 nights arriving on Tuesday, December 12th.",
    actions: [
      {
        type: "webview",
        text: "Choose a room",
        uri: `${SERVICE_URL}/hotel-booking.html?userId=${userId}&conversationId=${conversationId}`,
        fallback: SERVICE_URL,
      },
    ],
  });
  await messagesApiInstance.postMessage(appId, conversationId, messagePost);
}
