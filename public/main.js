

let HOST = location.origin.replace(/^http/, 'ws')

let nickname = prompt('Write your nickname') || 'anonymous'
let ID = Date.now()
let socket = new WebSocket(HOST);

let audio = new Audio('./snapchat.mp3')


let form = document.querySelector('.form');
let input = document.querySelector('.input');
let chat_wrapper = document.querySelector('.chat-list');
let modal = document.querySelector('.hidden-modal')

form.addEventListener('submit', event => {
  event.preventDefault();
  let message = {
    type: 'message',
    message: input.value,
    id: ID,
  };
  socket.send(JSON.stringify(message))
  input.value = ''
});

socket.onopen = function(e) {
  let message = {
    type: 'connection',
  };

  socket.send(JSON.stringify(message));
};

socket.onclose = function(e) {
  alert('Соединение разорвано')

};

socket.onmessage = function(message) {
  message = JSON.parse(message.data)

  putMessage(message);
  if (message?.id !== ID && message.type === 'message') {audio.play() }
  
};

function putMessage(msg) {
  
  switch (msg.type) {
    case'ping': 
      socket.send(JSON.stringify({type: 'pong'}));
      break 
    case 'connection_is_lost': 
      modal.textContent = `Пользователь ${nickname} вышел из чата`
      modal.classList.add('active')
        setTimeout(()=> {modal.classList.remove('active')}, 7000)
      break
    case 'connection': 
      modal.textContent = `Пользователь ${nickname} вошел в чат`
      modal.classList.add('active')
        setTimeout(()=> {modal.classList.remove('active')}, 7000)
      break
    case 'message':
      createMessageItem(msg)
      break
  }
  // msg.data.text().then((msg)=> {

  // }) 

}

function createMessageItem(msg) {
  let messageItem = document.createElement('li');
      let userName = document.createElement('div');
      let messagetext =  document.createElement('div');
      messagetext.classList.add('chat-message');
      userName.classList.add('chat-user-name');
      userName.textContent = `${nickname}: `
      messageItem.appendChild(userName)
      messageItem.appendChild(messagetext)
      messageItem.classList.add('chat-item')
      messagetext.textContent = msg.message
      chat_wrapper.appendChild(messageItem)
      chat_wrapper.scrollTop = chat_wrapper.scrollHeight;
}