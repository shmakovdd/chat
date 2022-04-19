let HOST = location.origin.replace(/^http/, 'ws')

let nickname = prompt('Write your nickname') || 'anonymous'
let ID = Date.now()
let socket = new WebSocket(HOST);

let audio = new Audio('./snapchat.mp3')


let form = document.querySelector('.form');
let input = document.querySelector('.input');
let chat_wrapper = document.querySelector('.chat-list');
let modal = document.querySelector('.hidden-modal');
let onlineElement = document.querySelector('.online');

form.addEventListener('submit', event => {
  event.preventDefault();
  let message = {
    type: 'message',
    nickname: nickname,
    message: input.value,
    id: ID,
  };
  socket.send(JSON.stringify(message))
  input.value = ''
});

function checkIntersection() {
  let options = {
    root: chat_wrapper,
    rootMargin: '0px',
    threshold: 1.0
  };
  callback = function(entries, observer) {
    if (entries[0].isIntersecting) {
      let message = {
        type: 'history'
      }
      socket.send(JSON.stringify(message))
    }
  };
  let target = document.querySelector('#intersection');
  let observer = new IntersectionObserver(callback, options);
  observer.observe(target)
}


socket.onopen = function(e) {
  let message = {
    type: 'connection',
    nickname: nickname,
  };

  socket.send(JSON.stringify(message));
  chat_wrapper.scrollTop = chat_wrapper.scrollHeight;
};

socket.onclose = function(e) {
  alert('Соединение разорвано')
};

socket.onmessage = function(message) {
  message = JSON.parse(message.data)

  putMessage(message);
  if (message?.id !== ID && message.type === 'message') {audio.play() }
  
};
checkIntersection()


function putMessage(msg) {
  
  switch (msg.type) {
    case'ping': 
      socket.send(JSON.stringify({type: 'pong'}));
      break 
    case 'connection_is_lost': 
      onlineElement.textContent = `Сейчас онлайн: ${msg.online}`
      modal.textContent = `Пользователь ${msg.nickname} вышел из чата`
      modal.classList.add('active')
        setTimeout(()=> {modal.classList.remove('active')}, 7000)
      break
    case 'connection': 
      onlineElement.textContent = `Сейчас онлайн: ${msg.online}`
      modal.textContent = `Пользователь ${msg.nickname} вошел в чат`
      modal.classList.add('active')
        setTimeout(()=> {modal.classList.remove('active')}, 7000)
      break
    case 'message':
      chat_wrapper.appendChild(createLastMessageItem(msg)) 
      chat_wrapper.scrollTop = chat_wrapper.scrollHeight;

      break
    case 'history':
      getHistory(msg)
  }
}

function getHistory(msg) {
  let anchor = chat_wrapper.firstChild
  msg.messageHistory.forEach(msg => {
  chat_wrapper.prepend(createLastMessageItem(msg))
  })
  if (chat_wrapper.children.length <= 31) {
    chat_wrapper.scrollTop = chat_wrapper.scrollHeight;
  } else {
    anchor.scrollIntoView()
  }
  anchor.scrollIntoView({block: 'center'})
  
}


function createLastMessageItem(msg) {
  let template = 
    `<div class="chat-user-name">${msg.nickname}: </div>
    <div class="chat-message">${msg.message}</div>`
  let messageItem = document.createElement('li');
      messageItem.classList.add('chat-item')
      messageItem.innerHTML = template

  return messageItem
}
