document.getElementById('studentForm').addEventListener('submit', function(e){
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append('fullname', document.getElementById('fullname').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('regno', document.getElementById('regno').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());
    formData.append('faculty', document.getElementById('faculty').value);
    formData.append('department', document.getElementById('department').value.trim());
    formData.append('course', document.getElementById('course').value.trim());
    formData.append('password', document.getElementById('password').value);
    formData.append('confirm_password', document.getElementById('confirm_password').value);

    const msgDiv = document.getElementById('message');
    msgDiv.innerHTML = '';

    fetch('../backend/student_register.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
            msgDiv.innerHTML = `<div class="msg success">${data.message}</div>`;
            document.getElementById('studentForm').reset();
        } else {
            let message = Array.isArray(data.message) ? data.message.join('<br>') : data.message;
            msgDiv.innerHTML = `<div class="msg error">${message}</div>`;
        }
    })
    .catch(err => {
        msgDiv.innerHTML = '<div class="msg error">Error connecting to server.</div>';
        console.error(err);
    });
});
