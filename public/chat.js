
$(function(){

    let socket = io.connect('http://localhost:5000');


    var message=document.getElementById('#message');
    var send_message=document.getElementById('#send-message');
    var feedback=document.getElementById('#feedback');
    var chatroom=document.getElementById('#chatroom');
    var userlist=document.getElementById('#users-list');
    var username=document.getElementById('#username-input');



    send_message.click(function(){
        socket.emit('new-message',{message:message.val()})
    });
    message.keypress(e => {
        let keycode = (e.keycode ? e.keycode : e.which);
        if(keycode == '13'){
            socket.emit('new-message',{message : message.val()})
        }
    })


    socket.on('new-message',(data) => {
        feedback.html('');
        message.html('');

        chatroom.append(`
        <div>
        <div class="box3 sb14">
          <p style='color:${data.color}' class="chat-text user-nickname">${data.username}</p>
          <p class="chat-text" style="color: rgba(0,0,0,0.87)">${data.message}</p>
        </div>
    </div>
        `)
        keepTheChatRoomToTheBottom()
    })

    username.keypress(e => {
        let keycode = (e.keycode ? e.keycode :e.which);
        if(e.keycode == '13'){
            socket.emit('change_username', {username :username.val()});
            socket.on('get users',data => {
                let html ='';
                for(let i=0;i<data.length;i++){
                    html+=`<li class "list-item" style="color: ${data[i].color}">${data[i].username}</li>`;

                }
                userlist.html(html)

            })
        }
    

    });

    message.on("keypress",e => {
        let keycode = (e.keycode ? e.keycode :e.which);
        if(keycode =!'13'){
            socket.emit('typing');
        }
    });


    socket.on('typing' , (data) => {
        feedback.html("<p><i>"+ data.username +" is typing" +"</i></p>")
    });

});//ana function bitişi

const keepTheChatRoomToTheBottom = () => {
    const chatroom = document.getElementById('chatroom');
    chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
}






































