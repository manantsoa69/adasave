const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getStoredNumbers, deleteDataFromRedis } = require('../redis');
const { sendMessageA } = require('../helper/messengerAdmin');
const { MongoClient } = require('mongodb'); // Import MongoDB module

router.post('/', async (req, res) => {
  try {
    const { entry } = req.body;

    if (entry && entry.length > 0 && entry[0].messaging && entry[0].messaging.length > 0) {
      const { sender: { id: senderId }, message } = entry[0].messaging[0];

      if (message && message.text) {
        let { text: query } = message;
        console.log(`Received message from senderId: ${senderId}`);

        if (query.toLowerCase().startsWith('03')) {
          let numberToQuery = query;

          const items = await getStoredNumbers(numberToQuery);

          if (items.length === 0) {
            await sendMessageA(senderId, 'No matching data found for the specified number.');
          } else {
            const firstItem = items[0];
            const { number, fbid, receivedate } = firstItem;

            // Connect to MongoDB and insert the data before deletion
            const uri = process.env.MONGODB_URI; // Your MongoDB connection URI
            const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

            try {
              await client.connect();
              const db = client.db('mongodata'); // Replace with your database name

              // Insert the data into MongoDB in the 'mongodata.queryresults' collection
              await db.collection('queryresults').insertOne({ number, fbid, receivedate });

              // Send response message
              let responseMessage = `Query result for number ${number}:\n`;
              responseMessage += `FB ID: ${fbid}\n`;
              responseMessage += `Received Date: ${receivedate}\n`;

              await sendMessageA(senderId, responseMessage);
              await sendMessageA(senderId, `sub ${fbid} 1M`);

              // Call the Redis delete function after data is saved
              await deleteDataFromRedis(numberToQuery);
            } catch (error) {
              console.error('Error saving data to MongoDB:', error);
              await sendMessageA(senderId, 'Error occurred. Please try again later.');
            } finally {
              // Close the MongoDB connection
              client.close();
            }
          }
        } else if (query.toLowerCase().startsWith('sub')) {
          const [_, fbid, subscriptionStatus] = query.split(' ');

          try {
            await axios.post('https://adapsave.adaptable.app/subscribe', { fbid, subscriptionStatus}, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            await sendMessageA(senderId, 'Subscribed successfully!');
          } catch (error) {
            console.error('Error subscribing user:', error);
            await sendMessageA(senderId, 'Failed to subscribe.');
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling Facebook webhook:', error);
    res.sendStatus(500);
  }
});

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

module.exports = {
  router,
};
