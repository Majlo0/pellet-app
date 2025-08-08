const form = document.getElementById('pelletForm');
const table = document.getElementById('dataTable');
const clearBtn = document.getElementById('clearDataBtn');
const exportBtn = document.getElementById('exportCSV');
const monthFilter = document.getElementById('monthFilter');

let data = JSON.parse(localStorage.getItem('pelletData')) || {};

form.addEventListener('submit', e => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const price = parseFloat(document.getElementById('price').value) || null;
  const temp = parseFloat(document.getElementById('temperature').value) || null;
  data[date] = { amount, price, temperature: temp };
  localStorage.setItem('pelletData', JSON.stringify(data));
  form.reset();
  render();
});

clearBtn.addEventListener('click', () => {
  if (confirm("Czy na pewno usunąć wszystkie dane?")) {
    localStorage.removeItem('pelletData');
    data = {};
    render();
  }
});

exportBtn.addEventListener('click', () => {
  let csv = "Data,Ilość (kg),Cena/kg,Temperatura\n";
  Object.entries(data).forEach(([date, val]) => {
    csv += `${date},${val.amount},${val.price ?? ""},${val.temperature ?? ""}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "pellet_data.csv";
  a.click();
});

monthFilter.addEventListener('change', render);

function render() {
  const tbody = table;
  tbody.innerHTML = "";
  const selectedMonth = monthFilter.value;
  let labels = [], values = [], monthSum = {}, total = 0, cost = 0;

  Object.entries(data).sort().forEach(([date, val]) => {
    if (!selectedMonth || date.startsWith(selectedMonth)) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td>${val.amount}</td>
        <td>${val.price ?? "-"}</td>
        <td>${val.temperature ?? "-"}</td>
        <td><button onclick="removeEntry('${date}')">Usuń</button></td>
      `;
      tbody.appendChild(row);
      labels.push(date);
      values.push(val.amount);
      total += val.amount;
      if (val.price) cost += val.amount * val.price;
    }

    const [y, m] = date.split('-');
    const ym = y + '-' + m;
    monthSum[ym] = (monthSum[ym] || 0) + val.amount;
  });

  document.getElementById('sumTotal').textContent = total.toFixed(2);
  document.getElementById('average').textContent = (values.length ? (total / values.length).toFixed(2) : "0");
  document.getElementById('totalCost').textContent = cost.toFixed(2);

  dailyChart.data.labels = labels;
  dailyChart.data.datasets[0].data = values;
  dailyChart.update();

  monthlyChart.data.labels = Object.keys(monthSum);
  monthlyChart.data.datasets[0].data = Object.values(monthSum);
  monthlyChart.update();
}

function removeEntry(date) {
  delete data[date];
  localStorage.setItem('pelletData', JSON.stringify(data));
  render();
}

const dailyChart = new Chart(document.getElementById('dailyChart'), {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Zużycie dzienne (kg)',
      data: [],
      backgroundColor: 'rgba(0, 123, 255, 0.5)'
    }]
  },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

const monthlyChart = new Chart(document.getElementById('monthlyChart'), {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Zużycie miesięczne (kg)',
      data: [],
      backgroundColor: 'rgba(40, 167, 69, 0.5)'
    }]
  },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

render();
