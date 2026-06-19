// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize aquarium animation
    window.initAquarium();

    // Initialize UI (build initial kolam sections)
    const container = document.getElementById('kolam-container');
    container.innerHTML = '';
    for (let i = 1; i <= window.AppConfig.kolamCount; i++) {
        window.createKolamSection(i);
    }
    window.updateSidebarMenu();

    // Initialize charts
    window.initCharts();

    // Initialize MQTT connection
    window.initMQTT();

    // Periodic time update (if needed later)
    setInterval(() => {
        // placeholder for any time-based updates
    }, 1000);
});

// Handle window resize for charts
window.addEventListener('resize', function() {
    Object.keys(window.AppState.combinedCharts).forEach(id => {
        const chart = window.AppState.combinedCharts[id];
        if (chart) chart.resize();
    });
});