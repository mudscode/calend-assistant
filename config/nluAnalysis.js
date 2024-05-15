const OpenAi = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

const userCommandToAnalyze = async (text) => {
  let context = `Analyze the text to generate just the json details suitable for the Google Calendar API with no extra text. Timezone is Pakistan/Karachi. Specify whether it's creating or deleting an event and convert the details to a JSON object with the following structure and stay consistent:
  eventDetails = 
  {
    "summary": "Meeting with John",
    "location": "Conference Room A",
    "description": "Discuss project milestones",
    "start": {
      "dateTime": "2024-05-10T10:00:00",  // Updated Time (The given is just an example)
      "timeZone": "(GMT+05:00) Pakistan Standard Time"
    },
    "end": {
      "dateTime": "2024-05-10T11:00:00",  // Updated Time (The given is just an example)
      "timeZone": "(GMT+05:00) Pakistan Standard Time"
    },
    "attendees": [],
    "reminders": {
      "useDefault": true,
    },
  }
    operation = { "operation": "delete/create"};
    Just this, don't return anything extra.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: context,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const response = completion.choices[0].message.content;

    const startIndex = response.indexOf("{");
    const endIndex = response.lastIndexOf("}");
    const jsonResponse = response.substring(startIndex, endIndex + 1);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON response.");
      throw new Error("Invalid JSON response response from OpenAI");
    }
    return parsedResponse;
  } catch (error) {
    console.log("Error:", error);
    throw new Error("Failed to analyze user command.");
  }
};

module.exports = { userCommandToAnalyze };
