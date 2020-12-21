class MapPie {

  constructor() {
    this.mapElement = document.getElementById('mapPie');
  }

  renderPie() {
    const selectPeriod = `${dashboard.arguments.period}`;
    const recovered = dashboard.worldInfo[`${selectPeriod}Recovered`];
    const deaths = dashboard.worldInfo[`${selectPeriod}Deaths`];
    const confirmed = dashboard.worldInfo[`${selectPeriod}Confirmed`];
    this.pieChart = new Chart(this.mapElement, {
      type: 'pie',
      data: {
        datasets: [{
          data: [deaths, (confirmed - recovered - deaths), recovered],
          backgroundColor: ['#ff6565', '#5fd46dc7', '#7babe0'],
          borderWidth: [1, 1, 1],
          borderColor: '#d5d5d5',
        }],
        labels: [
          'Deaths',
          'Infected',
          'Recovered',
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Global chart',
          fontSize: 16,
          fontColor: '#b3b3b3',
        },
        maintainAspectRatio: false,
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            boxWidth: 20,
            fontSize: 12,
            fontColor: '#b3b3b3',
          },
          onHover: function(e) {
            e.target.style.cursor = 'pointer';
          }
        },
        layout: {
          padding: 3,
        },
        hover: {
          onHover: function(e) {
            const point = this.getElementAtEvent(e);
            if (point.length) e.target.style.cursor = 'pointer';
            else e.target.style.cursor = 'default';
          }
        }
      }
    });
  }

  selectCountry() {
    const selectCountry = dashboard.selectedCountry === 'world' ? dashboard.worldInfo : dashboard.allInfo[dashboard.selectedCountry];
    const recovered = selectCountry['TotalRecovered'];
    const deaths = selectCountry['TotalDeaths'];
    const confirmed = selectCountry['TotalConfirmed'];
    this.pieChart.data.datasets[0].data = [];
    this.pieChart.data.datasets[0].data = [deaths, (confirmed - recovered - deaths), recovered];
    this.pieChart.update();
  }
}