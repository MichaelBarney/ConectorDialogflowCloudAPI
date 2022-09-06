const axios = require("axios").default;
const dialogflow = require("dialogflow");

// Variables
const projectId = "PROJECT_ID";
const whatsAppToken = "WHATSAPP_TOKEN";
const verifyToken = "VERIFY_TOKEN";

// Dialogflow
const sessionClient = new dialogflow.SessionsClient();

exports.cloudAPI = async (req, res) => {
  // VERIFICATION
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }

  // RESPONSE
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
        res.sendStatus(403);
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
