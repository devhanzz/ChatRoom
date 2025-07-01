


/*
const correctPassword = "XXXXX";
 const enteredPassword = prompt("Enter the password:");
 if (enteredPassword === correctPassword) {
    alert("Password correct!.");
 } else {
    alert("Incorrect password. Access denied.");
    document.body.innerHTML = '';
 }
 */


(function () {
  const app = document.querySelector(".app");
  const socket = io();
  let uname;
  let typing = false;
  let typingTimer;
  const typingTimeout = 1000;

  app.querySelector(".join-screen #join-user").addEventListener("click", function () {
    let username = app.querySelector(".join-screen #username").value;
    if (username.length == 0) {
      return;
    }
    socket.emit("newuser", username);
    uname = username;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");
  });

  app.querySelector(".chat-screen #message-input").addEventListener("input", function () {
    if (!typing) {
      typing = true;
      socket.emit("typing", uname);
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      typing = false;
      socket.emit("stop typing", uname);
    }, typingTimeout);
  });

  app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
    let message = app.querySelector(".chat-screen #message-input").value;
    if (message.length == 0) {
      return;
    }
    // Clear typing indicator when sending a message
    if (typing) {
      typing = false;
      socket.emit("stop typing", uname);
    }
    renderMessage("my", {
      username: uname,
      text: message,
    });
    socket.emit("chat", {
      username: uname,
      text: message,
    });
    app.querySelector(".chat-screen #message-input").value = "";
  });

  app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
    socket.emit("exituser", uname);
    window.location.href = window.location.href;
  });

  socket.on("update", function (update) {
    renderMessage("update", update);
  });

  socket.on("chat", function (message) {
    renderMessage("other", message);

    // Play audio when receiving a message
    const audio = new Audio("example.mp3");
    audio.play();
  });

  socket.on("user typing", function (username) {
    renderTypingMessage(username, true);
  });

  socket.on("user stopped typing", function (username) {
    renderTypingMessage(username, false);
  });

  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".chat-screen .messages");
    if (type == "my") {
      let el = document.createElement("div");
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
        <div style="background-color: #00B2FF; border-radius: 15px; color: white;">
          <div class="name">You</div>
          <div class="text">${message.text}</div>
        </div>
      `;
      messageContainer.appendChild(el);
    } else if (type == "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
        <div style="background-color: #B1B1B1; border-radius: 15px; color: black;">
          <div class="name">${message.username}</div>
          <div class="text">${message.text}</div>
        </div>
      `;
      messageContainer.appendChild(el);
    } else if (type == "update") {
      let el = document.createElement("div");
      el.setAttribute("class", "update");
      el.style.color = "yellowgreen"; // Customize text color
      el.style.fontSize = "12px"; // Customize font size
      el.style.fontFamily = "verdana"; // Customize font family
      el.innerText = message;
      messageContainer.appendChild(el);
    }
    // Scroll chat to the end
    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
  }

  function renderTypingMessage(username, isTyping) {
    let messageContainer = app.querySelector(".chat-screen .messages");
    // Remove previous typing indicator
    let previousTypingIndicator = messageContainer.querySelector(".typing-indicator");
    if (previousTypingIndicator) {
      previousTypingIndicator.remove();
    }

    // Add new typing indicator if the user is currently typing
    if (isTyping) {
      let el = document.createElement("div");
      el.setAttribute("class", "update typing-indicator");
      el.style.color = "#21B6A8"; // Customize text color
      el.style.fontSize = "12px"; // Customize font size
      el.style.fontFamily = "Trebuchet MS, Helvetica, sans-serif"; // Customize font family
      el.style.fontWeight="bold"; //Costomize fontWeight
      el.innerText = `${username} is typing...`;
      messageContainer.appendChild(el);
      messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
  }
})();