
let HOST = location.origin.replace(/^http/, 'ws')


let socket = new WebSocket(HOST);

let form = document.querySelector('.form');
let input = document.querySelector('.input');
let chat_wrapper = document.querySelector('.chat-list');

form.addEventListener('submit', event => {
  event.preventDefault();
  let message = input.value;
  socket.send(message)
  input.value = ''
});

socket.onmessage = function(message) {
  putMessage(message)
}

function putMessage(msg) {
  msg.data.text().then((msg)=> {
    let messageItem = document.createElement('li')
    messageItem.classList.add('chat-item')
    messageItem.textContent = msg
    chat_wrapper.appendChild(messageItem)
  }) 

}