const API_URL = "https://script.google.com/macros/s/AKfycbwqeSmUlUfXNvagKq8bkPxpYBP0wsx55wJUv6pyXX_yXB_zhr8jUp1lWNqFPNAg5utEuQ/exec"; // Replace with deployed web app URL

// ---------- LOGIN ----------
function generateOTP(){
  const email = document.getElementById("loginEmail").value;
  const type = document.getElementById("loginType").value;
  fetch(API_URL,{method:"POST",body:JSON.stringify({action:"generateOTP", email, type})})
    .then(r=>r.json()).then(res=>document.getElementById("loginMsg").innerText=res.status==="ok"?"OTP sent!":res.msg);
}

function verifyOTP(){
  const email = document.getElementById("loginEmail").value;
  const otp = document.getElementById("loginOTP").value;
  const type = document.getElementById("loginType").value;
  fetch(API_URL,{method:"POST",body:JSON.stringify({action:"verifyOTP", email, otp, type})})
    .then(r=>r.json()).then(res=>{
      if(res.status==="ok"){
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("type", type);
        window.location.href = type==="user"?"user-dashboard.html":"admin-dashboard.html";
      } else document.getElementById("loginMsg").innerText=res.msg;
    });
}

// ---------- LOGOUT ----------
function logout(){ sessionStorage.clear(); window.location.href="index.html"; }

// ---------- ENQUIRY ----------
function submitEnquiry(){
  const Name=document.getElementById("enqName").value;
  const Mobile=document.getElementById("enqMobile").value;
  const Email=document.getElementById("enqEmail").value;
  const DeviceType=document.getElementById("enqDevice").value;
  fetch(API_URL,{method:"POST",body:JSON.stringify({action:"submitEnquiry", Name, Mobile, Email, DeviceType})})
    .then(r=>r.json()).then(res=>document.getElementById("enqMsg").innerText=res.status==="ok"?"Submitted!":"Error");
}

// ---------- ADMIN CREATE/UPDATE USER ----------
function createOrUpdateUser(){
  const params = {
    action:"createOrUpdateUserAccount",
    Email:document.getElementById("userEmail").value,
    "Playlist Name":document.getElementById("playlistName").value,
    "Playlist Activated Date":document.getElementById("playlistActivated").value,
    "Playlist Expiry Date":document.getElementById("playlistExpiry").value,
    "Amount Paid":document.getElementById("amountPaid").value,
    "Portal Link":document.getElementById("portalLink").value,
    "Portal User Name":document.getElementById("portalUser").value,
    "Portal Password":document.getElementById("portalPass").value,
    "IPTV Player Name":document.getElementById("iptvPlayer").value
  };
  fetch(API_URL,{method:"POST",body:JSON.stringify(params)})
    .then(r=>r.json()).then(res=>document.getElementById("userMsg").innerText=res.status==="ok"?"Saved!":"Error");
}

// ---------- GET USER DASHBOARD ----------
function loadUserDashboard(){
  const email=sessionStorage.getItem("email");
  fetch(API_URL,{method:"POST",body:JSON.stringify({action:"getUserDashboard", email})})
    .then(r=>r.json()).then(res=>{
      if(res.status==="ok"){
        let html="<table border='1' style='width:100%;'>";
        for(const k in res.data){ html+=`<tr><td>${k}</td><td>${res.data[k]}</td></tr>`; }
        html+="</table>";
        document.getElementById("userDetails").innerHTML=html;
      }
    });
}

// ---------- SUBMIT REFERRAL ----------
function submitReferral(){
  const email=sessionStorage.getItem("email");
  const NewUserEmail=document.getElementById("refNewEmail").value;
  const Name=document.getElementById("refName").value;
  const Mobile=document.getElementById("refMobile").value;
  fetch(API_URL,{method:"POST",body:JSON.stringify({action:"submitReferral", ReferralEmail:email, NewUserEmail, Name, Mobile})})
    .then(r=>r.json()).then(res=>document.getElementById("refMsg").innerText=res.status==="ok"?"Submitted!":"Error");
}
