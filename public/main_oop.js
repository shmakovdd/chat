class Chat {
  constructor() {

    this.userNickname = this.#newNickname();
    this.userID       = this.#newUserID();
    this.socket       = this.#createWebSocket();
    this.DOM          = this.#createDOM();

    this.audio        = new Audio("./snapchat.mp3");

    this.DOM.form.addEventListener("submit", this.#submit.bind(this));
    this.checkIntersection()
  }

  #newNickname = () => prompt("Write your nickname") || "anonymous";

  #newUserID = () => Date.now();

  #submit(event) {
    event.preventDefault();
    let message = {
      type: "message",
      nickname: this.userNickname,
      message: this.DOM.input.value,
      id: this.ID,
    };
    this.socket.send(JSON.stringify(message));
    this.DOM.input.value = "";
  }

  #createDOM() {
    return {
        nicknameList :document.querySelector(".nicknames__list"),
        form         :document.querySelector(".form"),
        input        :document.querySelector(".input"),
        chat_wrapper :document.querySelector(".chat-list"),
        modal        :document.querySelector(".hidden-modal"),
        onlineElement:document.querySelector(".online"),
        intersection :document.querySelector("#intersection")
    }
  }
  

  #createWebSocket() {
    const HOST = location.origin.replace(/^http/, "ws");
    const socket = new WebSocket(HOST);


    
    socket.onopen = () => {
      let message = {
        type: "connection",
        nickname: this.userNickname,
      };
      
      socket.send(JSON.stringify(message));
      this.DOM.chat_wrapper.scrollTop = this.DOM.chat_wrapper.scrollHeight;
    };
    
    socket.onclose = () => {
      alert("Соединение разорвано");
    };
    
    socket.onmessage = (message) => {
      message = JSON.parse(message.data);
    
      switch(message.type) {
        case 'ping':
          socket.send(JSON.stringify({ type: "pong" }));
          break
        case 'connection': 
          this.#onConnectionEvent(message, 'вошел в чат')
          break
        case 'connection_is_lost': 
          this.#onConnectionEvent(message, 'вышел из чата')
          break
        case 'message':
          this.#onMessage(message)
          break
        case 'history': 
          this.#getHistory(message);
      }
  
      if (message?.id !== this.ID && message.type === "message") {
        this.audio.play();
      }
    };

    return socket;
  }


  #onConnectionEvent(msg, text) {
    this.DOM.onlineElement.textContent = `Сейчас онлайн: ${msg.online}`;
    this.DOM.modal.textContent = `Пользователь ${msg.nickname} ${text}`;
    this.DOM.modal.classList.add("active");
    setTimeout(() => {
      this.DOM.modal.classList.remove("active");
    }, 7000);
    this.setNicknames(msg.nicknames);
  }

  #onMessage(msg) {
    this.DOM.chat_wrapper.appendChild(this.#createLastMessageItem(msg));
    this.DOM.chat_wrapper.scrollTop = this.DOM.chat_wrapper.scrollHeight;
  }




  #createLastMessageItem(msg) {
    let template = 
      `<div class="chat-user-name">${msg.nickname}: </div>
       <div class="chat-message">${msg.message}</div>`
    ;
    let messageItem = document.createElement("li");
        messageItem.classList.add("chat-item");
        messageItem.innerHTML = template;

    return messageItem;
  }

  #checkIntersection() {
    let options = {
      root: this.DOM.chat_wrapper,
      rootMargin: "0px",
      threshold: 1.0,
    };
    let callback =  (entries, observer) => {
      if (entries[0].isIntersecting) {
        let message = {
          type: "history",
        };
        this.socket.send(JSON.stringify(message));
      }
    };
    let observer = new IntersectionObserver(callback, options);
    observer.observe(this.intersection);
  }



  #setNicknames(nicknames) {
    this.DOM.nicknameList.innerHTML = "";
    
    nicknames.forEach((nick) => {
      this.DOM.nicknameList.appendChild(newNickNameItem(nick));
    });

    function newNickNameItem(nick) {
      let item = document.createElement("li");
      item.classList.add("nicknames__item");
      item.textContent = `${nick}`;

      return item;
    }
  }

  #getHistory(msg) {
    let anchor = this.DOM.chat_wrapper.firstChild;
    msg.messageHistory.forEach((msg) => {
      this.DOM.chat_wrapper.prepend(this.#createLastMessageItem(msg));
    });
    if (this.DOM.chat_wrapper.children.length <= 31) {
      this.DOM.chat_wrapper.scrollTop = this.DOM.chat_wrapper.scrollHeight;
    } else {
      anchor.scrollIntoView();
    }
    anchor.scrollIntoView({ block: "center" });
  }
}


let chat = new Chat();