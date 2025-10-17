document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append('username', document.getElementById('username').value.trim());
    formData.append('password', document.getElementById('password').value);

    fetch('../backend/login.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
            alert(data.message); // Show success message
            window.location.href = '../frontend/student_dashboard.html'; // Redirect to dashboard
        } else {
            alert(data.message); // Show error message
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error connecting to server.");
    });
});
