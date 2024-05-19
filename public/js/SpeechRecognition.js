// SpeechRecognition.js

const btn = document.getElementById("btn");
const transcript = document.getElementById("transcript");
const proceedBtn = document.getElementById("proceedBtn");
const discardBtn = document.getElementById("discardBtn");
const transdiv = document.querySelector(".transdiv");

const startSpeechRecognition = async () => {
  try {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      transcript.innerHTML = text;
      console.log("Recognized speech:", text);

      // Show transcript and buttons
      transdiv.style.display = "block";
    };

    recognition.onend = () => {
      console.log("Speech Recognition ended.");
    };

    await recognition.start();
  } catch (error) {
    console.log(error);
  }
};

btn.addEventListener("click", () => {
  startSpeechRecognition();
});

proceedBtn.addEventListener("click", async () => {
  const text = transcript.innerText.trim();

  if (text) {
    try {
      const localTest = "https://localhost:8080/analyse-text";
      // const analyseRouteLink = "https://localhost:8080/analyse-text";
      // const ngrokLink = "https://e31c-182-183-11-230.ngrok-free.app/analyse-text"

      const response = await fetch(localTest, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const eventDetails = await response.json();

        document.getElementById("eventId").textContent = eventDetails.eventId;
        document.getElementById("eventLink").href = eventDetails.htmlLink;

        const eventDetailsContainer = document.getElementById("eventDetails");
        eventDetailsContainer.style.display = "block";
      } else {
        throw new Error("Request unsuccessful: ", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  }
});

discardBtn.addEventListener("click", () => {
  transcript.innerHTML = "";
  transdiv.style.display = "none";
});
