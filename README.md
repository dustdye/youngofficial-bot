# youngofficial-bot

an ecommerce and educational bot for company Youngevity based on Dialogflow with integrations with Janis and botcopy as the frontend website widget.


there is tremendous amount of educational material by Dr. Joel Wallach in a 3rd party webasite/app that we serve inside the chat client. We do this by having a large set of entities inside DF.

When user asks about an intent topic we return a card "What Wallach Says about $topic.  

With a button text What Wallach Says about $topic (3rd Party Site) 
URL =. ourspecialurl.com/search/$topic <--- notice the token 


ecommerce product cards are served by query the woocommerce rest API by having all of our products in an entity list in DF called productNames.

Inside Woocommerce we added custom attribute called "usedfor" so that we can associate queries to certain products for recommendation.

Product card has "learn more" that takes them to the single product page on our site within the chatbox.




