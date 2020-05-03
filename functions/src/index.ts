import { https } from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import { Suggestions, BasicCard, Button, Image, LinkOutSuggestion, BrowseCarousel, BrowseCarouselItem } from 'actions-on-google'

import { ServerClient } from "postmark";
import axios from 'axios';
import { init, agent as agentHelper, entityEntryInterface } from 'dialogflow-helper';

init({
    "client_email": "dialogflow-ftjyeh@ygy1-living.iam.gserviceaccount.com",
    "project_id": "ygy1-living",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyHXdiwXeKfw0I\nYd4IRhS0kJTanH5N9mtklJWqgXG6PoZcQ0FJYW07SHUlGaUSSGJVhYx1hkjBFD8j\n43NWvcJy32ByKEPy0wVwXHzGzJn7v3KNR9qIeXgjcZH6tZN194S2Ht7haTi22wDQ\nJzlN/bucSPhfaeyEP2jnOPh01Csu4HZGzN4be9moUdhY9VCLv9PKKgyaxO6NXtb/\nZhhqxaBbNMFGkJqvm4jf8Wz++4e5lRsJETFNzlQlRtbrCN8PRy11UPhB8SS+rFtL\nS/V3gXDajEHd9dnX7uaGSXAAnCQgZ8ZjPN4OaqsN1XC511SV7fAQkJK5w8DVYkxe\nVvUKv32TAgMBAAECggEACUnYwvv8hEAclDZTrNzIEaPZ5Lif1uhQhhNAPCm585DK\nfZ89lVpmUYl1dR+Bkz2BG0f2oN5a3EQhCCRsDGGi9U30Kp/c7e8r68XMSqsQJf0V\njTaVDTmVwUttOxoi/CuR7n7CTWuo+ygv7QBOpbmOAhgavmcOCtYqXfyDlcbGuw//\n6k8sKlNKNEY7dnkUxRmQPCBu35zARhyI+vnqY8oEe/vmXtDyhPn5GEQqWMch8yKo\nLq3Td9jFZ7G8V2wSotzwVSTs1uH/rGGmKd9E+EzDsGbhUMC9YjvsFQooF+qLy4/J\nqRqyykjkHarYRt/NpwgJS6A+DF1A3SrUVFXkfOBBeQKBgQDjWNKcD976wmvveCVs\n6AdQiNKLsBW7xAlqGbhHj8ov/+m4O7jqB5im8uV5pEY9xO4GU8/blkSxLsw6+Uno\nY6ABqUgR9QEfvAYnlOOxrEsNrP0XPPtlpoNrdY+bPkXe2mwjejBwQ5FIvpYvNGYL\ncs0obCF7hSows5pNpBw2Hf9TbwKBgQDIkDcLk8F8B/8/SmMiUkYuySTxWHkgJTs6\nDGM7qrzl1RWtLiYdhhemm7r7f4zpG8hQm1ZlpXFS1GL8iOxG0tXMFliZgy5MfbgD\nda6WXwtxWPYhyuVe0neqof+h6w/03gvS+3+KaEXw78VwlSQ+dpIJW/XrPaQIWQi5\nwK383RCWHQKBgHXfaJrnk6mZwhKPzX+wsZIszlUEf9AxbNwo56WaxK6sVcZimJYm\nSBxPFXFDHfQKtYpsS/nC6GyhIdx1wb8OYDhcR3Sf/ewxNVOyW3eUJ/m4NiSlRobG\nlZ7Sfhl0aQ+JWcXvJUwfjCUWQ5HH7hyDciFCJv3+5ggIJrmYm9PnK6lbAoGBAI6J\nb5VavPdY954TT8Dkl9xIN2kOZ4bg7uaiRyPwg68TcQRS9+OjmMtfgdObIpnIlOQ0\ngYJbwd4L8w1mggUTcb5JY042XIEgF9bdm+ZiRc+YWdRKThjFmyY5W2PHmt97rwuS\nkWHcGVjSDo+kbs21lrPwFyXH+Pu1yu24ce5zbYZBAoGAMM5XAGGT9fVHoo7rnCOu\nQu84qI6j6EFgQkNhmSglvvycPP2OFy+TIDBKDUEmF1SSpy77OmtnQNI7FvzdIddH\nETAQS1Ce0EA0BoIbtDhDC0BRqNa/xA/BNrics1ULmTODAL0OrSEBacTSR9UrvW16\nEJR4YIZbTXt5fFFMmgwjwfA=\n-----END PRIVATE KEY-----\n",
})

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


        async function productForHealthProblem(agent: WebhookClient) {

            console.log("this is get productForHealthProblem intent");
            (agent.requestSource as any) = "ACTIONS_ON_GOOGLE";
            const conv = agent.conv();

            const HealthProblem = agent.parameters.HealthProblem;
            let products: any[];
            const items: BrowseCarouselItem[] = [];

            if (!HealthProblem) {
                conv.ask("What is your health problem");

                await agentHelper.getEntity("fc689e87-a9fc-4749-8d81-ee1dff6583c8").then((entity: any) => {
                    console.log("received entity: ", entity.name);
                    const entities: entityEntryInterface[] = entity.entities;

                    conv.ask(new Suggestions(
                        pluck(entities).synonyms[0],
                        pluck(entities).synonyms[0],
                        pluck(entities).synonyms[0],
                    ))
                    agent.add(conv);
                    return;
                }).catch(e => {
                    console.log("error in getting entity: ", e);
                    agent.add(conv);
                })
            } else {

                await Promise.all([
                    axios.get("https://youngofficial.com/wp-json/wc/v3/products?per_page=100&page=1", {
                        headers: {
                            'Authorization': 'Basic Y2tfOTdkNGZmZTJhMmEwNTFhNTBiNmQyY2ZmNWQzOTA2ZDE5MGU3ZjhiODpjc185ZTA2Yjg2YzIxYzJmOTA4YjQ2NTI2NjA2NDUxYTNiOTlhMzQ3ODc1',
                            'Cookie': 'guest_user=d3d1d697d983ff5d905ddcd3d9bac3e5'
                        }
                    }),
                    axios.get("https://youngofficial.com/wp-json/wc/v3/products?per_page=100&page=2", {
                        headers: {
                            'Authorization': 'Basic Y2tfOTdkNGZmZTJhMmEwNTFhNTBiNmQyY2ZmNWQzOTA2ZDE5MGU3ZjhiODpjc185ZTA2Yjg2YzIxYzJmOTA4YjQ2NTI2NjA2NDUxYTNiOTlhMzQ3ODc1',
                            'Cookie': 'guest_user=d3d1d697d983ff5d905ddcd3d9bac3e5'
                        }
                    })
                ])
                    .then(function (res) {
                        products = [].concat(res[0].data, res[1].data);

                        console.log("received product count: ", products.length);
                        console.log("first product name: ", products[0].name);


                        console.log("user said Health problem: ", HealthProblem);

                        // short listing products
                        products.map((eachProduct: any) => {
                            // console.log("eachProduct: ", eachProduct);
                            eachProduct.attributes.map((eachAttribute: { name: string, options: string[] }) => {
                                if (eachAttribute.name === "usedfor" && eachAttribute.options.indexOf(HealthProblem) > -1) {

                                    items.push(new BrowseCarouselItem({
                                        title: eachProduct.name,
                                        url: eachProduct.permalink,
                                        // subtitle: 'This is a subtitle',
                                        description: eachProduct.short_description,
                                        image: new Image({
                                            url: eachProduct.images[0].src,
                                            alt: "Image of " + eachProduct.name
                                        }),
                                        footer: "This is footer"
                                    }))
                                }
                            })
                        });

                        if (items.length) {

                            conv.ask(`Here are some products useful in ${HealthProblem}`);

                            conv.ask(new BrowseCarousel({ items: items }))
                            conv.ask(new Suggestions(`I have got a different health problem`))
                            agent.add(conv)
                            return;

                        } else {
                            agent.add("No product found for " + HealthProblem);
                            return;
                        }

                    }).catch(e => {
                        console.log("error in getting data from woocommerece api: ", e);
                        agent.add("sorry I am currently unavailable, please try again later");
                        return
                    })

            }

        }


        async function wooTest(agent: WebhookClient) {

            await Promise.all([
                axios.get("https://youngofficial.com/wp-json/wc/v3/products?per_page=100&page=1", {
                    headers: {
                        'Authorization': 'Basic Y2tfOTdkNGZmZTJhMmEwNTFhNTBiNmQyY2ZmNWQzOTA2ZDE5MGU3ZjhiODpjc185ZTA2Yjg2YzIxYzJmOTA4YjQ2NTI2NjA2NDUxYTNiOTlhMzQ3ODc1',
                        'Cookie': 'guest_user=d3d1d697d983ff5d905ddcd3d9bac3e5'
                    }
                }),
                axios.get("https://youngofficial.com/wp-json/wc/v3/products?per_page=100&page=2", {
                    headers: {
                        'Authorization': 'Basic Y2tfOTdkNGZmZTJhMmEwNTFhNTBiNmQyY2ZmNWQzOTA2ZDE5MGU3ZjhiODpjc185ZTA2Yjg2YzIxYzJmOTA4YjQ2NTI2NjA2NDUxYTNiOTlhMzQ3ODc1',
                        'Cookie': 'guest_user=d3d1d697d983ff5d905ddcd3d9bac3e5'
                    }
                })
            ])

                .then(function (res) {
                    const products = [].concat(res[0].data, res[1].data);

                    agent.add(`I have got ${products.length} products:\n`);

                    products.map((eachProduct: any) => {
                        agent.add(`${eachProduct.id}: ${eachProduct.name}\n`);
                    })
                    return;
                }).catch(console.log)
        }


        async function getProductInfo(agent: WebhookClient) {
            console.log("this is get product intent");
            (agent.requestSource as any) = "ACTIONS_ON_GOOGLE";
            const conv = agent.conv();


            const productName = parseInt(agent.parameters.productName);
            let products: any[];

            // // getting data from sheet
            // await axios.get('https://sheetdb.io/api/v1/jjabi12qzr5q4')
            //     .then((res) => {
            //         console.log("data: ", res);
            //         console.log("data: ", res.data);
            //         data = res.data
            //     })
            //     .catch(e => {
            //         console.log("error in getting sheet data: ", e);
            //         agent.add("sorry I am currently unavailable, please try again later");
            //         return
            //     })

            // getting data from woocommerece 
            await Promise.all([
                axios.get("https://youngofficial.com/wp-json/wc/v3/products?per_page=100&page=1", {
                    headers: {
                        'Authorization': 'Basic Y2tfOTdkNGZmZTJhMmEwNTFhNTBiNmQyY2ZmNWQzOTA2ZDE5MGU3ZjhiODpjc185ZTA2Yjg2YzIxYzJmOTA4YjQ2NTI2NjA2NDUxYTNiOTlhMzQ3ODc1',
                        'Cookie': 'guest_user=d3d1d697d983ff5d905ddcd3d9bac3e5'
                    }
                }),
                axios.get("https://youngofficial.com/wp-json/wc/v3/products?per_page=100&page=2", {
                    headers: {
                        'Authorization': 'Basic Y2tfOTdkNGZmZTJhMmEwNTFhNTBiNmQyY2ZmNWQzOTA2ZDE5MGU3ZjhiODpjc185ZTA2Yjg2YzIxYzJmOTA4YjQ2NTI2NjA2NDUxYTNiOTlhMzQ3ODc1',
                        'Cookie': 'guest_user=d3d1d697d983ff5d905ddcd3d9bac3e5'
                    }
                })
            ])
                .then(function (res) {
                    products = [].concat(res[0].data, res[1].data);

                    console.log("received product count: ", products.length);
                    console.log("first product name: ", products[0].name);

                    if (!productName) {

                        conv.ask("which products would you like to know about");
                        conv.ask(new Suggestions(pluck(products).name))
                        conv.ask(new Suggestions(pluck(products).name))
                        conv.ask(new Suggestions(pluck(products).name))
                        agent.add(conv);

                        return;

                    } else {

                        console.log("user said product number: ", productName);

                        products.map((eachProduct: any) => {
                            // console.log("eachProduct: ", eachProduct);

                            if (parseInt(eachProduct.id) === productName) {
                                conv.ask(`This might be what you are looking for. Here are the details for ${eachProduct.name}.`);

                                conv.ask(
                                    new BasicCard({
                                        title: eachProduct.name,
                                        // subtitle: 'This is a subtitle',
                                        text: eachProduct.short_description,
                                        image: new Image({
                                            url: eachProduct.images[0].src,
                                            alt: "Image of " + eachProduct.name
                                        }),
                                        buttons: [
                                            new Button({ title: "Learn More", url: eachProduct.permalink }),
                                            //new Button({ title: 'Test Button 2', url: 'https://botcopy.com' })
                                        ],
                                    })
                                );
                                conv.ask(
                                    new LinkOutSuggestion({
                                        name: eachProduct.ButtonText || "Learn More",
                                        url: eachProduct.permalink
                                    })
                                );
                                conv.ask(new Suggestions("Get other product info"));
                                conv.ask(new Suggestions("Show details of " + pluck(products).name))
                                agent.add(conv);

                                return;
                            }
                        });

                    }

                }).catch(e => {
                    console.log("error in getting data from woocommerece api: ", e);
                    agent.add("sorry I am currently unavailable, please try again later");
                    return
                })
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

            // console.log("agent.contexts: ", agent.contexts);
            // console.log("agent.requestSource: ", agent.requestSource);
            // console.log("request.body: ", request.body);
            // console.log("request.body: ", JSON.stringify(request.body));
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
        intentMap.set('Default Welcome Intent', welcome);
        intentMap.set('Default Fallback Intent', fallback);

        intentMap.set('GetEmail', getEmail);
        intentMap.set('getProductInfo', getProductInfo);
        intentMap.set('productForHealthProblem', productForHealthProblem);

        intentMap.set('CaptureUserInfo', CaptureUserInfo);
        intentMap.set('wooTestDeleteThis', wooTest);

        // tslint:disable-next-line: no-floating-promises
        _agent.handleRequest(intentMap);
    } catch (e) {
        console.log("main error catch: ", e);
    }
});





export function pluck<T>(arr: Array<T>): T {
    const randIndex = Math.floor(Math.random() * arr.length);
    return arr[randIndex];
}
