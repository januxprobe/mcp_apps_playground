/**
 * Dashboard Widget
 *
 * Real-time system metrics with Chart.js visualization
 */

import { App } from "@modelcontextprotocol/ext-apps";

// Initialize the MCP App bridge
const app = new App({
  name: "Dashboard Widget",
  version: "1.0.0",
});

// Connect to the host
app.connect();

// Get DOM elements
const cpuValue = document.getElementById('cpu-value')!;
const cpuLabel = document.getElementById('cpu-label')!;
const memoryValue = document.getElementById('memory-value')!;
const memoryLabel = document.getElementById('memory-label')!;
const uptimeValue = document.getElementById('uptime-value')!;
const uptimeLabel = document.getElementById('uptime-label')!;
const refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const statusDot = document.getElementById('status-dot')!;
const statusText = document.getElementById('status-text')!;

// State
let refreshInterval: ReturnType<typeof setInterval> | null = null;
let isPaused = false;

// Charts
let cpuChart: any = null;
let memoryChart: any = null;

/**
 * Initialize Chart.js charts
 */
function initCharts() {
  // @ts-ignore - Chart.js loaded from CDN
  const Chart = window.Chart;

  // CPU Chart - Line chart showing history
  const cpuCtx = (document.getElementById('cpu-chart') as HTMLCanvasElement).getContext('2d');
  cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'CPU Usage %',
        data: [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: any) => value + '%'
          }
        },
        x: {
          display: true,
        }
      },
      plugins: {
        legend: {
          display: false
        }
      },
      animation: {
        duration: 0 // Disable animation for real-time updates
      }
    }
  });

  // Memory Chart - Doughnut chart showing usage
  const memoryCtx = (document.getElementById('memory-chart') as HTMLCanvasElement).getContext('2d');
  memoryChart = new Chart(memoryCtx, {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Free'],
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#667eea', '#e2e8f0'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

/**
 * Update metric cards and charts with new data
 */
function updateMetrics(data: any) {
  const { metrics, timestamp } = data;

  // Update CPU
  if (metrics.cpu) {
    const cpuUsage = parseFloat(metrics.cpu.usage);
    cpuValue.textContent = `${metrics.cpu.usage}%`;
    cpuLabel.textContent = `${metrics.cpu.cores} cores • ${metrics.cpu.model}`;

    // Update CPU chart
    if (cpuChart) {
      const time = new Date(timestamp).toLocaleTimeString();
      cpuChart.data.labels.push(time);
      cpuChart.data.datasets[0].data.push(cpuUsage);

      // Keep only last 20 data points
      if (cpuChart.data.labels.length > 20) {
        cpuChart.data.labels.shift();
        cpuChart.data.datasets[0].data.shift();
      }

      cpuChart.update('none'); // Update without animation
    }
  }

  // Update Memory
  if (metrics.memory) {
    const memoryPercent = parseFloat(metrics.memory.usagePercent);
    memoryValue.textContent = `${metrics.memory.usagePercent}%`;
    memoryLabel.textContent = `${metrics.memory.used} / ${metrics.memory.total}`;

    // Update Memory chart
    if (memoryChart) {
      memoryChart.data.datasets[0].data = [
        memoryPercent,
        100 - memoryPercent
      ];
      memoryChart.update('none');
    }
  }

  // Update Uptime
  if (metrics.disk) {
    uptimeValue.textContent = metrics.disk.uptimeFormatted || '--';
    uptimeLabel.textContent = 'System uptime';
  }
}

/**
 * Fetch metrics from server
 */
async function fetchMetrics() {
  if (isPaused) return;

  try {
    const result = await app.callServerTool({
      name: 'get_system_metrics',
      arguments: {
        metrics: ['cpu', 'memory', 'disk'],
        refreshInterval: 5000, // 5 seconds
      },
    });

    if (result.structuredContent) {
      updateMetrics(result.structuredContent);
    }
  } catch (error) {
    console.error('Error fetching metrics:', error);
  }
}

/**
 * Start auto-refresh
 */
function startAutoRefresh(interval = 5000) {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(fetchMetrics, interval);
  isPaused = false;
  pauseBtn.textContent = '⏸️ Pause';
  statusDot.classList.remove('paused');
  statusText.textContent = 'Live';
}

/**
 * Pause auto-refresh
 */
function pauseAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }

  isPaused = true;
  pauseBtn.textContent = '▶️ Resume';
  statusDot.classList.add('paused');
  statusText.textContent = 'Paused';
}

// Handle tool result from server (called when LLM triggers the tool)
app.ontoolresult = (result) => {
  console.log('Received tool result:', result);

  if (result.structuredContent) {
    updateMetrics(result.structuredContent);

    // Start auto-refresh with the provided interval
    const interval = result.structuredContent.refreshInterval || 5000;
    startAutoRefresh(interval);
  }
};

// Event listeners
refreshBtn.addEventListener('click', fetchMetrics);

pauseBtn.addEventListener('click', () => {
  if (isPaused) {
    startAutoRefresh();
    fetchMetrics(); // Fetch immediately
  } else {
    pauseAutoRefresh();
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Initialize charts
initCharts();

// Start with initial fetch
fetchMetrics();
startAutoRefresh();

console.log('Dashboard widget initialized');
