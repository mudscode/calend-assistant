// SpeechRecognition.js

const btn = document.getElementById("btn");
const transcript = document.getElementById("transcript");
const proceedBtn = document.getElementById("proceedBtn");
const discardBtn = document.getElementById("discardBtn");
const transdiv = document.querySelector(".transdiv");
let recognition;

const startSpeechRecognition = async () => {
  try {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

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
      const response = await fetch("http://localhost:8080/analyse-text", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.text();
        console.log("Response: ", data);
        console.log("Data sent successfully.");
      } else {
        throw new Error("Request unsuccessful: ", response.status);
      }
    } catch (error) {
      console.error(error);
    }

    transdiv.style.display = "none";
    transcript.innerHTML = "";
  }
});

discardBtn.addEventListener("click", () => {
  transcript.innerHTML = "";
  transdiv.style.display = "none";
});