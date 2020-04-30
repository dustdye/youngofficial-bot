import { https } from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { Suggestions, BasicCard, Button, Image, LinkOutSuggestion } from 'actions-on-google'

import { ServerClient } from "postmark";
import axios from 'axios';



export const webhook = https.onRequest(async (request, response) => {
    try {

        const _agent = new WebhookClient({ request, response });
        console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
        console.log('Dialogflow Request body: ' + JSON.stringify(request.body));


        // function getProductInfo(agent) {
        //     const name = agent.parameters.name;
        //     return getSpreadsheetData().then(res => {
        //         res.data.map(person => {
        //             if (person.Name === name)
        //                 agent.add(`Here are the details for ${name}. Age: ${person.Age}, Email: ${person.Email}, Phone: ${person.Phone}`);

        //         });
        //     });
        // }

        async function getProductInfo(agent: any) {
            console.log("this is get product intent");
            agent.requestSource = "ACTIONS_ON_GOOGLE";
            const conv = agent.conv();


            const productName = agent.parameters.productName;
            let data: any;

            await axios.get('https://sheetdb.io/api/v1/jjabi12qzr5q4')
                .then((res) => {
                    console.log("data: ", res);
                    console.log("data: ", res.data);
                    data = res.data
                })
                .catch(e => {
                    console.log("error in getting sheet data: ", e);
                    agent.add("sorry I am currently unavailable, please try again later");
                    return
                })

            if (!productName) {

                conv.ask("which products would you like to know about");
                conv.ask(new Suggestions(pluck(data).ProductTitle))
                conv.ask(new Suggestions(pluck(data).ProductTitle))
                conv.ask(new Suggestions(pluck(data).ProductTitle))
                agent.add(conv);

                return;

            } else {

                data.map((eachProduct: any) => {
                    console.log("eachProduct: ", eachProduct);

                    if (eachProduct.id === productName) {
                        conv.ask(`This might be what you are looking for. Here are the details for ${eachProduct.ProductTitle}.`);

                        conv.ask(
                            new BasicCard({
                                title: eachProduct.ProductTitle,
                               // subtitle: 'This is a subtitle',
                                text: eachProduct.ShortDescription,
                                image: new Image({
                                    url: eachProduct.ImageURL,
                                    alt: "Image of " + eachProduct.ProductTitle
                                }),
                                buttons: [
                                    new Button({ title: eachProduct.ButtonText || "Learn More", url: eachProduct.Permalink }),
                                    //new Button({ title: 'Test Button 2', url: 'https://botcopy.com' })
                                ],
                            })
                        );
                        conv.ask(
                            new LinkOutSuggestion({
                                name: eachProduct.ButtonText || "Learn More",
                                url: eachProduct.Permalink
                            })
                        );
                        conv.ask(new Suggestions("Get other product info"));
                        conv.ask(new Suggestions("Show details of " + pluck(data).ProductTitle))
                        agent.add(conv);

                        return;
                    }
                });

            }
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
            axios.post('https://sheet.best/api/sheets/36020baa-fccb-4667-af52-90759d44e976', data).catch(e => {
                console.log("error in saving data: ", e)
            })
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

        function welcome(agent: any) {

            console.log("agent.contexts: ", agent.contexts);
            console.log("agent.requestSource: ", agent.requestSource);
            console.log("request.body: ", request.body);
            console.log("request.body: ", JSON.stringify(request.body));
            // console.log("agent.contexts.botcopy-ref-context: ", agent.contexts["botcopy-ref-context"]);

            // agent.add("I have received these in context: " + JSON.stringify(agent.contexts))
            // agent.add("everything I received in request is here: " + JSON.stringify(request.body))
            agent.requestSource = "ACTIONS_ON_GOOGLE";
            const conv = agent.conv();

            conv.ask("Hi! Can I help you? 😁")
            conv.ask(new Suggestions("Show me products"))
            conv.ask(new Suggestions("Dr. Wallach Info"))
            conv.ask(new Suggestions("90 Essentials"));
            agent.add(conv)
            return;

        }


        function fallback(agent: WebhookClient) {
            agent.add(`I didn't understand`);
            agent.add(`I'm sorry, can you try again?`);
        }

        const intentMap = new Map();
        intentMap.set('GetEmail', getEmail);
        intentMap.set('Default Welcome Intent', welcome);
        intentMap.set('getProductInfo', getProductInfo);
        intentMap.set('CaptureUserInfo', CaptureUserInfo);
        intentMap.set('Default Fallback Intent', fallback);

        // tslint:disable-next-line: no-floating-promises
        _agent.handleRequest(intentMap);
    } catch (e) {
        console.log("main error catch: ", e);
    }
});





export function pluck(arr: any) {
    const randIndex = Math.floor(Math.random() * arr.length);
    return arr[randIndex];
}
