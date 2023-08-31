//helper/messengerAdmin.js

const axios = require('axios');
require('dotenv').config();

const TOKEN1 = process.env.TOKEN1;
const PAGE_ID1 = process.env.PAGE_ID1;

const sendMessageA = async (senderId, message) => {
  try {
    const options = {
      method: 'POST',
      url: `https://graph.facebook.com/v11.0/${PAGE_ID1}/messages`,
      params: {
        access_token: TOKEN1,
      },
      data: {
        recipient: { id: senderId },
        messaging_type: 'RESPONSE',
        message: { text: message },
      },
    };

    await axios(options);

    console.log('Message sent successfully');
    return 1;
  } catch (error) {
    console.error('Error occurred while sending message:', error);
    return 0;
  }
};

module.exports = {
  sendMessageA,
};
