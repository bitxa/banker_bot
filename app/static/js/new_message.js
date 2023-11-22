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
    document.getElementById("responding").style.display = "flex";
    document.getElementById("responding").style.position = "sticky";
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
            <button class="clipboard" id="copy-${responseCounter}">
              <i class="fa-solid fa-copy fa-xl" style="color: #ffffff"></i>
            </button>
          </div>
        </div>
        <div class="content bot-message">
          <p>${response}</p>
        </div>
      </div>`;
  
    botResponse = colorizeUrls(botResponse);
  
    var chat = document.getElementById("chat");
    chat.insertAdjacentHTML("beforeend", botResponse);
  
    // Add click event listener to the copy button
    document.getElementById(`copy-${responseCounter}`).addEventListener('click', function() {
      // Copy the response text to clipboard
      navigator.clipboard.writeText(response)
        .then(() => {
          console.log('Response copied to clipboard');
        })
        .catch(err => {
          console.error('Error in copying text: ', err);
        });
    });
  
    // Scroll to the newly added bot response
    var chatbotResponse = document.getElementById(`response-${responseCounter}`);
    document.getElementById("responding").style.display = "none";
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
    });

  function getThemes() {
    fetch("/themes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        // Parse the string to a JavaScript array
        const themes = JSON.parse(response.themes);

        // Select the topics div and clear existing topics
        var topicsDiv = document.querySelector(".topics");
        topicsDiv.innerHTML = "";

        // Iterate over each theme and create a button
        themes.forEach((theme) => {
          var button = document.createElement("button");
          button.className = "topic";
          button.innerHTML = `<h4>${theme}</h4>`;

          // Add click event listener to the button
          button.addEventListener("click", function () {
            // Assuming the input field has an id of 'user_input'
            document.getElementById("user_input").value = theme;
          });

          // Append the button to the topics div
          topicsDiv.appendChild(button);
        });
      })
      .catch((error) => console.error("Error getting themes:", error));
  }

  getThemes();
});
