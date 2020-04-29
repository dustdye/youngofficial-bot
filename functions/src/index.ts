import { https } from 'firebase-functions';
import { WebhookClient, Suggestion, Card } from 'dialogflow-fulfillment';
import { ServerClient } from "postmark";
const axios = require('axios').default;



export const webhook = https.onRequest(async (request, response) => {
    try {

        const _agent = new WebhookClient({ request, response });
        console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
        console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

        function getSpreadsheetData() {
            return axios.get('https://sheetdb.io/api/v1/jjabi12qzr5q4');
        }


        // function getProductInfo(agent) {
        //     const name = agent.parameters.name;
        //     return getSpreadsheetData().then(res => {
        //         res.data.map(person => {
        //             if (person.Name === name)
        //                 agent.add(`Here are the details for ${name}. Age: ${person.Age}, Email: ${person.Email}, Phone: ${person.Phone}`);

        //         });
        //     });
        // }

        function getProductInfo(agent: WebhookClient) {
            const productname = agent.parameters.name;

            return getSpreadsheetData().then((res: any) => {
                res.data.map((product: any) => {
                    console.log("product: ", product);

                    if (product.Name === productname) {
                        agent.add(`Here are the details for ${product.Name}. Age: ${product.Age}, Email: ${product.Email}, Phone: ${product.Phone}`);
                        agent.add(new Card({
                            title: product.Name,
                            imageUrl: product.ImageUrl,
                            text: 'some text some text some text some text some text some text some text some text some text some text some text  😱',
                            buttonText: product.ButtonText,
                            buttonUrl: product.LearnMoreUrl
                        })
                        );
                        agent.add(new Suggestion("how are you doing"));
                        agent.add(new Suggestion("cancel"));
                        agent.add(new Suggestion("help"));
                    }
                });
            });
        }

        function CaptureUserInfo(agent: WebhookClient) {
            console.log("agent.parameters: ", agent.parameters);
            const {
                firstname, lastname, email, mobilephone
            } = agent.parameters;

            const data = [{
                firstname: firstname,
                lastname: lastname,
                Email: email,
                mobilephone: mobilephone
            }];
            axios.post('https://sheet.best/api/sheets/36020baa-fccb-4667-af52-90759d44e976', data);
        }

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


        function fallback(agent: WebhookClient) {
            agent.add(`I didn't understand`);
            agent.add(`I'm sorry, can you try again?`);
        }

        const intentMap = new Map();
        intentMap.set('GetEmail', getEmail);
        intentMap.set('Default Welcome Intent', refTest);
        intentMap.set('getProductInfo', getProductInfo);
        intentMap.set('CaptureUserInfo', CaptureUserInfo);
        intentMap.set('Default Fallback Intent', fallback);

        // tslint:disable-next-line: no-floating-promises
        _agent.handleRequest(intentMap);
    } catch (e) {
        console.log("main error catch: ", e);
    }
});


