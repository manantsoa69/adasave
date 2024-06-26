
const { generateResponse } = require('../helper/sendPost');
async function generatePrompt(chathistory, query, param) {
  let prompt;
  switch (param) {
    case 'Chat':
      prompt = `You are a helpful AI engaging in a conversation with a human. 
      Your responses are not overly lengthy but are packed with valuable insights.
      Your powerful capabilities enable you to answer all questions effectively.

      Previous conversation:
      ${chathistory}  
      New human question: 
      ${query}
      AI Response:`;

      return prompt;
    case 'Book':
      prompt = `Write a thorough yet concise summary of ${query}. 
      The language of the book title you get should define in which language you write the summary. 
      For example, if the book title is German, the summary should be in German too. 
      Concentrate on only the most important takeaways and primary points from the book that together will give me a solid overview and understanding of the book and its topic.
      Include all of the following in your summary:

      - Main topic or theme of the book
      - Key ideas or arguments presented
      - Chapter titles or main sections of the book with a paragraph on each
      - To sum up: The book's biggest takeaway and point in a singular sentence
      
      OUTPUT: Markdown format with #Headings, ##H2, ###H3, + bullet points, + sub-bullet points`;
      return prompt;
    case 'Live':
      try {
        //Previous input  history:\n{what is ollama}\n\nNew input: {hi} Input to search on line should be a search query please use the following format:\n\n\
        //Input: the input to the search on line\n \n 
        const liveResult = await generateResponse(query); 
       
        prompt = `Ajust the context from internet to answer the question correctly
        condensing the key points into 2-6 sentences use only the date on the context.
        context:
        ${liveResult}
        question:
        ${query} `;
        return prompt;
      } catch (error) {
        console.error("An error occurred:", error);
        return { prompt: "An error occurred while fetching live results." };
      }
    default:
      return query;
  }
}

module.exports = {
  generatePrompt,
};
