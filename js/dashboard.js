/**
 * HYNA STUDIO WORKSPACE - DASHBOARD OVERVIEW CONTROLLER
 */

class DashboardController {
  constructor() {
    this.storage = window.storageService;
    this.auth = window.authService;
  }

  renderDashboardView(container) {
    const user = this.auth.getCurrentUser();
    const modules = this.storage.getModules();
    const tasks = this.storage.getTasks();
    const notifications = this.storage.getNotifications();
    const attendance = this.storage.getAttendance();

    // Compute Active / Next Action Module (Prioritize newly assigned 0% modules)
    const activeModule = modules.find(m => m.status === 'Assigned') || modules.find(m => m.status === 'In Progress') || modules.find(m => m.status === 'Submitted') || (modules.every(m => m.status === 'Completed') ? null : modules.find(m => m.status !== 'Completed'));
    const completedModulesCount = modules.filter(m => m.status === 'Completed').length;
    const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

    const todayLog = attendance.find(l => l.date === new Date().toISOString().split('T')[0]);
    const isCheckedIn = todayLog && (todayLog.status === 'Checked In' || todayLog.status === 'Present');

    container.innerHTML = `
      <!-- Welcome Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1>Welcome back, ${user.name} 👋</h1>
          <p class="page-subtitle">Hyna Studio Workspace • Role: <strong>${user.role}</strong> (${user.department})</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary btn-sm" onclick="window.appController.navigate('attendance')">
            <i class="fa-solid fa-clock"></i> ${isCheckedIn ? 'Daily Attendance: Checked In' : 'Check In Now'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.appController.navigate('modules')">
            <i class="fa-solid fa-play"></i> Continue Learning
          </button>
        </div>
      </div>

      <!-- 🚀 NEXT ACTION PROMINENT HERO BANNER -->
      <div class="hero-next-action-card">
        <div class="hero-header-badge">
          <i class="fa-solid fa-rocket"></i> 🚀 NEXT ACTION REQUIRED
        </div>
        <div class="hero-content-grid">
          <div>
            <h2 class="hero-title">${activeModule ? activeModule.number + ': ' + activeModule.title : 'All Modules Completed! 🎉'}</h2>
            <p class="hero-description">${activeModule ? activeModule.description : 'Great job! You have completed all assigned learning modules.'}</p>
            <div class="hero-meta-row">
              <div class="hero-meta-item"><i class="fa-regular fa-calendar-check"></i> Deadline: <strong>${activeModule ? activeModule.deadline : 'N/A'}</strong></div>
              <div class="hero-meta-item"><i class="fa-solid fa-user-tie"></i> Lead: <strong>${activeModule ? activeModule.instructor : 'N/A'}</strong></div>
              <div class="hero-meta-item"><i class="fa-solid fa-info-circle"></i> Status: <strong>${activeModule ? activeModule.status : 'All Complete'}</strong></div>
            </div>
            ${activeModule ? `
              <button class="btn btn-primary btn-lg" onclick="window.moduleController.openModuleDetailModal('${activeModule.id}')">
                <i class="fa-solid fa-arrow-right"></i> ${activeModule.status === 'Assigned' ? 'Start Module (0%)' : 'Open & Complete Module'}
              </button>
            ` : `
              <button class="btn btn-secondary btn-lg" onclick="window.appController.navigate('modules')">
                <i class="fa-solid fa-check"></i> View Completed Modules
              </button>
            `}
          </div>

          <div class="hero-action-box">
            <div class="hero-progress-ring-text">${activeModule ? (activeModule.progress || 0) : 100}%</div>
            <span style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">Module Completion</span>
            <div class="progress-bar-container" style="margin-top: 1rem;">
              <div class="progress-bar-fill" style="width: ${activeModule ? (activeModule.progress || 0) : 100}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Statistics Row -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon-blue"><i class="fa-solid fa-graduation-cap"></i></div>
          <div>
            <div class="kpi-value">${completedModulesCount}</div>
            <div class="kpi-label">Modules Completed</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon-teal"><i class="fa-solid fa-spinner"></i></div>
          <div>
            <div class="kpi-value">1</div>
            <div class="kpi-label">Module In Progress</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon-amber"><i class="fa-solid fa-list-check"></i></div>
          <div>
            <div class="kpi-value">${pendingTasksCount}</div>
            <div class="kpi-label">Pending Tasks</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-box kpi-icon-purple"><i class="fa-solid fa-clock"></i></div>
          <div>
            <div class="kpi-value">92%</div>
            <div class="kpi-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      <!-- Dashboard Main Content Grid -->
      <div class="dashboard-grid">
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Active Tasks Widget -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="fa-solid fa-list-check text-primary"></i> Priority Tasks</h3>
              <button class="btn btn-secondary btn-sm" onclick="window.appController.navigate('tasks')">View All</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${tasks.slice(0, 3).map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem; background: var(--bg-main); border-radius: var(--radius-md);">
                  <div>
                    <span class="badge ${t.priority === 'Urgent' ? 'badge-danger' : 'badge-primary'}">${t.priority}</span>
                    <h4 style="font-size: 0.9rem; font-weight: 700; margin-top: 0.2rem;">${t.title}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${t.project} • Due ${t.deadline}</span>
                  </div>
                  <span class="badge ${t.status === 'Completed' ? 'badge-success' : 'badge-neutral'}">${t.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Feed Sidebar -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Quick Attendance Card -->
          <div class="quick-attendance-widget">
            <div>
              <div class="attendance-widget-status">${isCheckedIn ? 'Checked In' : 'Not Checked In'}</div>
              <div class="attendance-widget-time">Today: 4h 32m logged</div>
            </div>
            <button class="btn ${isCheckedIn ? 'btn-danger' : 'btn-success'} btn-sm" onclick="window.appController.navigate('attendance')">
              ${isCheckedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>

          <!-- Notifications Feed Widget -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="fa-solid fa-bell text-primary"></i> Recent Alerts</h3>
              <button class="btn btn-secondary btn-sm" onclick="window.appController.navigate('notifications')">View All</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${notifications.slice(0, 3).map(n => `
                <div class="feed-item">
                  <div class="feed-icon"><i class="fa-solid fa-info"></i></div>
                  <div>
                    <div class="feed-title">${n.title}</div>
                    <div class="feed-time">${n.timestamp}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

window.dashboardController = new DashboardController();
