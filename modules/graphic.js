function graphicCreator() {
    const ctx = document.getElementById("graphic");
    const config = {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45]
            }]
        },
    }
    //let chart = new Chart(ctx, )
}

graphicCreator.prototype.x = function(){
    return "YES";
}