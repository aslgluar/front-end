document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('http://localhost:5000');

    var elmFormJoin = document.querySelector('#form-join');
    var elmUserList = document.querySelector('#user-list .list');
    var elmMessagesList = document.querySelector('#messages-list');
    var elmFormMessage = document.querySelector('#form-message');

    elmFormJoin.addEventListener("submit", function(e) {
        var elmUsernameInput = e.target.querySelector('[name="username"]');
        if (!elmUsernameInput) {
            return;
        }

        var username = (elmUsernameInput.value || '').trim();

        if (!username) {
            showAlert('Please enter your username');

            return;
        }

        socket.emit('change_username', { username: elmUsernameInput.value });
    });

    elmFormMessage.addEventListener('submit', function(e) {
        var elmMessageInput = e.target.querySelector('[name="message"]');

        if (!elmMessageInput) {
            return;
        }

        var message = (elmMessageInput.value || '').trim();

        if (!message) {
            showAlert('Please enter your message');

            return;
        }

        socket.emit('typing', false);

        socket.emit('new_message', { message: message });

        e.target.reset();
    });

    socket.on('userlist_updated', function(data) {
        if (!data.length) {
            elmUserList.innerHTML = '<div class="item">No active user</div>';
            return;
        }

        elmUserList.innerHTML = data.map(function(user) {
            return [
                '<div class="item" data-id="' + user.id + '">',
                '<div class="user-status ui hidden right floated content" style="margin-top: 8px;font-size: 11px;color: lightslategray">',
                '<i class="ui pencil icon"></i> writing..',
                '</div>',
                '<img class="ui avatar image" src="' + user.avatar + '">',
                '<div class="content"><div class="header">' + user.username + '</div></div>',
                '</div>',
            ].join('');
        }).join('');
    });

    socket.on('joined', function() {
        elmFormJoin.classList.add('hidden');
        elmFormMessage.classList.remove('hidden');

        var elmMessageInput = elmFormMessage.querySelector('[name="message"]');

        if (elmMessageInput) {
            elmMessageInput.focus();

            elmMessageInput.addEventListener('keypress', function() {
                socket.emit('typing', true);
            });
        }
    });

    socket.on('typing', function(data) {
        var elmUserItemStatus = elmUserList.querySelector('[data-id="' + data.id + '"] .user-status');
        if (!elmUserItemStatus) {
            return;
        }

        elmUserItemStatus.classList.remove('hidden');

        debounce(function() {
            elmUserItemStatus.classList.add('hidden');
        }, 1000)();
    });

    socket.on('new_message', function(data) {
        elmMessagesList.innerHTML += [
            '<div class="comment">',
            '<a class="avatar">',
            '<img src="' + data.user.avatar + '">',
            '</a>',
            '<div class="content">',
            '<a class="author">' + data.user.username + '</a>',
            '<div class="text">' + data.message + '</div>',
            '</div>',
            '</div>',
        ].join('');

        elmMessagesList.scrollTop = elmMessagesList.scrollHeight - elmMessagesList.clientHeight;
    });
});

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function showAlert(message) {
    var elmAlertContainer = document.querySelector('#alert-container');

    elmAlertContainer.innerHTML = [
        '<div class="ui tiny yellow icon message">',
        '<i class="exclamation triangle icon"></i>',
        '<div class="content">',
        '<div class="header">Sorry</div>',
        '<p>' + message + '</p>',
        '</div>',
        '</div>',
    ].join('');

    setTimeout(function() {
        elmAlertContainer.innerHTML = '';
    }, 200000000);
}