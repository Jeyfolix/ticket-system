// JS: handle form submit via AJAX
document.getElementById('adminForm').addEventListener('submit', function(e){
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const password_confirm = document.getElementById('password_confirm').value;
    const msgDiv = document.getElementById('message');

    // Clear previous messages
    msgDiv.innerHTML = '';

    if(password !== password_confirm){
        msgDiv.innerHTML = '<div class="msg error">Passwords do not match</div>';
        return;
    }

    // Send data to backend via fetch
    fetch('../backend/process_admin.php', {
        method: 'POST',
        headers: { 'Content-Type':'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&password_confirm=${encodeURIComponent(password_confirm)}`
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
            msgDiv.innerHTML = '<div class="msg success">'+data.message+'</div>';
            document.getElementById('adminForm').reset();
        } else {
            let message = Array.isArray(data.message) ? data.message.join('<br>') : data.message;
            msgDiv.innerHTML = '<div class="msg error">'+message+'</div>';
        }
    })
    .catch(err => {
        msgDiv.innerHTML = '<div class="msg error">Error connecting to server.</div>';
        console.error(err);
    });
});
