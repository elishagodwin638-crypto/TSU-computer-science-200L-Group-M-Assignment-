let revenueChart;
db.collection("students").onSnapshot(snapshot=>{
    let table = document.getElementById("payments");
    table.innerHTML="";
    let deptRevenue = {};
    snapshot.forEach(doc=>{
        let s = doc.data();
        table.innerHTML += `<tr><td>${s.email}</td><td>₦${s.totalPaid}</td><td>₦${s.balance}</td></tr>`;
        if(deptRevenue[s.department]){ deptRevenue[s.department]+=s.totalPaid; }
        else{ deptRevenue[s.department]=s.totalPaid; }
    });

    let ctx = document.getElementById("revenueChart").getContext("2d");
    if(revenueChart){ revenueChart.destroy(); }
    revenueChart = new Chart(ctx,{
        type:"bar",
        data:{
            labels:Object.keys(deptRevenue),
            datasets:[{
                label:"Revenue per Department (₦)",
                data:Object.values(deptRevenue),
                backgroundColor:["#4CAF50","#FF9800","#2196F3","#9C27B0"]
            }]
        },
        options:{ responsive:true, plugins:{legend:{display:false}, title:{display:true,text:"Department Revenue"}} }
    });
});