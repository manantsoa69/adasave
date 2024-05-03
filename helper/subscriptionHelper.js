  // helper/subscriptionHelper.js

  const Redis = require('ioredis');
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js'); // Import createClient function from supabase library
  const { sendMessage, yesNo } = require('./messengerApi');

  const redis = new Redis(process.env.REDIS_URL_1);
  console.log('Redis connection established!');
  const check = async (fbid) => {
    try {
      const cacheItems = await redis.lrange(fbid, 0, 1);
      if (cacheItems && cacheItems.length >= 2) {
        const [cacheItem0, cacheItem1] = cacheItems; // Destructuring assignment for clarity
        
        return { access: 'TC', chatHistory: cacheItem1 };

      }
      console.log('Cache not found or incomplete');
      return { access: 'E', chatHistory: null };
    } catch (error) {
      console.error('Error occurred while checking:', error);
      throw error; // Rethrow the error to handle it elsewhere
    }
  };

  const checkSubscription = async (fbid) => {
    try {
      const cacheItems = await redis.lrange(fbid, 0, 1);
      if (cacheItems && cacheItems.length >= 2) {
        const [cacheItem0, cacheItem1] = cacheItems; // Destructuring assignment for clarity

        if (cacheItem0 === 'Chat') {
          console.log('Status is ChatC');
          return { Status: 'C', chathistory: cacheItem1 }; 
        } else if (cacheItem0 === 'Trad') {
          console.log('Status is T.');
          return { Status: 'T' };
        } else if (cacheItem0 === 'Book') {
          console.log('Status is B.');
          return { Status: 'B' };
        } else if (cacheItem0 === 'Live') {
          console.log('Status is L.');
          return { Status: 'L' };
        } 
      }
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
      const { data, error } = await supabase.from('chat_responses').select('*').eq('fbid', fbid);
          if (error) {
            console.error('Error:', error.message);
            return { status: 'Error', message: error.message };
          }

          if (data.length > 0) {
            console.log('Data found');
            const expireSeconds = 86400;//1J
            const cacheKey = `${fbid}`;
            await redis.multi()
              .rpush(`${cacheKey}`, `Chat`)
              .rpush(`${cacheKey}`, ``)
              .expire(cacheKey, expireSeconds)
              .exec();// Assuming redis is defined and initialized elsewhere
            
            console.log(data[0]);
            return { Status: 'Chat' };
          } else {
            console.log(`No data found in table chat_responses with fbid '${fbid}'`);
            await Promise.all([
               // sendMessage(fbid, welcomeMsg),
                yesNo(fbid),
              ]);
            return 1;
          }
        } catch (error) {
          console.error('Error:', error.message);
          return { status: 'Error', message: error.message };
        }
      }
  module.exports = {
    checkSubscription,
    check
  };
