// MQTT Connection and message handling
function initMQTT() {
    const { brokerUrl, mqttReconnectPeriod, mqttConnectTimeout, topicPrefix, kolamCount } = window.AppConfig;
    const clientId = 'webclient-' + Math.random().toString(16).substr(2, 8);
    const client = mqtt.connect(brokerUrl, {
        reconnectPeriod: mqttReconnectPeriod,
        clientId: clientId,
        connectTimeout: mqttConnectTimeout
    });
    window.AppState.mqttClient = client;

    client.on('connect', () => {
        console.log('MQTT connected to RAS System');
        // Subscribe settings topics
        for (let i = 1; i <= kolamCount; i++) {
            client.subscribe(`${topicPrefix}settings${i}`, { qos: 0 });
        }
        // Subscribe sensor topics for existing kolams
        for (let i = 1; i <= kolamCount; i++) {
            subscribeToKolamTopics(i);
        }
        // Flush queued messages
        flushPublishQueue();
        document.getElementById('mqtt-status-indicator').className = 'status-indicator status-connected';
        document.getElementById('mqtt-status-text').textContent = 'MQTT: Connected';
        window.showNotification('safe', 'MQTT Connected', 'Terhubung ke broker MQTT');
    });

    client.on('message', (topic, message) => {
        const msg = message.toString();
        console.log(`Received from ${topic}: ${msg}`);
        const kolamId = extractKolamId(topic);
        if (!kolamId) return;
        try {
            if (topic.includes('tempsuhu')) {
                const val = parseFloat(msg);
                document.getElementById(`suhu-${kolamId}`).textContent = val.toFixed(1);
                updateProgressBar(`suhu-${kolamId}`, val, 0, 40);
                window.queueChartUpdate(kolamId, 'suhu', val);
            } else if (topic.includes('pHquality')) {
                const val = parseFloat(msg);
                document.getElementById(`ph-${kolamId}`).textContent = val.toFixed(1);
                updateProgressBar(`ph-${kolamId}`, val, 0, 14);
                window.queueChartUpdate(kolamId, 'ph', val);
            } else if (topic.includes('NTUkeruh')) {
                const val = parseFloat(msg);
                document.getElementById(`kekeruhan-${kolamId}`).textContent = val.toFixed(1);
                updateProgressBar(`kekeruhan-${kolamId}`, val, 0, 100);
                window.queueChartUpdate(kolamId, 'kekeruhan', val);
            } else if (topic.includes('TDS')) {
                const val = parseFloat(msg);
                document.getElementById(`tds-${kolamId}`).textContent = val.toFixed(0);
                updateProgressBar(`tds-${kolamId}`, val, 0, 1000);
            } else if (topic.includes('statuskolam')) {
                const statusEl = document.getElementById(`status-${kolamId}`);
                const progressEl = document.getElementById(`status-${kolamId}-progress`);
                if (msg.toLowerCase() === 'warning') {
                    statusEl.textContent = 'Warning';
                    progressEl.style.background = '#FF5252';
                } else {
                    statusEl.textContent = 'Normal';
                    progressEl.style.background = '#4CAF50';
                }
            }
        } catch (e) { console.error('Error processing MQTT message:', e); }
    });

    client.on('error', (err) => {
        console.error('MQTT error:', err);
        document.getElementById('mqtt-status-indicator').className = 'status-indicator status-disconnected';
        document.getElementById('mqtt-status-text').textContent = 'MQTT: Error';
        window.showNotification('critical', 'MQTT Error', 'Koneksi MQTT bermasalah');
    });

    client.on('reconnect', () => {
        document.getElementById('mqtt-status-indicator').className = 'status-indicator status-disconnected';
        document.getElementById('mqtt-status-text').textContent = 'MQTT: Reconnecting';
    });

    client.on('close', () => {
        document.getElementById('mqtt-status-indicator').className = 'status-indicator status-disconnected';
        document.getElementById('mqtt-status-text').textContent = 'MQTT: Disconnected';
    });
}

function subscribeToKolamTopics(kolamId) {
    const client = window.AppState.mqttClient;
    if (!client || !client.connected) return;
    const prefix = window.AppConfig.topicPrefix;
    const topics = [
        `${prefix}tempsuhu${kolamId}`,
        `${prefix}pHquality${kolamId}`,
        `${prefix}NTUkeruh${kolamId}`,
        `${prefix}TDS${kolamId}`,
        `${prefix}statuskolam${kolamId}`
    ];
    client.subscribe(topics, { qos: 0 }, (err) => {
        if (err) console.warn(`Subscribe error for kolam ${kolamId}`, err);
    });
}

function publish(topic, payload) {
    const client = window.AppState.mqttClient;
    const msg = { topic, payload: String(payload) };
    if (client && client.connected) {
        client.publish(topic, msg.payload, window.AppConfig.publishOptions, (err) => {
            if (err) {
                console.error('Publish error', err);
                window.AppState.publishQueue.push(msg);
            } else {
                console.log(`Published to ${topic}: ${msg.payload}`);
            }
        });
    } else {
        window.AppState.publishQueue.push(msg);
        console.warn(`MQTT not connected - queued message for ${topic}`);
    }
}

function flushPublishQueue() {
    const client = window.AppState.mqttClient;
    const queue = window.AppState.publishQueue;
    while (queue.length > 0) {
        const { topic, payload } = queue.shift();
        client.publish(topic, payload, window.AppConfig.publishOptions, (err) => {
            if (err) {
                console.error('Failed to flush queued message', err);
                queue.unshift({ topic, payload });
            } else {
                console.log(`Flushed queued message to ${topic}: ${payload}`);
            }
        });
    }
}

function extractKolamId(topic) {
    const matches = topic.match(/\d+$/);
    return matches ? matches[0] : null;
}

function updateProgressBar(parameter, value, min, max) {
    const bar = document.getElementById(`${parameter}-progress`);
    if (bar) {
        const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
        bar.style.width = `${pct}%`;
    }
}

// Expose to global
window.subscribeToKolamTopics = subscribeToKolamTopics;
window.publish = publish;
window.flushPublishQueue = flushPublishQueue;
window.initMQTT = initMQTT;