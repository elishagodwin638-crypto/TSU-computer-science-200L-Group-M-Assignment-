function calculateFees(dept, level){
    let fees = {
        "Computer Science": {100:120000,200:110000,300:100000,400:90000},
        "Mass Communication": {100:100000,200:95000,300:90000,400:85000},
        "Accounting": {100:105000,200:100000,300:95000,400:90000},
        "Business Administration": {100:98000,200:94000,300:90000,400:85000}
    };
    return fees[dept][level];
}

function saveProfile(){
    let matric = document.getElementById("matric").value;
    let dept = document.getElementById("department").value;
    let level = Number(document.getElementById("level").value);
    let totalFees = calculateFees(dept, level);

    db.collection("students").doc(auth.currentUser.uid).set({
        email: auth.currentUser.email,
        matric,
        department: dept,
        level,
        totalFees,
        totalPaid:0,
        balance:totalFees
    });

    alert("Profile Saved");
    loadSummary();
}

function loadProfile(){
    db.collection("students").doc(auth.currentUser.uid).get()
    .then(doc=>{
        if(doc.exists){
            let s = doc.data();
            document.getElementById("amount").placeholder = "Total Fees: ₦"+s.totalFees;
        }
    });
}

function payFees(){
    let payAmount = Number(document.getElementById("amount").value);

    db.collection("students").doc(auth.currentUser.uid).get()
    .then(doc=>{
        let student = doc.data();
        let newPaid = student.totalPaid + payAmount;
        if(newPaid > student.totalFees){ alert("Payment exceeds total fees"); return; }
        let newBalance = student.totalFees - newPaid;

        let handler = PaystackPop.setup({
            key: 'pk_test_xxxxx',
            email: auth.currentUser.email,
            amount: payAmount*100,
            callback:function(){
                db.collection("payments").add({
                    email:auth.currentUser.email,
                    amount:payAmount,
                    date:new Date().toLocaleString()
                });
                db.collection("students").doc(auth.currentUser.uid).update({
                    totalPaid:newPaid,
                    balance:newBalance
                });
                alert("Payment Successful. Balance ₦"+newBalance);
                loadHistory();
                loadSummary();
            }
        });
        handler.openIframe();
    });
}

function loadSummary(){
    db.collection("students").doc(auth.currentUser.uid).get()
    .then(doc=>{
        let s = doc.data();
        document.getElementById("totalFees").innerText = "Total Fees: ₦"+s.totalFees;
        document.getElementById("totalPaid").innerText = "Total Paid: ₦"+s.totalPaid;
        document.getElementById("balance").innerText = "Balance: ₦"+s.balance;

        let percent = Math.round((s.totalPaid/s.totalFees)*100);
        let bar = document.getElementById("progressBar");
        bar.style.width = percent+"%";
        bar.innerText = percent+"%";

        loadChart(s.totalPaid, s.balance);
    });
}

let paymentChart;
function loadChart(paid,balance){
    let ctx = document.getElementById("paymentChart").getContext("2d");
    if(paymentChart){ paymentChart.destroy(); }
    paymentChart = new Chart(ctx,{
        type:"pie",
        data:{
            labels:["Paid","Balance"],
            datasets:[{data:[paid,balance], backgroundColor:["#4CAF50","#FF9800"]}]
        }
    });
}

function loadHistory(){
    db.collection("payments").where("email","==",auth.currentUser.email).onSnapshot(snapshot=>{
        let table = document.getElementById("history");
        table.innerHTML="";
        snapshot.forEach(doc=>{
            let p = doc.data();
            table.innerHTML += `<tr><td>₦${p.amount}</td><td>${p.date}</td></tr>`;
        });
    });
}

auth.onAuthStateChanged(user=>{
    if(user){
        loadProfile();
        loadHistory();
        loadSummary();
    }
});