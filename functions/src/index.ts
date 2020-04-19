import { https } from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { ServerClient } from "postmark";

export const webhook = https.onRequest(async (request, response) => {
    try {

        const _agent = new WebhookClient({ request, response });
        console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
        console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

        function getEmail(agent: WebhookClient) {
            const serverToken = "0cb9fc14-bdcb-4616-9be7-fa501b6c39a9";
            const client = new ServerClient(serverToken);

            client.sendEmail({
                "From": "contact@supportgrow.com",
                "To": "gist-edcclxgk@inbound.gistmail1.com",
                "Subject": "email Support request",
                "TextBody": `Hey,
            I was trying to talk with you chatbot on https://youngofficial.com/test-bot/ but I didn't get my problem solved
            I am leaving my email address for an agent to guide me: ${agent.parameters.email}
            
            thanks`

            }).then((sendingResponse) => {
                console.log("sending response: ", sendingResponse);
                agent.add(`Awesome. your email noted as ${agent.parameters.email} We will be in touch soon.`);
                return;

            }).catch(e => {
                console.log("error: ", e);
                agent.add("unable to send email postmark is under review");
                return;
            });
        }

        const intentMap = new Map();
        intentMap.set('GetEmail', getEmail);

        // tslint:disable-next-line: no-floating-promises
        _agent.handleRequest(intentMap);
    } catch (e) {
        console.log("main error catch: ", e);
    }
});

