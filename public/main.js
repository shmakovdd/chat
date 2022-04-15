
let HOST = location.origin.replace(/^http/, 'ws')


let socket = new WebSocket(HOST);

let form = document.querySelector('.form');
let input = document.querySelector('.input');
let chat_wrapper = document.querySelector('.chat-list');

let modal = document.querySelector('.hidden-modal')



let nickname = prompt('Write your nickname') || 'anonymous'

console.log(nickname);
form.addEventListener('submit', event => {
  event.preventDefault();
  let message = input.value;
  socket.send(message)
  input.value = ''
});

socket.onopen = function(e) {
  
};

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