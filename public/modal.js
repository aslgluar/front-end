// modal'ı al
var modal = document.getElementById("modal");
const usernameInput = document.getElementById("username-input");

// nick-name yazılınca kapat
usernameInput.onkeypress = e => {
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode == '13'){
        modal.style.display = "none";
    }
};