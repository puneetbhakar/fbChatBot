var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json())

app.get('/webhook', function (req, res) {
   if (req.query['hub.verify_token'] === 'this_is_puneet_personal_bot') {
     res.send(req.query['hub.challenge']);
   } else {
     res.send('Error, wrong validation token');
   }
 });




 app.post('/webhook', function (req, res) {
   var data = req.body;

   // Make sure this is a page subscription
   if (data.object == 'page') {
     // Iterate over each entry
     // There may be multiple if batched
     data.entry.forEach(function(pageEntry) {
       var pageID = pageEntry.id;
       var timeOfEvent = pageEntry.time;

       // Iterate over each messaging event
       pageEntry.messaging.forEach(function(messagingEvent) {
         if (messagingEvent.optin) {
           receivedAuthentication(messagingEvent);
         } else if (messagingEvent.message) {
           receivedMessage(messagingEvent);
         } else if (messagingEvent.delivery) {
           receivedDeliveryConfirmation(messagingEvent);
         } else if (messagingEvent.postback) {
           receivedPostback(messagingEvent);
         }else {
           console.log("Webhook received unknown messagingEvent: ", messagingEvent);
         }
       });
     });

     // Assume all went well.
     //
     // You must send back a 200, within 20 seconds, to let us know you've
     // successfully received the callback. Otherwise, the request will time out.
     res.sendStatus(200);
   }
 });





 function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'quick':
        sendQuickMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}





function receivedDeliveryConfirmation(event){
  console.log(event)
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

  switch (payload) {
    case 'GET_STARTED':
      sendStartMessage(senderID, "Hey There! How are you?");
      break;

    default:
      sendTextMessage(senderID, "Postback called");
  }

}

function sendStartMessage(recipientId,messageText) {
  var messageData = {
    recipient:{
      id: recipientId
    },
    message: {
      text: messageText
    },
    message:{
      text: "Pick a color:",
      quick_replies:[
        {
          content_type: "text",
          title: "Red",
          payload: "Payload for first bubble"
        },
        {
          content_type: "text",
          title: "Blue",
          payload: "Payload for second bubble"
        }
      ]
    }
  }
  callSendAPI(messageData);
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}







function sendImageMessage(senderID){
  console.log(senderID)
}




var PAGE_ACCESS_TOKEN = "EAAQEZCZB5vGtwBAEdIxexyXgy2BM9owBVPMR2VTi0nogCi8ZClu3VPsKGLRTITvZA9o1rvSJtr98czCP0fSFjsATR4zcCNZByudWTZCWZCfGkCfKy08ZAH6gD5ccqagETvTTV0HSrNOwZAclCyZBH5IgBaLhZAw6XL5B0xSxOoT3Fg9kgZDZD"




function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}



function sendQuickMessage(recipientId){
  var messageData = {
    recipient:{
      id: recipientId
    },
    message:{
      text: "Pick a color:",
      quick_replies:[
        {
          content_type: "text",
          title: "Red",
          payload: "Payload for first bubble"
        },
        {
          content_type: "text",
          title: "Blue",
          payload: "Payload for second bubble"
        }
      ]
    }
  }
  callSendAPI(messageData);
}




function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}


app.listen(process.env.PORT)
