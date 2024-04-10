const { Hercai } = require("hercai");
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function askHercai(content) {
    try {
        const herc = new Hercai(); // Using default values for model and apiKey
        const response = await herc.question({ model: "turbo-16k", content });
        return response.reply;
    } catch (error) {
        console.error('Error occurred while using Hercai:', error);
        throw error; // Re-throwing the error to handle it at a higher level
    }
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY1); // Removed unnecessary parentheses
const googlefirst = async (query, fbid) => {
    try {
        const generationConfig = { maxOutputTokens: 1500, temperature: 1.0, topP: 0.36, topK: 1 };
        const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig });
        console.log('GOOGLEF', query);
        const result = await model.generateContent(` ${query}`);
        const response = await result.response.text(); // Simplified getting the text response
        const content = response.trim();
        if (!content) console.warn('GoogleGenerativeAI returned an empty response.');
        return { content };
    } catch (googleError) {
        console.error('Error occurred while using GoogleGenerativeAI:', googleError);
        throw googleError; // Re-throwing the error to handle it at a higher level
    }
};

module.exports = {
    askHercai,
    googlefirst
};
