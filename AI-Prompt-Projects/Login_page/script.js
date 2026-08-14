const toggle=document.getElementById("toggle");
const password=document.getElementById("password");

toggle.onclick=function(){
if(password.type==="password"){
password.type="text";
toggle.innerText="Hide";
}else{
password.type="password";
toggle.innerText="Show";
}
}

function login(){

let email=document.getElementById("email").value;
let pass=password.value;

document.getElementById("emailError").innerHTML="";
document.getElementById("passwordError").innerHTML="";

let valid=true;

if(!email.includes("@")){
document.getElementById("emailError").innerHTML="Enter valid email";
valid=false;
}

if(pass===""){
document.getElementById("passwordError").innerHTML="Password required";
valid=false;
}

if(valid){
alert("Login Successful!");
}
}

function forgotPassword(){
let email=document.getElementById("email").value.trim();

document.getElementById("emailError").innerHTML="";

if(!email.includes("@")){
document.getElementById("emailError").innerHTML="Enter valid email to reset password";
return;
}

alert("Password reset link sent to " + email);
}