# Dialogflow CloudAPI Connector

## How to Connect With CloudAPI with Dialogflow

**Before Starting** - Create your Dialogflow project and also a Meta App, we will use both of them for the connection.

**Step 1 -** Open the Google Console for Cloud Functions ([here](https://console.cloud.google.com/functions)) and make sure you have the Google Project of your Dialogflow chatbot selected.

**Step 2 -** Click on "Create Function" to open the interface for function creation.

**Step 3-** Set the name of the function (**cloudapi-conector** is a good option)

**Step 4-** On the **Source Code** option, select **Inline Editor** .

**Step 5-** In the **index.js** tab, copy and paste the code from the index.js file in this repository.

**Step 6-** In the **package.json** tab, copy and paste the code from the package.json file in this repository.

**Step 7** - Set the **Function to Execute** field to "**cloudAPI**"

**Step 8** - Change the variables in the code called:

- **projectId** (the project ID found on your Dialogflow's agent settings page)
- **whatsAppToken** (your WhatsApp token value, found on the Meta Developer page for the app)
- **verifyToken** (set by you on the WhatsApp Webhook Configuration)
