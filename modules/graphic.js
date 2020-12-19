function graphicCreator() {
    this.context = document.getElementById("graphic");
    this.dataMass = {
        labels: [],
    };

    this.datasets = [
        {
            id: 0,
            label: 'Confirmed',
            data: [],
            backgroundColor: '#218000',
        },
        {
            id: 1,
            label: 'Recovered',
            data: [],
            backgroundColor: '#038c89',
        },
        {
            id: 2,
            label: 'Deaths',
            data: [],
            backgroundColor: '#ff6565',
        }
    ]

    let newLegendClickHandler = function (e, legendItem) {
        // var index = legendItem.datasetIndex;
        // let ci = this.chart;
        // ci.data.datasets.forEach((element) => {
        //     if (element.id !== index) {
        //         element.hidden = true;
        //     } else {
        //         element.hidden = false;
        //     }
        // })
        // ci.update();
        return;
    };

    let dataMass = ["Янв.", "Фев.", "Март.", "Апр.", "Май.", "Июн.", "Июл.", "Авг.", "Сент.", "Окт.", "Нояб.", "Дек."];

    this.config = {
        type: 'bar',
        options: {
            title: {
                display: true,
                text: 'Graphic',
                padding: 0,
                lineHeight: 1
            },
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                onClick: newLegendClickHandler,
                labels: {
                    boxWidth: 20
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        // callback: function(value, index, values) {
                        //     let i=0;
                        //     let month = value.slice(0, value.indexOf("/"));
                        //     let day = value.slice(value.indexOf("/")+1, value.lastIndexOf("/"));
                        //     let year = value.slice(value.lastIndexOf("/")+1);
                        //     let res = "";
                        //     if (month == 1) {
                        //         return dataMass[month-1] + "20" + year;
                        //     } else {
                        //         return dataMass[month-1];
                        //     }
                        // },
                        autoSkip: true,
                        maxTicksLimit: 13
                    },
                    categoryPercentage: 1.0,
                    barPercentage: 1.0
                }],
                yAxes: [{
                    ticks: {
                        callback: function(value, index, values) {
                            let length = value.toString().length;
                            let str = value.toString();
                            if (length == 4) {
                                return str.slice(0, 1) + "тыс.";
                            }
                            if (length == 5) {
                                return str.slice(0, 2) + "тыс.";
                            }
                            if (length == 6) {
                                return 0 + "." + str.slice(0, 1) + "млн.";
                            }
                            if (length == 7) {
                                return str.slice(0, 1) + "млн.";
                            }
                            if (length >= 8) {
                                return str.slice(0, str.length-6) + "млн.";
                            } else {
                                return str
                            }
                        },
                        beginAtZero: true
                    }
                }]
            }
        }
    }    
}

graphicCreator.prototype.generateConfig = function(){
    this.config.data = [];


    // if (!dashboard.arguments.absValue) {
    //     this.datasets.forEach((element, index) => {
    //         if (element.label == dashboard.arguments.sortBy) {
    //             this.datasets[index].data = this.datasets[index].data.map(element)
    //         }
    //     });
    // }
}

graphicCreator.prototype.renderGraphic = function() {
    Chart.defaults.global.defaultFontColor = '#fff';
    // let mass = [];
    // mass.push(this.datasets[0]);
    // console.log(mass)
    // this.dataMass.datasets = mass;
    // this.config.data = this.dataMass;
    this.graphic = new Chart(this.context, this.config);
}

graphicCreator.prototype.rerenderGraphic = function() {
    this.context.data = {};
    let resultObj = {};

    //graphic clear
    this.datasets.forEach(element => {
        element.data = [];
    });
    this.graphic.update();

    if (dashboard.arguments.sortBy == "Confirmed") {
        resultObj = this.datasets[0];
    }
    if (dashboard.arguments.sortBy == "Recovered") {
        resultObj = this.datasets[1];
    }
    if (dashboard.arguments.sortBy == "Deaths") {
        resultObj = this.datasets[2];
    }
    if (dashboard.selectedCountry == "world") {
        fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=360", this.requestOptions)
            .then(response => response.text())
            .then(result => {
                let object = JSON.parse(result);

                //заполнение массивов данными
                for (item in object){
                    if (item == "cases" && dashboard.arguments.sortBy == "Confirmed") {
                        let mass = Object.entries(object[item]);
                        mass.forEach(element => {
                            resultObj.data.push(element[1]);
                        })
                    }  
                    if (item == "recovered" && dashboard.arguments.sortBy == "Recovered") {
                        let mass = Object.entries(object[item]);
                        mass.forEach(element => {
                            resultObj.data.push(element[1]);
                        })
                    }
                    if (item == "deaths" && dashboard.arguments.sortBy == "Deaths") {
                        let mass = Object.entries(object[item]);
                        mass.forEach(element => {
                            resultObj.data.push(element[1]);
                        })
                    }
                }

                //last apdated or all time
                if (dashboard.arguments.period == "New") {
                    let mass = [];
                    for (let i=1; i<resultObj.data.length; i++) {
                        mass.push(resultObj.data[i] - resultObj.data[i-1]);
                    }
                    resultObj.data = mass.slice();
                }

                //на 100 000 населения или absolute
                let population = 7827000000;
                if (!dashboard.arguments.absValue) {
                    resultObj.data = resultObj.data.map(element => {
                        return Math.floor(100000 / population * element);
                    })
                }

                let labels = Object.keys(object['cases']);
                let datasets = [];
                datasets.push(resultObj);
                this.config.data = {
                    labels: labels,
                    datasets: datasets
                }
                this.graphic.update();  
            })
    } else {
        fetch(`https://disease.sh/v3/covid-19/historical/${dashboard.selectedCountry}?lastdays=all`)
            .then(response => response.text())
            .then(result => {
                let object = JSON.parse(result).timeline;

                //заполнение массивов данными
                for (item in object){
                    if (item == "cases" && dashboard.arguments.sortBy == "Confirmed") {
                        let mass = Object.entries(object[item]);
                        mass.forEach(element => {
                            resultObj.data.push(element[1]);
                        })
                    }  
                    if (item == "recovered" && dashboard.arguments.sortBy == "Recovered") {
                        let mass = Object.entries(object[item]);
                        mass.forEach(element => {
                            resultObj.data.push(element[1]);
                        })
                    }
                    if (item == "deaths" && dashboard.arguments.sortBy == "Deaths") {
                        let mass = Object.entries(object[item]);
                        mass.forEach(element => {
                            resultObj.data.push(element[1]);
                        })
                    }
                }

                //last apdated or all time
                if (dashboard.arguments.period == "New") {
                    for (let i=1; i<resultObj.data.length; i++) {
                        resultObj.data[i] = resultObj.data[i] - resultObj.data[i-1];
                    }
                }

                //на 100 000 населения или absolute
                let population = dashboard.allInfo[dashboard.selectedCountry].population;
                if (!dashboard.arguments.absValue) {
                    resultObj.data = resultObj.data.map(element => {
                        return Math.floor(100000 / population * element);
                    })
                }

                let labels = Object.keys(object['cases']);
                let datasets = [];
                datasets.push(resultObj);
                this.config.data = {
                    labels: labels,
                    datasets: datasets
                }
                console.log(dashboard.selectedCountry)
                //заполнение оси X данными
                this.graphic.update();  
            });
    }
}

graphicCreator.prototype.clearGraphic = function() {
    this.dataMass.datasets.forEach(element => {
        element.data = [];
    });
    this.graphic.update();
    console.log("YEs");
}