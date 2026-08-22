/**
 * HYNA STUDIO - STANDALONE ADMIN CONTROL PORTAL CONTROLLER
 * Independent System Governance, Role Escalation Matrix, and Compliance Control Center.
 */

class AdminController {
  constructor() {
    this.storage = window.storageService;
    this.auth = window.authService;
    this.currentView = 'overview';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.auth.requireAdminAuth();
      // Check if we are running in standalone admin.html or index.html
      const container = document.getElementById('admin-portal-content') || document.getElementById('app-content');
      if (!container) return;

      this.bindAdminSidebar();
      this.updateAdminProfile();

      const initialHash = window.location.hash.replace('#', '') || 'overview';
      this.navigate(initialHash);

      window.addEventListener('hashchange', () => {
        const route = window.location.hash.replace('#', '') || 'overview';
        this.navigate(route);
      });
    });
  }

  navigate(viewName) {
    this.currentView = viewName;
    const container = document.getElementById('admin-portal-content') || document.getElementById('app-content');
    if (!container) return;

    // Update active nav link
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(item => {
      const link = item.querySelector('a');
      if (link && (link.getAttribute('href') === `#${viewName}` || item.getAttribute('data-admin-route') === viewName)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    switch (viewName) {
      case 'overview':
        this.renderOverviewTab(container);
        break;
      case 'users':
        this.renderUsersTab(container);
        break;
      case 'roles':
        this.renderRolesMatrixTab(container);
        break;
      case 'modules':
        this.renderModulesTab(container);
        break;
      case 'audit':
        this.renderAuditLogsTab(container);
        break;
      case 'config':
        this.renderConfigTab(container);
        break;
      default:
        this.renderOverviewTab(container);
        break;
    }
  }

  bindAdminSidebar() {
    // Sidebar active sync handled in navigate
  }

  updateAdminProfile() {
    const user = this.auth.getCurrentUser();
    const avatarEl = document.getElementById('admin-user-avatar');
    const nameEl = document.getElementById('admin-user-name');
    const roleEl = document.getElementById('admin-user-role');

    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    if (nameEl) nameEl.innerText = user.name;
    if (roleEl) roleEl.innerText = `${user.empId || 'EMP'} • ${user.role}`;
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
    setTimeout(() => toast.remove(), 4000);
  }

  // --- VIEW 1: OVERVIEW & SYSTEM KPIS ---
  renderOverviewTab(container) {
    const user = this.auth.getCurrentUser();
    const users = this.storage.getUsers();
    const modules = this.storage.getModules();
    const auditLogs = this.storage.getAuditLogs();
    const settings = this.storage.getAdminSettings();

    const activeUsers = users.filter(u => u.status === 'Active').length;
    const managers = users.filter(u => ['Manager', 'Director', 'CEO', 'Project Management Lead'].includes(u.role)).length;

    container.innerHTML = `
      <div class="admin-header-banner">
        <div class="admin-banner-top">
          <div class="admin-banner-title">
            <span class="admin-title-badge">
              <i class="fa-solid fa-shield-halved"></i> Privilege Level: ${user.role}
            </span>
            <h1>
              <i class="fa-solid fa-user-shield text-danger"></i> Administration Control Portal
            </h1>
            <p class="admin-banner-subtitle">
              System Governance • Employee Role Matrix • Security & Audit Compliance
            </p>
          </div>

          <div class="admin-status-pills">
            <div class="admin-status-pill status-active">
              <i class="fa-solid fa-signal"></i> System Health: 99.9%
            </div>
            <div class="admin-status-pill">
              <i class="fa-solid fa-lock"></i> Security Policy: Enforced
            </div>
            <button class="btn btn-primary" id="btn-admin-add-user">
              <i class="fa-solid fa-user-plus"></i> Add Employee
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background: rgba(37, 99, 235, 0.2); color: #3b82f6;">
            <i class="fa-solid fa-users"></i>
          </div>
          <div class="admin-kpi-info">
            <div class="kpi-label">Total Registered Staff</div>
            <div class="kpi-value">${users.length} <span style="font-size:0.8rem; color:#22c55e;">(${activeUsers} Active)</span></div>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">
            <i class="fa-solid fa-user-shield"></i>
          </div>
          <div class="admin-kpi-info">
            <div class="kpi-label">Managers & Directors</div>
            <div class="kpi-value">${managers}</div>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee;">
            <i class="fa-solid fa-book-open"></i>
          </div>
          <div class="admin-kpi-info">
            <div class="kpi-label">Workspace Modules</div>
            <div class="kpi-value">${modules.length}</div>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="admin-kpi-icon" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <div class="admin-kpi-info">
            <div class="kpi-label">Audit Log History</div>
            <div class="kpi-value">${auditLogs.length}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-2" style="gap: 1.5rem;">
        <!-- Employee Role Distribution -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-sitemap text-primary"></i> Staff Roster & Assigned Privileges</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem;">
            ${users.map(u => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div class="user-cell">
                  <img src="${u.avatar}" alt="${u.name}" class="user-avatar-sm">
                  <div>
                    <div style="font-weight:700; color:#fff;">${u.name}</div>
                    <div style="font-size:0.75rem; color:#94a3b8;">${u.department} • ${u.email}</div>
                  </div>
                </div>
                <span class="role-badge ${this.getRoleBadgeClass(u.role)}">${u.role}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Security Audit Trail -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-bolt text-danger"></i> Recent Security Audit Trail</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${auditLogs.slice(0, 5).map(log => `
              <div class="audit-log-item">
                <div class="audit-info">
                  <div class="audit-icon"><i class="fa-solid fa-shield"></i></div>
                  <div>
                    <div style="font-weight:700; font-size:0.88rem; color:#fff;">${log.action}</div>
                    <div style="font-size:0.78rem; color:#94a3b8;">${log.target} • ${log.user}</div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span class="badge badge-success" style="font-size:0.7rem;">${log.status}</span>
                  <div style="font-size:0.75rem; color:#64748b; margin-top:0.2rem;">${log.timestamp}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div id="admin-modal-container"></div>
    `;

    container.querySelector('#btn-admin-add-user')?.addEventListener('click', () => {
      this.openAddUserModal();
    });
  }

  // --- VIEW 2: USER & ROLE DIRECTORY ---
  renderUsersTab(container) {
    const users = this.storage.getUsers();

    container.innerHTML = `
      <div class="admin-table-container">
        <div class="admin-table-header">
          <div>
            <h3 style="margin:0; font-size:1.15rem; color:#fff; font-weight:800;">
              <i class="fa-solid fa-users-gear text-danger"></i> Employee Directory & Privilege Escalation
            </h3>
            <p style="margin:0.2rem 0 0 0; font-size:0.82rem; color:#94a3b8;">Assign role permissions, promote team members, or suspend account access</p>
          </div>
          <div style="display:flex; gap:0.75rem; align-items:center;">
            <div class="admin-search-box">
              <i class="fa-solid fa-magnifying-glass" style="color:#94a3b8;"></i>
              <input type="text" id="user-table-search" placeholder="Search staff name or email...">
            </div>
            <button class="btn btn-primary" id="btn-add-user-table">
              <i class="fa-solid fa-user-plus"></i> Add Employee
            </button>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="admin-table" id="users-directory-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Login Password</th>
                <th>Department</th>
                <th>Current Role</th>
                <th>Account Status</th>
                <th>Privilege Level Select</th>
                <th>Governance Action</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr data-user-id="${u.id}">
                  <td>
                    <div class="user-cell">
                      <img src="${u.avatar}" alt="${u.name}" class="user-avatar-sm">
                      <div class="user-details">
                        <div class="user-name">${u.name}</div>
                        <div class="user-email">${u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style="font-weight:700; color:#38bdf8; font-family:monospace;">${u.empId || 'EMP-001'}</span>
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <input type="text" class="form-control user-password-input" value="${u.password || 'admin123'}" style="padding:0.3rem 0.5rem; font-size:0.8rem; width:100px; font-family:monospace;">
                      <button class="btn btn-secondary btn-sm btn-save-password" title="Save Password" style="padding:0.3rem 0.5rem;">
                        <i class="fa-solid fa-floppy-disk text-success"></i>
                      </button>
                    </div>
                  </td>
                  <td><span style="font-weight:600; color:#e2e8f0;">${u.department}</span></td>
                  <td>
                    <span class="role-badge ${this.getRoleBadgeClass(u.role)}">${u.role}</span>
                  </td>
                  <td>
                    <span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}">
                      ${u.status}
                    </span>
                  </td>
                  <td>
                    <select class="form-control user-role-select" style="padding:0.35rem 0.6rem; font-size:0.82rem; min-width:160px;">
                      <option value="Team Member" ${u.role === 'Team Member' ? 'selected' : ''}>Team Member</option>
                      <option value="Manager" ${u.role === 'Manager' ? 'selected' : ''}>Manager</option>
                      <option value="Project Management Lead" ${u.role === 'Project Management Lead' ? 'selected' : ''}>PM Lead</option>
                      <option value="Director" ${u.role === 'Director' ? 'selected' : ''}>Director</option>
                      <option value="CEO" ${u.role === 'CEO' ? 'selected' : ''}>CEO / Super Admin</option>
                    </select>
                  </td>
                  <td style="display:flex; gap:0.4rem; align-items:center;">
                    <button class="btn btn-sm btn-secondary btn-edit-user" title="Edit Profile Details">
                      <i class="fa-solid fa-pen text-primary"></i> Edit
                    </button>
                    <button class="btn btn-sm ${u.status === 'Active' ? 'btn-secondary' : 'btn-primary'} btn-toggle-status" title="Toggle Access">
                      <i class="fa-solid ${u.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}"></i> ${u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete-user" title="Delete Employee">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="admin-modal-container"></div>
    `;

    // Search filter
    container.querySelector('#user-table-search')?.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      container.querySelectorAll('#users-directory-table tbody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
      });
    });

    // Save Password Event Listener
    container.querySelectorAll('.btn-save-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const userId = row.getAttribute('data-user-id');
        const newPass = row.querySelector('.user-password-input').value.trim();
        if (!newPass) {
          this.showToast('Password cannot be empty!', 'error');
          return;
        }
        this.storage.updateUserPassword(userId, newPass);
        this.showToast(`Password updated for user!`, 'success');
      });
    });

    // Edit User Event Listener
    container.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.closest('tr').getAttribute('data-user-id');
        this.openEditUserModal(userId);
      });
    });

    // Delete User Event Listener
    container.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const userId = row.getAttribute('data-user-id');
        const user = users.find(u => u.id === userId);
        if (user && confirm(`Are you sure you want to delete employee "${user.name}" (${user.empId || 'EMP'}) from the system roster?`)) {
          this.storage.deleteUser(userId);
          this.showToast(`Deleted employee ${user.name}`, 'info');
          this.renderUsersTab(container);
        }
      });
    });

    // Role Escalation Dropdown Change
    container.querySelectorAll('.user-role-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const userId = e.target.closest('tr').getAttribute('data-user-id');
        const newRole = e.target.value;
        this.storage.updateUserRole(userId, newRole);
        this.showToast(`Role updated to "${newRole}"`, 'success');
        this.renderUsersTab(container);
      });
    });

    // Account Status Toggle
    container.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.closest('tr').getAttribute('data-user-id');
        this.storage.toggleUserStatus(userId);
        this.showToast('Account status updated!', 'info');
        this.renderUsersTab(container);
      });
    });

    container.querySelector('#btn-add-user-table')?.addEventListener('click', () => {
      this.openAddUserModal();
    });
  }

  // --- VIEW 3: PERMISSIONS MATRIX ---
  renderRolesMatrixTab(container) {
    const capabilities = [
      { name: 'View Workspace Dashboard', member: true, manager: true, director: true, ceo: true },
      { name: 'Complete Assigned Modules', member: true, manager: true, director: true, ceo: true },
      { name: 'Approve Module Submissions', member: false, manager: true, director: true, ceo: true },
      { name: 'Create & Assign Projects', member: false, manager: true, director: true, ceo: true },
      { name: 'Escalate User Privilege Roles', member: false, manager: false, director: true, ceo: true },
      { name: 'System Security & Maintenance Mode', member: false, manager: false, director: false, ceo: true },
      { name: 'Access Full Compliance Audit Logs', member: false, manager: false, director: true, ceo: true }
    ];

    container.innerHTML = `
      <div class="admin-table-container">
        <div class="admin-table-header">
          <h3 style="margin:0; font-size:1.15rem; color:#fff; font-weight:800;">
            <i class="fa-solid fa-user-shield text-danger"></i> Role-Based Access Control (RBAC) Permissions Matrix
          </h3>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>System Capability / Feature</th>
              <th style="text-align:center;">Team Member</th>
              <th style="text-align:center;">Manager</th>
              <th style="text-align:center;">Director</th>
              <th style="text-align:center;">CEO / Super Admin</th>
            </tr>
          </thead>
          <tbody>
            ${capabilities.map(c => `
              <tr>
                <td><strong style="color:#fff;">${c.name}</strong></td>
                <td style="text-align:center;">${c.member ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-muted"></i>'}</td>
                <td style="text-align:center;">${c.manager ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-muted"></i>'}</td>
                <td style="text-align:center;">${c.director ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-muted"></i>'}</td>
                <td style="text-align:center;">${c.ceo ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-muted"></i>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- VIEW 4: MODULE PUBLISHING ---
  renderModulesTab(container) {
    const modules = this.storage.getModules();

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i class="fa-solid fa-book-open text-primary"></i> Global Module Publishing Governance</h3>
          <button class="btn btn-secondary btn-sm" id="btn-unlock-all-modules">
            <i class="fa-solid fa-lock-open"></i> Unlock All Modules
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">
          ${modules.map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem; background:rgba(15,23,42,0.6); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
              <div>
                <div style="font-weight:700; color:#fff; font-size:1.05rem;">${m.number}: ${m.title}</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">${m.description}</div>
              </div>
              <div style="display:flex; align-items:center; gap:1rem;">
                <span class="badge ${m.unlocked ? 'badge-success' : 'badge-danger'}">
                  ${m.unlocked ? 'Published & Unlocked' : 'Locked'}
                </span>
                <button class="btn btn-sm ${m.unlocked ? 'btn-secondary' : 'btn-primary'} btn-toggle-module" data-module-id="${m.id}">
                  ${m.unlocked ? 'Lock' : 'Publish / Unlock'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-toggle-module').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modId = e.currentTarget.getAttribute('data-module-id');
        const modules = this.storage.getModules();
        const mod = modules.find(m => m.id === modId);
        if (mod) {
          mod.unlocked = !mod.unlocked;
          localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
          this.showToast(`Updated ${mod.number} status!`, 'info');
          this.renderModulesTab(container);
        }
      });
    });

    container.querySelector('#btn-unlock-all-modules')?.addEventListener('click', () => {
      const modules = this.storage.getModules();
      modules.forEach(m => m.unlocked = true);
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
      this.showToast('All workspace modules unlocked!', 'success');
      this.renderModulesTab(container);
    });
  }

  // --- VIEW 5: AUDIT LOGS ---
  renderAuditLogsTab(container) {
    const logs = this.storage.getAuditLogs();

    container.innerHTML = `
      <div class="admin-table-container">
        <div class="admin-table-header">
          <h3 style="margin:0; font-size:1.15rem; color:#fff; font-weight:800;">
            <i class="fa-solid fa-list-check text-danger"></i> System Security & Compliance Audit Log
          </h3>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Action Executed</th>
              <th>Target Entity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td><span style="font-size:0.82rem; color:#94a3b8; font-weight:600;">${log.timestamp}</span></td>
                <td><strong style="color:#ffffff;">${log.user}</strong></td>
                <td><span style="color:#38bdf8; font-weight:600;">${log.action}</span></td>
                <td><span style="color:#cbd5e1;">${log.target}</span></td>
                <td><span class="badge badge-success">${log.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- VIEW 6: CONFIG ---
  renderConfigTab(container) {
    const settings = this.storage.getAdminSettings();

    container.innerHTML = `
      <div class="card" style="max-width:700px;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-sliders text-danger"></i> System Governance Configuration</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:1.5rem; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; color:#fff;">System Maintenance Mode</div>
              <div style="font-size:0.8rem; color:#94a3b8;">Block non-admin access during core updates</div>
            </div>
            <button class="btn ${settings.maintenanceMode ? 'btn-danger' : 'btn-secondary'}" id="cfg-maint-toggle">
              ${settings.maintenanceMode ? '<i class="fa-solid fa-toggle-on"></i> ENABLED' : '<i class="fa-solid fa-toggle-off"></i> DISABLED'}
            </button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; color:#fff;">Automatic Module Progression</div>
              <div style="font-size:0.8rem; color:#94a3b8;">Automatically unlock subsequent modules upon approval</div>
            </div>
            <button class="btn btn-secondary">
              <i class="fa-solid fa-toggle-on text-primary"></i> Enabled
            </button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; color:#fff;">Mandatory 2FA Policy</div>
              <div style="font-size:0.8rem; color:#94a3b8;">Enforce 2FA security for Directors and Executives</div>
            </div>
            <button class="btn btn-secondary">
              <i class="fa-solid fa-check text-success"></i> Enforced
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#cfg-maint-toggle')?.addEventListener('click', () => {
      const current = settings.maintenanceMode;
      this.storage.updateAdminSettings({ maintenanceMode: !current });
      this.showToast(`Maintenance mode ${!current ? 'ENABLED' : 'DISABLED'}`, 'info');
      this.renderConfigTab(container);
    });
  }

  // --- ADD USER MODAL WITH IMAGE OPTION ---
  openAddUserModal() {
    const modalContainer = document.getElementById('admin-modal-container');
    if (!modalContainer) return;

    const avatarPresets = [
      { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
      { label: 'Female Manager', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
      { label: 'Engineer Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { label: 'PM Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { label: 'Director Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
    ];

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width:560px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <h3 style="margin:0; color:#fff; font-weight:800; font-size:1.2rem;">
              <i class="fa-solid fa-user-plus text-primary"></i> Add Employee to Hyna System
            </h3>
            <button class="btn btn-secondary btn-sm" id="close-modal-btn">&times;</button>
          </div>

          <form id="add-user-form">
            <div class="grid grid-2" style="gap:1rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Employee ID</label>
                <input type="text" class="form-control" id="new-user-empid" placeholder="e.g. EMP-002" required>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Login Password</label>
                <input type="text" class="form-control" id="new-user-password" placeholder="Set password (e.g. user123)" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Full Name</label>
              <input type="text" class="form-control" id="new-user-name" placeholder="e.g. Jordan Miller" required>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Corporate Email</label>
              <input type="email" class="form-control" id="new-user-email" placeholder="jordan.m@hyna.studio" required>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;"><i class="fa-solid fa-image text-success"></i> Profile Photo / Avatar Image URL</label>
              <input type="url" class="form-control" id="new-user-avatar" value="${avatarPresets[0].url}" placeholder="https://example.com/avatar.jpg">
              <div style="display:flex; gap:0.5rem; margin-top:0.5rem; align-items:center;">
                <span style="font-size:0.75rem; color:#94a3b8;">Click preset photo:</span>
                ${avatarPresets.map((p, i) => `
                  <img src="${p.url}" title="${p.label}" class="avatar-preset-btn" style="width:32px; height:32px; border-radius:50%; cursor:pointer; border:2px solid transparent;" data-url="${p.url}">
                `).join('')}
              </div>
            </div>

            <div class="grid grid-2" style="gap:1rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Department</label>
                <select class="form-control" id="new-user-dept">
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Assigned Role Level</label>
                <select class="form-control" id="new-user-role">
                  <option value="Team Member">Team Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Project Management Lead">PM Lead</option>
                  <option value="Director">Director</option>
                  <option value="CEO">CEO / Super Admin</option>
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-secondary" id="cancel-modal-btn">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Add Employee</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#close-modal-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-modal-btn')?.addEventListener('click', closeModal);

    // Preset selection
    modalContainer.querySelectorAll('.avatar-preset-btn').forEach(img => {
      img.addEventListener('click', (e) => {
        modalContainer.querySelector('#new-user-avatar').value = e.target.getAttribute('data-url');
        this.showToast('Selected avatar photo preset', 'info');
      });
    });

    modalContainer.querySelector('#add-user-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = modalContainer.querySelector('#new-user-empid').value.trim();
      const password = modalContainer.querySelector('#new-user-password').value.trim();
      const name = modalContainer.querySelector('#new-user-name').value.trim();
      const email = modalContainer.querySelector('#new-user-email').value.trim();
      const avatar = modalContainer.querySelector('#new-user-avatar').value.trim();
      const dept = modalContainer.querySelector('#new-user-dept').value;
      const role = modalContainer.querySelector('#new-user-role').value;

      this.storage.addUser({ empId, password, name, email, avatar, department: dept, role });
      this.showToast(`Created employee ${name} (${empId})`, 'success');
      closeModal();
      const container = document.getElementById('admin-portal-content') || document.getElementById('app-content');
      if (container) this.navigate(this.currentView);
    });
  }

  // --- EDIT USER MODAL ---
  openEditUserModal(userId) {
    const modalContainer = document.getElementById('admin-modal-container');
    if (!modalContainer) return;

    const users = this.storage.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const avatarPresets = [
      { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
      { label: 'Female Manager', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
      { label: 'Engineer Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { label: 'PM Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { label: 'Director Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
    ];

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width:560px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <h3 style="margin:0; color:#fff; font-weight:800; font-size:1.2rem;">
              <i class="fa-solid fa-pen text-primary"></i> Edit Employee Profile: ${user.name}
            </h3>
            <button class="btn btn-secondary btn-sm" id="close-modal-btn">&times;</button>
          </div>

          <form id="edit-user-form">
            <div class="grid grid-2" style="gap:1rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Employee ID</label>
                <input type="text" class="form-control" id="edit-user-empid" value="${user.empId || 'EMP-001'}" required>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Login Password</label>
                <input type="text" class="form-control" id="edit-user-password" value="${user.password || 'user123'}" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Full Name</label>
              <input type="text" class="form-control" id="edit-user-name" value="${user.name}" required>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Corporate Email</label>
              <input type="email" class="form-control" id="edit-user-email" value="${user.email}" required>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;"><i class="fa-solid fa-image text-success"></i> Profile Photo / Avatar Image URL</label>
              <input type="url" class="form-control" id="edit-user-avatar" value="${user.avatar || avatarPresets[0].url}">
              <div style="display:flex; gap:0.5rem; margin-top:0.5rem; align-items:center;">
                <span style="font-size:0.75rem; color:#94a3b8;">Click preset photo:</span>
                ${avatarPresets.map((p, i) => `
                  <img src="${p.url}" title="${p.label}" class="avatar-preset-btn" style="width:32px; height:32px; border-radius:50%; cursor:pointer; border:2px solid transparent;" data-url="${p.url}">
                `).join('')}
              </div>
            </div>

            <div class="grid grid-2" style="gap:1rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Department</label>
                <select class="form-control" id="edit-user-dept">
                  <option value="Engineering" ${user.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                  <option value="Product" ${user.department === 'Product' ? 'selected' : ''}>Product</option>
                  <option value="Design" ${user.department === 'Design' ? 'selected' : ''}>Design</option>
                  <option value="Operations" ${user.department === 'Operations' ? 'selected' : ''}>Operations</option>
                  <option value="Executive" ${user.department === 'Executive' ? 'selected' : ''}>Executive</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;">Assigned Role Level</label>
                <select class="form-control" id="edit-user-role">
                  <option value="Team Member" ${user.role === 'Team Member' ? 'selected' : ''}>Team Member</option>
                  <option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option>
                  <option value="Project Management Lead" ${user.role === 'Project Management Lead' ? 'selected' : ''}>PM Lead</option>
                  <option value="Director" ${user.role === 'Director' ? 'selected' : ''}>Director</option>
                  <option value="CEO" ${user.role === 'CEO' ? 'selected' : ''}>CEO / Super Admin</option>
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-secondary" id="cancel-modal-btn">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Profile Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#close-modal-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-modal-btn')?.addEventListener('click', closeModal);

    // Preset selection
    modalContainer.querySelectorAll('.avatar-preset-btn').forEach(img => {
      img.addEventListener('click', (e) => {
        modalContainer.querySelector('#edit-user-avatar').value = e.target.getAttribute('data-url');
        this.showToast('Selected avatar photo preset', 'info');
      });
    });

    modalContainer.querySelector('#edit-user-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = modalContainer.querySelector('#edit-user-empid').value.trim();
      const password = modalContainer.querySelector('#edit-user-password').value.trim();
      const name = modalContainer.querySelector('#edit-user-name').value.trim();
      const email = modalContainer.querySelector('#edit-user-email').value.trim();
      const avatar = modalContainer.querySelector('#edit-user-avatar').value.trim();
      const dept = modalContainer.querySelector('#edit-user-dept').value;
      const role = modalContainer.querySelector('#edit-user-role').value;

      this.storage.updateUser(userId, { empId, password, name, email, avatar, department: dept, role });
      this.showToast(`Updated employee ${name}`, 'success');
      closeModal();
      const container = document.getElementById('admin-portal-content') || document.getElementById('app-content');
      if (container) this.navigate(this.currentView);
    });
  }

  getRoleBadgeClass(role) {
    switch (role) {
      case 'CEO': return 'role-ceo';
      case 'Director': return 'role-director';
      case 'Manager': return 'role-manager';
      case 'Project Management Lead': return 'role-pm';
      default: return 'role-member';
    }
  }
}

window.adminController = new AdminController();
