

let HOST = location.origin.replace(/^http/, 'ws')

let nickname = prompt('Write your nickname') || 'anonymous'
let socket = new WebSocket(HOST);

let form = document.querySelector('.form');
let input = document.querySelector('.input');
let chat_wrapper = document.querySelector('.chat-list');

let modal = document.querySelector('.hidden-modal')




console.log(nickname);
form.addEventListener('submit', event => {
  event.preventDefault();
  let message = {
    type: 'event',
    nickname: nickname,
    message: input.value
  };
  socket.send(JSON.stringify(message))
  input.value = ''
});

socket.onopen = function(e) {
  console.log('установлено');
  let message = {
    type: 'connection',
    nick: nickname,
    message: `Пользователь ${nickname} вошел в чат`
  };

  socket.send(JSON.stringify(message));
};

socket.onclose = function(e) {
  let message = {
    type: 'connection',
    nick: nickname,
    message: `Пользователь ${nickname} вышел из чата`
  };
  socket.send(JSON.stringify(message));

};

socket.onmessage = function(message) {
  putMessage(message);
};

function putMessage(msg) {
  msg = JSON.parse(msg.data)
  switch (msg.type) {
    case 'connection': 
      modal.textContent = msg.message
      modal.classList.add('active')
        setTimeout(()=> {modal.classList.remove('active')}, 3000)
      break
    case 'event':
      let messageItem = document.createElement('li');
      let userName = document.createElement('div');
      let messagetext =  document.createElement('div');
      messagetext.classList.add('chat-message');
      userName.classList.add('chat-user-name');
      userName.textContent = `${msg.nickname}: `
      messageItem.appendChild(userName)
      messageItem.appendChild(messagetext)
      messageItem.classList.add('chat-item')
      messagetext.textContent = msg.message
      chat_wrapper.appendChild(messageItem)
      break
  }
  // msg.data.text().then((msg)=> {

  // }) 

}