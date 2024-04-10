const Redis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');
const { sendMessage } = require('./messengerApi');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL_1);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

const saveSubscription = async (fbid) => {
  //const expireSeconds = 60;//7J
  const expireSeconds = 604800;//7J
  //const expireSeconds = 2592000;    //30J
  try {
    const exists = await redis.exists(fbid);
    if (!exists) {
      console.log(`FBID ${fbid} not found in Redis. Saving subscription...`);

     // const expireDate = new Date(Date.now() + expireSeconds * 1000);
      //const formattedExpireDate = expireDate.toISOString().slice(0, 16);
      const cacheKey = `${fbid}`;

      await redis.multi()
        .rpush(cacheKey, 'Chat')
        .rpush(cacheKey, '')
        .expire(cacheKey, expireSeconds)
        .exec();

      console.log(`Subscription for FBID ${fbid} saved successfully in Redis.`);
    } else {
      console.log(`FBID ${fbid} already exists in Redis.`);
    }

    const { data, error } = await supabase.from('chat_responses').select('*').eq('fbid', fbid);

    if (error) {
      console.error('Error fetching data from Supabase:', error.message);
      return { status: 'Error', message: error.message };
    }

    if (data.length > 0) {
      const subscription = data[0];

      if (subscription.expireDate < new Date()) {
        console.log('Subscription is expired');
        return { status: 'E' };
      }

      //console.log('Subscription data found in Supabase');
      // Update expireDate in Supabase
      //await supabase.from('chat_responses').update({ expireDate: expireDate }).eq('fbid', fbid);
      // Update data in Redis
      //await redis.multi().lset(fbid, 0, '').exec(); 
      // Send subscription renewal message
      //await sendMessage(fbid, 'Your subscription has been renewed.');
      console.log('Subscription renewed successfully.');
      return { status: 'Renewed' };
    } else {
      console.log(`No data found in table chat_responses with fbid '${fbid}'`);
      // Save new subscription in Supabase
      const expireDate = new Date(Date.now() + expireSeconds * 1000);
      //const formattedExpireDate = expireDate.toISOString().slice(0, 16);
      await supabase.from('chat_responses').insert([{ fbid: fbid, expireDate: expireDate }]);
      // Send welcome message
      await sendMessage(fbid, `🎉 Votre essai gratuit a été activé. ⏰\nVotre ID:'${fbid}'`);
      console.log('Welcome message sent.');
      return { status: 'New', message: 'New subscription created' };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { status: 'Error', message: error.message };
  }
}

module.exports = {
  saveSubscription,
};
