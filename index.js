const axios = require("axios").default;

// WhatsApp
const whatsAppToken =
  "EAAH3ozqtzPQBAMNaQ5igFoOBZBXVV5hO1GYJgqCSh1ZCa27ZCXeJwK9ZCkbZAFO0RphDAEF1aCv47RQEvItH4exSEN4cdKN6TOYNBLyYY4XXyC0FJLNtJDdYJLpaOtX95ZCcnRRXZATkWFvZAOtvGZB84XPVvT1YQCXPPAHbsFXSsySfiRkckCmYsEV22nkYEys8jjh7zN5eEkxSxGhbM6haC";

// Dialogflow
const dialogflow = require("dialogflow");
const sessionClient = new dialogflow.SessionsClient();
const projectId = "cosmobots-bwcgin";

exports.cloudAPI = async (req, res) => {
  const verify_token = "ABC";

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      // Get Variables
      let to = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

      // Define Dialogflow Session
      const sessionPath = sessionClient.sessionPath(projectId, from);
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: msg_body,
            languageCode: "pt-BR",
          },
        },
      };

      // Get Dialogflow Responses
      try {
        const fulfillmentMessages = (
          await sessionClient.detectIntent(request)
        )[0].queryResult.fulfillmentMessages;
        for (const response of fulfillmentMessages) {
          let responseMsg = "";
          if (response.text) {
            for (const text of response.text.text) {
              responseMsg = `${responseMsg}${text}\n`;
            }
          }
          await sendMessage(to, from, responseMsg);
        }
      } catch (e) {
        console.log(e);
      }
      res.sendStatus(200);
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
};

const sendMessage = async (to, from, msg_body) => {
  await axios({
    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    url:
      "https://graph.facebook.com/v12.0/" +
      to +
      "/messages?access_token=" +
      whatsAppToken,
    data: {
      messaging_product: "whatsapp",
      to: from,
      text: { body: msg_body },
    },
    headers: { "Content-Type": "application/json" },
  });
};
