// Chart management
window.initCharts = function() {
    const { kolamCount } = window.AppConfig;
    setTimeout(() => {
        for (let i = 1; i <= kolamCount; i++) {
            if (!window.AppState.combinedCharts[i]) {
                initializeCombinedChart(i);
            }
        }
    }, 100);
};

function initializeCombinedChart(kolamId) {
    const canvas = document.getElementById(`parameterChart-${kolamId}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window.AppState.combinedCharts[kolamId]) {
        window.AppState.combinedCharts[kolamId].destroy();
    }
    window.AppState.combinedCharts[kolamId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Suhu (°C)', data: [], borderColor: '#ff0000', backgroundColor: 'rgba(255,0,0,0.1)', tension: 0.1, fill: true, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'pH', data: [], borderColor: '#7bdff2', backgroundColor: 'rgba(123,223,242,0.1)', tension: 0.1, fill: true, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Kekeruhan (NTU)', data: [], borderColor: '#4ecdc4', backgroundColor: 'rgba(78,205,196,0.1)', tension: 0.1, fill: true, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 10, color: '#ffffff' } },
                y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#ffffff' }, title: { display: true, text: 'Parameter', color: '#ffffff' } }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, padding: 20, usePointStyle: true, color: '#ffffff' } },
                tooltip: { mode: 'index', intersect: false, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}` } }
            },
            animation: { duration: 0 },
            transitions: { active: { animation: { duration: 0 } } }
        }
    });
}

function queueChartUpdate(kolamId, type, value) {
    const queue = window.AppState.chartUpdateQueue;
    if (!queue[kolamId]) queue[kolamId] = {};
    queue[kolamId][type] = value;
    if (queue[kolamId].timeout) clearTimeout(queue[kolamId].timeout);
    queue[kolamId].timeout = setTimeout(() => {
        const updates = queue[kolamId];
        for (let [t, v] of Object.entries(updates)) {
            if (t !== 'timeout') updateCombinedChartData(kolamId, t, v);
        }
        delete queue[kolamId];
    }, window.AppConfig.chartUpdateDebounce);
}

function updateCombinedChartData(kolamId, type, value) {
    const chart = window.AppState.combinedCharts[kolamId];
    if (!chart) { initializeCombinedChart(kolamId); return; }
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chart.data.labels.push(timeLabel);
    let datasetIndex = type === 'suhu' ? 0 : type === 'ph' ? 1 : type === 'kekeruhan' ? 2 : -1;
    if (datasetIndex >= 0) {
        chart.data.datasets[datasetIndex].data.push(value);
        chart.data.datasets.forEach((ds, idx) => {
            if (idx !== datasetIndex) {
                const last = ds.data.length > 0 ? ds.data[ds.data.length - 1] : null;
                ds.data.push(last);
            }
        });
    }
    const max = window.AppConfig.maxChartDataPoints;
    while (chart.data.labels.length > max) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(ds => ds.data.shift());
    }
    chart.update({ duration: 0, lazy: false });
}

window.resetChart = function(kolamId) {
    const chart = window.AppState.combinedCharts[kolamId];
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets.forEach(ds => ds.data = []);
        chart.update();
    }
};

// Expose necessary functions to other modules
window.initializeCombinedChart = initializeCombinedChart;
window.queueChartUpdate = queueChartUpdate;
window.updateCombinedChartData = updateCombinedChartData;