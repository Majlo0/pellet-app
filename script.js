const form = document.getElementById('pelletForm');
const dateInput = document.getElementById('date');
const amountInput = document.getElementById('amount');
const monthFilter = document.getElementById('monthFilter');

let data = JSON.parse(localStorage.getItem('pelletData')) || {};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const date = dateInput.value;
  const amount = parseFloat(amountInput.value);

  if (date && amount) {
    data[date] = (data[date] || 0) + amount;
    localStorage.setItem('pelletData', JSON.stringify(data));
    updateCharts();
    form.reset();
  }
});

monthFilter.addEventListener('change', updateCharts);

function updateCharts() {
  const selectedMonth = monthFilter.value;
  const dailyLabels = [];
  const dailyValues = [];
  const monthlyTotals = {};

  Object.keys(data).forEach(date => {
    const value = data[date];
    const [year, month, day] = date.split('-');
    const monthKey = year + '-' + month;

    // Dane dzienne w wybranym miesiącu
    if (!selectedMonth || date.startsWith(selectedMonth)) {
      dailyLabels.push(date);
      dailyValues.push(value);
    }

    // Dane miesięczne
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + value;
  });

  // Aktualizacja wykresu dziennego
  dailyChart.data.labels = dailyLabels;
  dailyChart.data.datasets[0].data = dailyValues;
  dailyChart.update();

  // Aktualizacja wykresu miesięcznego
  const sortedMonths = Object.keys(monthlyTotals).sort();
  const monthlyValues = sortedMonths.map(month => monthlyTotals[month]);

  monthlyChart.data.labels = sortedMonths;
  monthlyChart.data.datasets[0].data = monthlyValues;
  monthlyChart.update();
}

const dailyCtx = document.getElementById('chart').getContext('2d');
const dailyChart = new Chart(dailyCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Zużycie dzienne (kg)',
      data: [],
      backgroundColor: 'rgba(0, 123, 255, 0.5)',
      borderColor: 'rgba(0, 123, 255, 1)',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: { beginAtZero: true }
    }
  }
});

const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
const monthlyChart = new Chart(monthlyCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Zużycie miesięczne (kg)',
      data: [],
      backgroundColor: 'rgba(40, 167, 69, 0.5)',
      borderColor: 'rgba(40, 167, 69, 1)',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: { beginAtZero: true }
    }
  }
});

updateCharts();
