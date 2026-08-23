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
      this.auth.requireAuth();
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
    const avatarPresets = [
      { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
      { label: 'Female Manager', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
      { label: 'Engineer Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { label: 'PM Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { label: 'Director Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
    ];

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Workspace Settings</h1>
          <p class="page-subtitle">Manage profile preferences, account details, and system data</p>
        </div>
      </div>

      <div class="card" style="max-width: 650px; margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-user-gear text-primary"></i> Authenticated Employee Profile</h3>
        </div>

        <form id="user-profile-form">
          <div style="display:flex; gap:1.25rem; align-items:center; margin-bottom:1.5rem; background:rgba(255,255,255,0.03); padding:1rem; border-radius:var(--radius-md);">
            <img src="${user.avatar || avatarPresets[0].url}" alt="${user.name}" id="setting-avatar-preview" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-light);">
            <div style="flex:1;">
              <h4 style="margin:0 0 0.25rem 0; font-size:1.1rem; font-weight:700;">${user.name}</h4>
              <p style="margin:0 0 0.5rem 0; font-size:0.85rem; color:var(--text-muted);">${user.department} &bull; ${user.role}</p>
              <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-setting-browse-file">
                  <i class="fa-solid fa-folder-open text-primary"></i> Upload PC Photo
                </button>
                <input type="file" id="setting-user-file-input" accept="image/*" style="display:none;">
                <span style="font-size:0.75rem; color:var(--text-muted);">Presets:</span>
                ${avatarPresets.map(p => `
                  <img src="${p.url}" title="${p.label}" class="setting-avatar-preset" style="width:28px; height:28px; border-radius:50%; cursor:pointer;" data-url="${p.url}">
                `).join('')}
              </div>
            </div>
          </div>

          <input type="hidden" id="setting-user-avatar" value="${user.avatar || avatarPresets[0].url}">

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Employee ID (System Assigned)</label>
              <input type="text" class="form-control" value="${user.empId || 'EMP-001'}" readonly style="opacity:0.75; cursor:not-allowed;">
            </div>
            <div class="form-group">
              <label class="form-label">Role Level (Assigned)</label>
              <input type="text" class="form-control" value="${user.role}" readonly style="opacity:0.75; cursor:not-allowed;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Full Employee Name</label>
            <input type="text" class="form-control" id="setting-user-name" value="${user.name}" required>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Corporate Email Address</label>
            <input type="email" class="form-control" id="setting-user-email" value="${user.email}" required>
          </div>

          <div class="form-group" style="margin-bottom:1.5rem;">
            <label class="form-label">Login Security Password</label>
            <input type="text" class="form-control" id="setting-user-password" value="${user.password || 'user123'}" required>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary" id="btn-save-profile">
              <i class="fa-solid fa-floppy-disk"></i> Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      <div class="card" style="max-width: 650px;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-database text-danger"></i> System Data Reset</h3>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Reset workspace localStorage back to clean default seed data.</p>
        <button class="btn btn-danger" id="reset-data-btn">
          <i class="fa-solid fa-rotate-left"></i> Reset System Data
        </button>
      </div>
    `;

    // File input avatar picker handler
    const fileInput = container.querySelector('#setting-user-file-input');
    const browseBtn = container.querySelector('#btn-setting-browse-file');
    const avatarHiddenInput = container.querySelector('#setting-user-avatar');
    const avatarPreview = container.querySelector('#setting-avatar-preview');

    browseBtn?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          this.showToast(`Optimizing photo "${file.name}"...`, 'info');
          const dataUrl = await window.compressImageFile(file, 250, 250, 0.85);
          avatarHiddenInput.value = dataUrl;
          if (avatarPreview) avatarPreview.src = dataUrl;
          this.showToast(`Uploaded photo "${file.name}"! Click "Save Profile Changes" to save.`, 'success');
        } catch (err) {
          console.error("Image compression error:", err);
          const reader = new FileReader();
          reader.onload = (evt) => {
            avatarHiddenInput.value = evt.target.result;
            if (avatarPreview) avatarPreview.src = evt.target.result;
            this.showToast(`Uploaded photo "${file.name}"`, 'success');
          };
          reader.readAsDataURL(file);
        }
      }
    });

    // Preset avatar click handler
    container.querySelectorAll('.setting-avatar-preset').forEach(img => {
      img.addEventListener('click', (e) => {
        const url = e.target.getAttribute('data-url');
        avatarHiddenInput.value = url;
        if (avatarPreview) avatarPreview.src = url;
        this.showToast('Selected avatar photo preset', 'info');
      });
    });

    // Form submit - Save Profile Changes
    container.querySelector('#user-profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#setting-user-name').value.trim();
      const email = container.querySelector('#setting-user-email').value.trim();
      const password = container.querySelector('#setting-user-password').value.trim();
      const avatar = avatarHiddenInput.value.trim();

      if (!name || !email || !password) {
        this.showToast('Name, Email, and Password cannot be empty.', 'error');
        return;
      }

      this.storage.updateUser(user.id, { name, email, password, avatar });
      this.updateUserProfile();
      this.showToast('Profile changes saved successfully!', 'success');
    });

    container.querySelector('#reset-data-btn')?.addEventListener('click', () => {
      localStorage.clear();
      this.showToast('Workspace data reset! Reloading page...', 'info');
      setTimeout(() => window.location.reload(), 1000);
    });
  }
}

window.appController = new AppController();
