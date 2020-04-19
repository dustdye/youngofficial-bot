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

            const serverToken = "28733ad7-6334-445d-a62d-2fe47612608b";
            const client = new ServerClient(serverToken);

            await client.sendEmail({
                "From": "info@sysborg.com",
                "To": "gist-edcclxgk@inbound.gistmail1.com",
                "Subject": "email Support request",
                "TextBody": `Hey,
            I was trying to talk with you chatbot on https://youngofficial.com/test-bot/ but I didn't get my problem solved
            I am leaving my email address for an agent to guide me: ${agent.parameters.email}
            
            thanks`

            })
                .then((sendingResponse) => {
                    console.log("sending response: ", sendingResponse);
                    agent.add(`Awesome. your email noted as ${agent.parameters.email} We will be in touch soon.`);
                    return;
                })
                .catch(e => {
                    console.log("unable to send email.error: ", e);
                    agent.add("unable to send email postmark is under review");
                    return;
                })
        }

        const intentMap = new Map();
        intentMap.set('GetEmail', getEmail);

        // tslint:disable-next-line: no-floating-promises
        _agent.handleRequest(intentMap);
    } catch (e) {
        console.log("main error catch: ", e);
    }
});

