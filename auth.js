function register(){
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, pass)
    .then(()=> alert("Account Created"))
    .catch(e => alert(e.message));
}

function login(){
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, pass)
    .then(()=> {
        if(email === "admin@university.edu"){
            window.location="admin.html";
        } else {
            window.location="student.html";
        }
    })
    .catch(e => alert(e.message));
}