// UI Management: kolam sections, sidebar, notifications, toggle

// State kolamCount already in AppConfig, but we'll reference it via window.AppConfig
function addKolam() {
    window.AppConfig.kolamCount++;
    createKolamSection(window.AppConfig.kolamCount);
    updateSidebarMenu();
    window.subscribeToKolamTopics(window.AppConfig.kolamCount);
}

function removeKolam() {
    if (window.AppConfig.kolamCount <= 1) {
        window.showNotification('warning', 'Tidak dapat menghapus', 'Minimal harus ada 1 kolam');
        return;
    }
    const id = window.AppConfig.kolamCount;
    if (window.AppState.combinedCharts[id]) {
        window.AppState.combinedCharts[id].destroy();
        delete window.AppState.combinedCharts[id];
    }
    if (window.AppState.chartUpdateQueue[id]) {
        clearTimeout(window.AppState.chartUpdateQueue[id].timeout);
        delete window.AppState.chartUpdateQueue[id];
    }
    const el = document.getElementById(`kolam${id}`);
    if (el) el.remove();
    window.AppConfig.kolamCount--;
    updateSidebarMenu();
}

function createKolamSection(kolamId) {
    const container = document.getElementById('kolam-container');
    const section = document.createElement('div');
    section.id = `kolam${kolamId}`;
    section.className = 'kolam-section';
    section.innerHTML = `
        <div class="kolam-header">
            <i class="fas fa-water"></i>
            <span>Kolam ${kolamId}</span>
        </div>
        <div class="kolam-cards">
            <div class="card">
                <div class="parameter-title"><i class="fas fa-thermometer-half"></i><span>Suhu Air</span></div>
                <div class="parameter-value"><span id="suhu-${kolamId}">0</span><span class="parameter-unit">°C</span></div>
                <div class="progress-bar"><div class="progress-fill" id="suhu-${kolamId}-progress" style="width:0%"></div></div>
            </div>
            <div class="card">
                <div class="parameter-title"><i class="fas fa-vial"></i><span>pH Air</span></div>
                <div class="parameter-value"><span id="ph-${kolamId}">0</span><span class="parameter-unit">pH</span></div>
                <div class="progress-bar"><div class="progress-fill" id="ph-${kolamId}-progress" style="width:0%"></div></div>
            </div>
            <div class="card">
                <div class="parameter-title"><i class="fas fa-tint"></i><span>Kekeruhan (NTU)</span></div>
                <div class="parameter-value"><span id="kekeruhan-${kolamId}">0</span><span class="parameter-unit">NTU</span></div>
                <div class="progress-bar"><div class="progress-fill" id="kekeruhan-${kolamId}-progress" style="width:0%"></div></div>
            </div>
            <div class="card">
                <div class="parameter-title"><i class="fas fa-flask"></i><span>TDS</span></div>
                <div class="parameter-value"><span id="tds-${kolamId}">0</span><span class="parameter-unit">PPM</span></div>
                <div class="progress-bar"><div class="progress-fill" id="tds-${kolamId}-progress" style="width:0%"></div></div>
            </div>
            <div class="card">
                <div class="parameter-title"><i class="fas fa-info-circle"></i><span>Status Sistem</span></div>
                <div class="parameter-value"><span id="status-${kolamId}">Normal</span></div>
                <div class="progress-bar"><div class="progress-fill" id="status-${kolamId}-progress" style="width:100%;background:#4CAF50;"></div></div>
            </div>
        </div>
        <div class="kolam-charts">
            <div class="card">
                <div class="parameter-title"><i class="fas fa-chart-line"></i><span>Grafik Parameter</span></div>
                <div class="chart-container"><canvas id="parameterChart-${kolamId}"></canvas></div>
            </div>
        </div>
    `;
    container.appendChild(section);
    setTimeout(() => {
        window.initializeCombinedChart(kolamId);
    }, 100);
}

function updateSidebarMenu() {
    const sidebar = document.querySelector('.sidebar');
    // Remove existing kolam items
    sidebar.querySelectorAll('.menu-item[href^="#kolam"]').forEach(el => el.remove());
    const dashboardItem = sidebar.querySelector('.menu-item[href="#dashboard"]');
    for (let i = 1; i <= window.AppConfig.kolamCount; i++) {
        const a = document.createElement('a');
        a.href = `#kolam${i}`;
        a.className = 'menu-item';
        a.innerHTML = `<div class="menu-icon"><i class="fas fa-water"></i></div><div class="menu-text">Kolam ${i}</div>`;
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
        dashboardItem.insertAdjacentElement('afterend', a);
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('mobile-active');
}

function showNotification(type, title, message) {
    const notif = document.createElement('div');
    notif.className = `notification ${type} show`;
    const iconMap = {
        critical: 'fa-exclamation-triangle',
        warning: 'fa-exclamation-circle',
        safe: 'fa-check-circle'
    };
    const icon = iconMap[type] || 'fa-info-circle';
    const colorMap = { critical: '#ff6b6b', warning: '#fb923c', safe: '#34d399' };
    const color = colorMap[type] || '#06b6d4';
    notif.innerHTML = `
        <div class="notification-icon" style="color:${color};"><i class="fas ${icon}"></i></div>
        <div>
            <div style="font-weight:600;font-size:15px;">${title}</div>
            <div style="font-size:14px;color:var(--text-light-gray);">${message}</div>
        </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 500);
    }, 4000);
}

// Expose to global
window.addKolam = addKolam;
window.removeKolam = removeKolam;
window.createKolamSection = createKolamSection;
window.updateSidebarMenu = updateSidebarMenu;
window.toggleSidebar = toggleSidebar;
window.showNotification = showNotification;