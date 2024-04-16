const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const NodeCache = require('node-cache');

const { askHercai, googlefirst } = require('./hercaiAI');
const myCache = new NodeCache();

// Function to retrieve the API key from the cache or environment variables
const getApiKey = () => {
  const cachedApiKey = myCache.get('api_key');

  if (cachedApiKey) {
    return cachedApiKey;
  } else {
    const apiKey = process.env.API_KEY2; // Update to your environment variable
    if (!apiKey) {
      throw new Error("API_KEY environment variable not found.");
    }
    myCache.set('api_key', apiKey, /* set cache expiration time in seconds */);
    return apiKey;
  }
};

const genAI = new GoogleGenerativeAI(getApiKey());
const googlechat = async (chathistory, query, param) => {
  try {
    const generationConfig = {
      maxOutputTokens: 1500,
      temperature: 1.0,
      topP: 0.36,
      topK: 1,
    };
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];


    const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig, safetySettings });

    console.log(`GOOGLE ${param}`);

    let prompt;
    switch (param) {
      case 'Chat':
        prompt = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context.You respond with determined responses, not really long onesThe language of the human you get should define in which language you answer.for Example, if the message is German the summary should be in German too.
         Current conversation:
         ${chathistory} Human: ${query}  AI:`;
        break;
      case 'Book':

        prompt =`Write a thorough yet concise summary of ${query} The language of the book title you get should define in which language you write the summary.for Example, if the boot tilte is German the summary should be in German too.
concentrate on only the most important takeaways
and primary points from the book that together
will give me a solid overview and understanding of
the book and its topic
Include all of the following in your summary:
Main topic or theme of the book
Key ideas or arguments presented
Chapter titles or main sections of the book with a paragraph on each
Key takeaways or conclusions
Comparison to other books on the same subject
Recommendations [Other similar books on the same topic]
To sum up: The book's biggest Takeaway and point in a singular sentence
OUTPUT: Markdown format with #Headings, ##H2,
###H3, + bullet points, + sub-bullet points`;
        break;
      default:
        prompt = ` ${query}`;
    }

    const result = await model.generateContent(prompt);


    const response = await result.response;

    const content = response.text().trim();
    if (!content) {
      console.warn('GoogleGenerativeAI returned an empty response.');
      const chat = `${chathistory},Humain:${query} AI:`;

      return await handleFallback(chat);
    }

    return { content };

  } catch (googleError) {

    console.error('Error occurred while using GoogleGenerativeAI:');
    const chat = `${chathistory},Humain:${query} AI:`;

    return await handleFallback(chat);
  }
};
const handleFallback = async (prompt) => {
  try {

    const result = await askHercai(prompt);
    console.log("Using OpenAI'");
    return { content: result };
  } catch (openaiError) {
    console.error('Error occurred during chatCompletion fallback:', openaiError);
    return { content: "Je suis un peu confus. Veuillez reposer votre question, s'il vous plaît." };

  }
};


module.exports = {
  googlechat,

};
