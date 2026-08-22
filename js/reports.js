/**
 * HYNA STUDIO WORKSPACE - REPORTS & ANALYTICS CONTROLLER (Chart.js)
 */

class ReportsController {
  constructor() {
    this.storage = window.storageService;
  }

  renderReportsView(container) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Analytics & Reports</h1>
          <p class="page-subtitle">Workspace metrics: module completion velocity, project health, and attendance rates</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.75rem; margin-bottom: 1.75rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-chart-pie text-primary"></i> Module Completion Status</h3>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="chart-module-status"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-chart-line text-primary"></i> Attendance Trend (August)</h3>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="chart-attendance-trend"></canvas>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.75rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-chart-bar text-primary"></i> Task Distribution by Priority</h3>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="chart-task-priority"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-diagram-project text-primary"></i> Project Completion %</h3>
          </div>
          <div style="height: 260px; position: relative;">
            <canvas id="chart-project-progress"></canvas>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => this.initCharts(), 50);
  }

  initCharts() {
    if (typeof Chart === 'undefined') return;

    // 1. Module Status Chart
    const ctxModule = document.getElementById('chart-module-status')?.getContext('2d');
    if (ctxModule) {
      new Chart(ctxModule, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Submitted', 'Assigned/Locked'],
          datasets: [{
            data: [2, 1, 0, 2],
            backgroundColor: ['#10b981', '#2563eb', '#f59e0b', '#cbd5e1']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 2. Attendance Chart
    const ctxAttendance = document.getElementById('chart-attendance-trend')?.getContext('2d');
    if (ctxAttendance) {
      new Chart(ctxAttendance, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [{
            label: 'Attendance Rate %',
            data: [88, 92, 95, 92],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 3. Task Priority Chart
    const ctxTask = document.getElementById('chart-task-priority')?.getContext('2d');
    if (ctxTask) {
      new Chart(ctxTask, {
        type: 'bar',
        data: {
          labels: ['Urgent', 'High', 'Medium', 'Low'],
          datasets: [{
            label: 'Tasks Count',
            data: [1, 2, 2, 0],
            backgroundColor: ['#ef4444', '#f59e0b', '#2563eb', '#94a3b8']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 4. Project Progress Chart
    const ctxProj = document.getElementById('chart-project-progress')?.getContext('2d');
    if (ctxProj) {
      new Chart(ctxProj, {
        type: 'bar',
        data: {
          labels: ['Hyna Workspace', 'Design System', 'Client Portal'],
          datasets: [{
            label: 'Completion %',
            data: [72, 45, 100],
            backgroundColor: '#06b6d4'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
}

window.reportsController = new ReportsController();
