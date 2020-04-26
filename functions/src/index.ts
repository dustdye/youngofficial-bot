import { https } from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { ServerClient } from "postmark";

export const webhook = https.onRequest(async (request, response) => {
    try {

        const _agent = new WebhookClient({ request, response });
        console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
        console.log('Dialogflow Request body: ' + JSON.stringify(request.body));


        async function getEmail(agent: WebhookClient) {

            console.log("GetEmail agent.parameters: ", agent.parameters);
            console.log("user said: ", agent.query);


            if (!agent.parameters.email) {
                agent.add("please tell me your email, I will forward it to human support agent and he will get in touch with you as soon as possible");
            } else if (!agent.parameters.question) { // slot filling for every parameter is not in use
                agent.add(`please re-phrase your question so I will forward your question along with your email too`);
            } else {

                // const serverTokenDev = "0cb9fc14-bdcb-4616-9be7-fa501b6c39a9";
                const serverToken = "28733ad7-6334-445d-a62d-2fe47612608b";
                const client = new ServerClient(serverToken);

                await client.sendEmail({
                    "ReplyTo": agent.parameters.email,
                    "From": "info@sysborg.com",
                    "To": "gist-edcclxgk@inbound.gistmail1.com",
                    "Subject": "email Support request",
                    "TextBody": `Hey,
            I was trying to talk with chatbot on https://youngofficial.com/test-bot/ but I didn't get my problem solved
            My Email: ${agent.parameters.email}
            My Question: "${agent.query}"
            
            thanks`

                })
                    .then((sendingResponse) => {
                        console.log("sending response: ", sendingResponse);
                        agent.add(`Awesome. your email noted as ${agent.parameters.email} We will be in touch soon regarding your question: "${agent.query}".`);
                        return;
                    })
                    .catch(e => {
                        console.log("unable to send email.error: ", e);
                        agent.add("unable to send email postmark is under review");
                        return;
                    });
            }
        }

        function refTest(agent: WebhookClient) {

            console.log("agent.contexts: ", agent.contexts);
            console.log("agent.requestSource: ", agent.requestSource);
            console.log("request.body: ", request.body);
            console.log("request.body: ", JSON.stringify(request.body));
            // console.log("agent.contexts.botcopy-ref-context: ", agent.contexts["botcopy-ref-context"]);

            // agent.add("I have received these in context: " + JSON.stringify(agent.contexts))
            // agent.add("everything I received in request is here: " + JSON.stringify(request.body))

            agent.add("Hi! Can I help you? 😁")

        }

        const intentMap = new Map();
        intentMap.set('GetEmail', getEmail);
        intentMap.set('Default Welcome Intent', refTest);

        // tslint:disable-next-line: no-floating-promises
        _agent.handleRequest(intentMap);
    } catch (e) {
        console.log("main error catch: ", e);
    }
});





const a = {
    "responseId": "16c94138-135b-4241-83b7-7145de74ae25-eec93b43",
    "queryResult": {
        "queryText": "GOOGLE_ASSISTANT_WELCOME",
        "action": "input.welcome",
        "parameters": {},
        "allRequiredParamsPresent": true,
        "fulfillmentText": "Hi! Can I help you? 😁",
        "fulfillmentMessages": [{ "text": { "text": ["Hi! Can I help you? 😁"] } }],
        "outputContexts": [{
            "name": "projects/ygy1-living/agent/sessions/887b5760-bd7b-0753-3173-46f0d417b979/contexts/visitorinteraction1",
            "lifespanCount": 5
        }],
        "intent": {
            "name": "projects/ygy1-living/agent/intents/185c0e7c-6f2c-461a-b723-af748d73712a",
            "displayName": "Default Welcome Intent"
        },
        "intentDetectionConfidence": 1,
        "languageCode": "en"
    },
    "originalDetectIntentRequest": { "payload": {} },
    "session": "projects/ygy1-living/agent/sessions/887b5760-bd7b-0753-3173-46f0d417b979"
}
