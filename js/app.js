/**
 * HYNA STUDIO WORKSPACE - MAIN APPLICATION CONTROLLER
 * SPA View Router & Global App Shell Sync
 */

class AppController {
  constructor() {
    this.storage = window.storageService;
    this.auth = window.authService;
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindSidebar();
      this.updateUserProfile();
      this.updateNotificationBadge();
      
      // Hash-based routing initial check
      const initialHash = window.location.hash.replace('#', '');
      if (initialHash) {
        this.navigate(initialHash);
      } else {
        this.navigate('dashboard');
      }

      window.addEventListener('hashchange', () => {
        const route = window.location.hash.replace('#', '');
        if (route) this.navigate(route);
      });
    });
  }

  navigate(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Update Sidebar Navigation Active States
    document.querySelectorAll('.nav-item').forEach(item => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('href') === `#${viewName}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    // Route view rendering
    switch (viewName) {
      case 'dashboard':
        window.dashboardController?.renderDashboardView(appContent);
        break;
      case 'modules':
        window.moduleController?.renderModulesView(appContent);
        break;
      case 'tasks':
        window.taskController?.renderTasksView(appContent);
        break;
      case 'projects':
        window.projectController?.renderProjectsView(appContent);
        break;
      case 'team':
        window.teamController?.renderTeamView(appContent);
        break;
      case 'attendance':
        window.attendanceController?.renderAttendanceView(appContent);
        break;
      case 'notifications':
        window.notificationController?.renderNotificationsView(appContent);
        break;
      case 'calendar':
        window.calendarController?.renderCalendarView(appContent);
        break;
      case 'documents':
        window.documentController?.renderDocumentsView(appContent);
        break;
      case 'communication':
        window.communicationController?.renderCommunicationView(appContent);
        break;
      case 'reports':
        window.reportsController?.renderReportsView(appContent);
        break;
      case 'settings':
        this.renderSettingsView(appContent);
        break;
      case 'admin':
        window.adminController?.renderAdminView(appContent);
        break;
      default:
        window.dashboardController?.renderDashboardView(appContent);
        break;
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  bindSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('mobile-menu-btn');
    
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }

  updateUserProfile() {
    const user = this.auth.getCurrentUser();
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');

    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    if (nameEl) nameEl.innerText = user.name;
    if (roleEl) roleEl.innerText = `${user.empId || 'EMP'} • ${user.role}`;
  }

  updateNotificationBadge() {
    const notifications = this.storage.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badgeEl = document.getElementById('notif-badge-count');
    if (badgeEl) {
      badgeEl.innerText = unreadCount;
      badgeEl.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  }

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  renderSettingsView(container) {
    const user = this.auth.getCurrentUser();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Workspace Settings</h1>
          <p class="page-subtitle">Manage profile preferences, account details, and system data</p>
        </div>
      </div>

      <div class="card" style="max-width: 600px; margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-user-gear text-primary"></i> Authenticated Employee Profile</h3>
        </div>
        <div class="form-group">
          <label class="form-label">Employee ID</label>
          <input type="text" class="form-control" value="${user.empId || 'EMP-001'}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Employee Name</label>
          <input type="text" class="form-control" value="${user.name}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Role Level</label>
          <input type="text" class="form-control" value="${user.role}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Department</label>
          <input type="text" class="form-control" value="${user.department}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Corporate Email</label>
          <input type="text" class="form-control" value="${user.email}" readonly>
        </div>
      </div>

      <div class="card" style="max-width: 600px;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-database text-danger"></i> System Data Reset</h3>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Reset workspace localStorage back to clean default seed data.</p>
        <button class="btn btn-danger" id="reset-data-btn">
          <i class="fa-solid fa-rotate-left"></i> Reset System Data
        </button>
      </div>
    `;

    container.querySelector('#reset-data-btn')?.addEventListener('click', () => {
      localStorage.clear();
      this.showToast('Workspace data reset! Reloading page...', 'info');
      setTimeout(() => window.location.reload(), 1000);
    });
  }
}

window.appController = new AppController();
