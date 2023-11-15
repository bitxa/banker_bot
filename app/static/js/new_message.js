document.addEventListener("DOMContentLoaded", function () {
  let responseCounter = 0;

  function appendUserMessage(message) {
    var userMessage = `
        <div class="user-question message">
          <p>${message}</p>
        </div>`;

    var chat = document.getElementById("chat");
    chat.insertAdjacentHTML("beforeend", userMessage);
    chat.scrollTop = chat.scrollHeight;

    document.getElementById("user_input").value = "";
  }

  function appendBotResponse(response) {
    responseCounter++;
    response = response.replace(/\n/g, "<br>");

    var botResponse = `
        <div class="bot-response message" id="response-${responseCounter}">
          <div class="header">
            <div class="info writting">
              <img class="avatar" src="../static/images/banker_avatar.jpg" alt />
              <p>Banker</p>
            </div>
            <div class="copy">
              <button class = "clipboard">
                <i class="fa-solid fa-copy fa-xl" style="color: #ffffff"></i>
              </button>
            </div>
          </div>
          <div class="content bot-message">
            <p>${response}</p>
          </div>
        </div>`;

    botResponse = colorizeUrls(botResponse);

    document
      .getElementById("chat")
      .insertAdjacentHTML("beforeend", botResponse);

    // Scroll to the newly added bot response
    var chatbotResponse = document.getElementById(
      `response-${responseCounter}`
    );

    chatbotResponse.scrollIntoView({ behavior: "smooth" });
  }

  function sendInitialGreeting() {
    const greeting =
      "Hola, soy Banker, tu asesor financiero. ¿En qué te puedo ayudar?";
    appendBotResponse(greeting);
  }
  sendInitialGreeting();

  document
    .getElementById("user_input_form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      var userMessage = document.getElementById("user_input").value;
      appendUserMessage(userMessage);

      fetch("/query", {
        method: "POST",
        body: JSON.stringify({ user_input: userMessage }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",

        },
      })
        .then((response) => response.json())
        .then((response) => {
          appendBotResponse(response.response);
        })
        .catch((error) => console.error("Error sending message:", error));

    })
})