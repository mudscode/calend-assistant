const OpenAi = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

const userCommandToAnalyze = async (text) => {
  let context = `
  Analyze the provided text and generate a JSON object suitable for creating or deleting an event in the Google Calendar API. Please adhere strictly to the following structure and details, ensuring all date and time values are correctly formatted.

  The timezone is "Asia/Karachi" (GMT+05:00). The JSON object should include the necessary details for the Google Calendar event extracted from the text that's to be analyzed, and the operation (create or delete) should be specified explicitly. If you can't get any info about the specified fields, leave them empty.

  JSON Structure:
  {
    "eventDetails": {
      "summary": "Meeting with John",
      "location": "Conference Room A",
      "description": "Discuss project milestones",
      "start": {
        "dateTime": "2024-05-10T10:00:00+05:00",
        "timeZone": "Asia/Karachi"
      },
      "end": {
        "dateTime": "2024-05-10T10:00:00+05:00",
        "timeZone": "Asia/Karachi"
      },
      "attendees": [],
      "reminders": {
        "useDefault": true
      }
    },
    "operation": "create" // or "delete"
  }

  Notes:
  - Ensure that the "start" and "end" dateTime fields follow the ISO 8601 format: YYYY-MM-DDTHH:MM:SS.
  - The timeZone should be "Asia/Karachi".
  - Include all fields even if they are empty, such as "attendees".
  - The "operation" field must be either "create" or "delete".

  Generate only the JSON object as specified, with no additional text or explanations.
  `;

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
