import { https } from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { ServerClient } from "postmark";


export const webhook = https.onRequest((request, response) => {
    const _agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));


    function getEmail(agent: WebhookClient) {
        const serverToken = "92220d22-388d-4063-9053-924c4245bb83";
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

        }).catch(e => {
            console.log("error: ", e);
            agent.add("unable to send email postmark is under review");
        });
    }


    const intentMap = new Map();
    intentMap.set('GetEmail', getEmail);

    // tslint:disable-next-line: no-floating-promises
    _agent.handleRequest(intentMap);
});

