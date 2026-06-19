// Global configuration and shared state
window.AppConfig = {
    brokerUrl: 'wss://broker.emqx.io:8084/mqtt',
    publishOptions: { qos: 1, retain: true },
    kolamCount: 2,
    topicPrefix: 'tes/78220/topic/',
    maxChartDataPoints: 20,
    chartUpdateDebounce: 500,
    mqttReconnectPeriod: 2000,
    mqttConnectTimeout: 30000
};

// Shared state (used across modules)
window.AppState = {
    combinedCharts: {},
    chartUpdateQueue: {},
    publishQueue: [],
    mqttClient: null
};