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

      // Global event delegation for Add Employee button
      document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('#btn-add-user-table, #btn-admin-add-user, .btn-open-add-user');
        if (addBtn) {
          e.preventDefault();
          this.openAddUserModal();
        }
      });

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
      case 'task-distribution':
        this.renderTaskDistributionTab(container);
        break;
      case 'module-distribution':
        this.renderModuleDistributionTab(container);
        break;
      case 'project-distribution':
        this.renderProjectDistributionTab(container);
        break;
      case 'project-leads':
        this.renderProjectLeadsTab(container);
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
    const managers = users.filter(u => ['Manager', 'Director', 'CEO', 'Project Management Lead', 'CTO', 'COO', 'CPO', 'CMO', 'VP of Product', 'IT Team'].includes(u.role)).length;

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
                        <div style="display:flex; align-items:center; gap:0.3rem;">
                          <input type="text" class="form-control user-name-input" value="${u.name}" style="padding:0.2rem 0.4rem; font-size:0.85rem; font-weight:700; width:160px; color:#fff;">
                          <button class="btn btn-secondary btn-sm btn-save-name" title="Save Employee Name" style="padding:0.2rem 0.4rem;">
                            <i class="fa-solid fa-floppy-disk text-success"></i>
                          </button>
                        </div>
                        <div style="display:flex; align-items:center; gap:0.3rem; margin-top:0.25rem;">
                          <input type="email" class="form-control user-email-input" value="${u.email}" style="padding:0.2rem 0.4rem; font-size:0.75rem; width:160px;">
                          <button class="btn btn-secondary btn-sm btn-save-email" title="Save Gmail / Email" style="padding:0.2rem 0.4rem;">
                            <i class="fa-solid fa-floppy-disk text-primary"></i>
                          </button>
                        </div>
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
                      <option value="IT Team" ${u.role === 'IT Team' ? 'selected' : ''}>IT Team</option>
                      <option value="Project Management Lead" ${u.role === 'Project Management Lead' ? 'selected' : ''}>PM Lead</option>
                      <option value="VP of Product" ${u.role === 'VP of Product' ? 'selected' : ''}>VP of Product</option>
                      <option value="Director" ${u.role === 'Director' ? 'selected' : ''}>Director</option>
                      <option value="CMO" ${u.role === 'CMO' ? 'selected' : ''}>CMO</option>
                      <option value="CPO" ${u.role === 'CPO' ? 'selected' : ''}>CPO</option>
                      <option value="COO" ${u.role === 'COO' ? 'selected' : ''}>COO</option>
                      <option value="CTO" ${u.role === 'CTO' ? 'selected' : ''}>CTO</option>
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

    // Save Employee Name Event Listener
    container.querySelectorAll('.btn-save-name').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const userId = row.getAttribute('data-user-id');
        const newName = row.querySelector('.user-name-input').value.trim();
        if (!newName) {
          this.showToast('Employee name cannot be empty!', 'error');
          return;
        }
        this.storage.updateUserName(userId, newName);
        this.showToast(`Name updated to "${newName}"`, 'success');
        this.updateAdminProfile();
        window.appController?.updateUserProfile();
      });
    });

    // Save Gmail / Email Event Listener
    container.querySelectorAll('.btn-save-email').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const userId = row.getAttribute('data-user-id');
        const newEmail = row.querySelector('.user-email-input').value.trim();
        if (!newEmail) {
          this.showToast('Gmail/Email cannot be empty!', 'error');
          return;
        }
        this.storage.updateUserEmail(userId, newEmail);
        this.showToast(`Gmail/Email updated to "${newEmail}"`, 'success');
        this.updateAdminProfile();
        window.appController?.updateUserProfile();
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
        this.updateAdminProfile();
        window.appController?.updateUserProfile();
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
        this.updateAdminProfile();
        window.appController?.updateUserProfile();
        this.renderUsersTab(container);
      });
    });

    // Add Employee Button Listener
    container.querySelector('#btn-add-user-table')?.addEventListener('click', () => {
      this.openAddUserModal();
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
    const submittedMods = modules.filter(m => m.status === 'Submitted');

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i class="fa-solid fa-book-open text-primary"></i> Global Module Publishing Governance</h3>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary btn-sm" id="btn-open-add-module-modal">
              <i class="fa-solid fa-plus"></i> Add New Module
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-unlock-all-modules">
              <i class="fa-solid fa-lock-open"></i> Unlock All Modules
            </button>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">
          ${modules.map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem; background:rgba(15,23,42,0.6); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
              <div>
                <div style="font-weight:700; color:#fff; font-size:1.05rem;">${m.number}: ${m.title}</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">${m.description}</div>
              </div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span class="badge ${m.unlocked ? 'badge-success' : 'badge-danger'}">
                  ${m.unlocked ? 'Published & Unlocked' : 'Locked'}
                </span>
                <button class="btn btn-sm ${m.unlocked ? 'btn-secondary' : 'btn-primary'} btn-toggle-module" data-module-id="${m.id}">
                  ${m.unlocked ? 'Lock' : 'Publish / Unlock'}
                </button>
                <button class="btn btn-sm btn-danger btn-delete-module" data-module-id="${m.id}" title="Delete Module">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Pending Submissions Verification Review Card -->
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-file-signature text-warning"></i> Pending Submissions Verification Screenshots (${submittedMods.length})</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
          ${submittedMods.length === 0 ? `
            <div style="text-align: center; color: #94a3b8; padding: 1.5rem;">
              No pending module submissions for review.
            </div>
          ` : submittedMods.map(m => `
            <div style="padding: 1.25rem; background: rgba(15,23,42,0.8); border-radius: 10px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="badge badge-warning" style="margin-right: 0.5rem;">${m.number}</span>
                  <span style="font-weight: 700; color: #fff; font-size: 1rem;">${m.title}</span>
                </div>
                <button class="btn btn-success btn-sm btn-approve-submission" data-module-id="${m.id}">
                  <i class="fa-solid fa-check-circle"></i> Verify Image & Approve (Unlock Next at 0%)
                </button>
              </div>
              <div style="font-size: 0.85rem; color: #94a3b8;">
                <strong>Employee Summary:</strong> ${m.submissionText || 'No notes provided'}
              </div>
              ${m.submissionImage ? `
                <div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.35rem;">Verification Screenshot Image:</div>
                  <img src="${m.submissionImage}" alt="Verification Screenshot" style="max-width: 320px; max-height: 200px; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)">
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#btn-open-add-module-modal')?.addEventListener('click', () => {
      this.openAddModuleModal(container);
    });

    container.querySelectorAll('.btn-approve-submission').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modId = e.currentTarget.getAttribute('data-module-id');
        this.storage.approveModule(modId);
        this.showToast('Module verified & approved! Next module unlocked starting at 0%.', 'success');
        this.renderModulesTab(container);
      });
    });

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

    container.querySelectorAll('.btn-delete-module').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modId = e.currentTarget.getAttribute('data-module-id');
        if (confirm("Are you sure you want to delete this module?")) {
          const res = this.storage.deleteModule(modId);
          if (res.success) {
            this.showToast('Module deleted successfully!', 'success');
            this.renderModulesTab(container);
          }
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
    let modalContainer = document.getElementById('admin-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'admin-modal-container';
      document.body.appendChild(modalContainer);
    }

    const avatarPresets = [
      { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
      { label: 'Female Manager', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
      { label: 'Engineer Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { label: 'PM Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { label: 'Director Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
    ];

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width:580px;">
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
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;"><i class="fa-solid fa-image text-success"></i> Profile Photo / Avatar Image</label>
              <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center;">
                <input type="text" class="form-control" id="new-user-avatar" value="${avatarPresets[0].url}" placeholder="Paste URL or upload image from PC">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-browse-file" style="white-space:nowrap; padding:0.45rem 0.75rem;">
                  <i class="fa-solid fa-folder-open text-primary"></i> Upload PC Image
                </button>
                <input type="file" id="user-file-input" accept="image/*" style="display:none;">
              </div>
              <div style="display:flex; gap:0.5rem; align-items:center;">
                <span style="font-size:0.75rem; color:#94a3b8;">Presets:</span>
                ${avatarPresets.map(p => `
                  <img src="${p.url}" title="${p.label}" class="avatar-preset-btn" style="width:28px; height:28px; border-radius:50%; cursor:pointer;" data-url="${p.url}">
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
                  <option value="IT Team">IT Team</option>
                  <option value="Project Management Lead">PM Lead</option>
                  <option value="VP of Product">VP of Product</option>
                  <option value="Director">Director</option>
                  <option value="CMO">CMO</option>
                  <option value="CPO">CPO</option>
                  <option value="COO">COO</option>
                  <option value="CTO">CTO</option>
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

    // PC Image Upload File Picker
    const fileInput = modalContainer.querySelector('#user-file-input');
    const browseBtn = modalContainer.querySelector('#btn-browse-file');
    const avatarInput = modalContainer.querySelector('#new-user-avatar');

    browseBtn?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          this.showToast(`Optimizing image "${file.name}"...`, 'info');
          const dataUrl = await window.compressImageFile(file, 250, 250, 0.85);
          avatarInput.value = dataUrl;
          this.showToast(`Uploaded & optimized image "${file.name}" from PC!`, 'success');
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            avatarInput.value = evt.target.result;
            this.showToast(`Uploaded image "${file.name}" from PC!`, 'success');
          };
          reader.readAsDataURL(file);
        }
      }
    });

    // Preset selection
    modalContainer.querySelectorAll('.avatar-preset-btn').forEach(img => {
      img.addEventListener('click', (e) => {
        avatarInput.value = e.target.getAttribute('data-url');
        this.showToast('Selected avatar photo preset', 'info');
      });
    });

    modalContainer.querySelector('#add-user-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = modalContainer.querySelector('#new-user-empid').value.trim();
      const password = modalContainer.querySelector('#new-user-password').value.trim();
      const name = modalContainer.querySelector('#new-user-name').value.trim();
      const email = modalContainer.querySelector('#new-user-email').value.trim();
      const avatar = avatarInput.value.trim();
      const dept = modalContainer.querySelector('#new-user-dept').value;
      const role = modalContainer.querySelector('#new-user-role').value;

      this.storage.addUser({ empId, password, name, email, avatar, department: dept, role });
      this.showToast(`Created employee ${name} (${empId})`, 'success');
      closeModal();
      const container = document.getElementById('admin-portal-content') || document.getElementById('app-content');
      if (container) {
        if (this.currentView === 'users') {
          this.renderUsersTab(container);
        } else {
          this.navigate(this.currentView);
        }
      }
    });
  }

  // --- EDIT USER MODAL WITH IMAGE UPLOAD FROM PC ---
  openEditUserModal(userId) {
    let modalContainer = document.getElementById('admin-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'admin-modal-container';
      document.body.appendChild(modalContainer);
    }

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
        <div class="admin-modal" style="max-width:580px;">
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
              <label class="form-label" style="font-size:0.85rem; color:#cbd5e1;"><i class="fa-solid fa-image text-success"></i> Profile Photo / Avatar Image</label>
              <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center;">
                <input type="text" class="form-control" id="edit-user-avatar" value="${user.avatar || avatarPresets[0].url}">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-browse-file" style="white-space:nowrap; padding:0.45rem 0.75rem;">
                  <i class="fa-solid fa-folder-open text-primary"></i> Upload PC Image
                </button>
                <input type="file" id="edit-user-file-input" accept="image/*" style="display:none;">
              </div>
              <div style="display:flex; gap:0.5rem; align-items:center;">
                <span style="font-size:0.75rem; color:#94a3b8;">Presets:</span>
                ${avatarPresets.map(p => `
                  <img src="${p.url}" title="${p.label}" class="avatar-preset-btn" style="width:28px; height:28px; border-radius:50%; cursor:pointer;" data-url="${p.url}">
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
                  <option value="IT Team" ${user.role === 'IT Team' ? 'selected' : ''}>IT Team</option>
                  <option value="Project Management Lead" ${user.role === 'Project Management Lead' ? 'selected' : ''}>PM Lead</option>
                  <option value="VP of Product" ${user.role === 'VP of Product' ? 'selected' : ''}>VP of Product</option>
                  <option value="Director" ${user.role === 'Director' ? 'selected' : ''}>Director</option>
                  <option value="CMO" ${user.role === 'CMO' ? 'selected' : ''}>CMO</option>
                  <option value="CPO" ${user.role === 'CPO' ? 'selected' : ''}>CPO</option>
                  <option value="COO" ${user.role === 'COO' ? 'selected' : ''}>COO</option>
                  <option value="CTO" ${user.role === 'CTO' ? 'selected' : ''}>CTO</option>
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

    // Edit PC Image Upload File Picker
    const editFileInput = modalContainer.querySelector('#edit-user-file-input');
    const editBrowseBtn = modalContainer.querySelector('#btn-edit-browse-file');
    const editAvatarInput = modalContainer.querySelector('#edit-user-avatar');

    editBrowseBtn?.addEventListener('click', () => editFileInput.click());

    editFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          this.showToast(`Optimizing image "${file.name}"...`, 'info');
          const dataUrl = await window.compressImageFile(file, 250, 250, 0.85);
          editAvatarInput.value = dataUrl;
          this.showToast(`Uploaded & optimized image "${file.name}" from PC!`, 'success');
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            editAvatarInput.value = evt.target.result;
            this.showToast(`Uploaded image "${file.name}" from PC!`, 'success');
          };
          reader.readAsDataURL(file);
        }
      }
    });

    // Preset selection
    modalContainer.querySelectorAll('.avatar-preset-btn').forEach(img => {
      img.addEventListener('click', (e) => {
        editAvatarInput.value = e.target.getAttribute('data-url');
        this.showToast('Selected avatar photo preset', 'info');
      });
    });

    modalContainer.querySelector('#edit-user-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = modalContainer.querySelector('#edit-user-empid').value.trim();
      const password = modalContainer.querySelector('#edit-user-password').value.trim();
      const name = modalContainer.querySelector('#edit-user-name').value.trim();
      const email = modalContainer.querySelector('#edit-user-email').value.trim();
      const avatar = editAvatarInput.value.trim();
      const dept = modalContainer.querySelector('#edit-user-dept').value;
      const role = modalContainer.querySelector('#edit-user-role').value;

      this.storage.updateUser(userId, { empId, password, name, email, avatar, department: dept, role });
      this.updateAdminProfile();
      window.appController?.updateUserProfile();
      this.showToast(`Updated employee profile for ${name}`, 'success');
      closeModal();
      const container = document.getElementById('admin-portal-content') || document.getElementById('app-content');
      if (container) this.navigate(this.currentView);
    });
  }

  // --- MODULE DISTRIBUTION TAB ---
  renderModuleDistributionTab(container) {
    const modules = this.storage.getModules();
    const users = this.storage.getUsers();
    const distributions = this.storage.getModuleDistributions();

    container.innerHTML = `
      <div class="admin-header-banner">
        <div class="admin-banner-top">
          <div class="admin-banner-title">
            <h2><i class="fa-solid fa-share-nodes text-primary"></i> Module Distribution Panel</h2>
            <p style="color:#94a3b8; font-size:0.9rem; margin-top:0.25rem;">Distribute workspace modules to selected employees with target deadlines</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem; background: var(--bg-card);">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i class="fa-solid fa-paper-plane text-primary"></i> Distribute Module to Selected Employees</h3>
          <button class="btn btn-primary btn-sm" id="btn-open-add-module-modal-dist">
            <i class="fa-solid fa-plus"></i> Add New Module
          </button>
        </div>

        <form id="distribute-module-form">
          <div class="grid grid-2" style="gap:1.25rem; margin-bottom:1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Select Module to Distribute</label>
              <select class="form-control" id="dist-module-select" required>
                <option value="">-- Choose Module --</option>
                ${modules.map(m => `<option value="${m.id}">${m.number || 'Mod'} - ${m.title}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Target Completion Deadline</label>
              <input type="date" class="form-control" id="dist-module-deadline" value="2026-09-15" required>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1.25rem;">
            <label class="form-label" style="font-weight:700; margin-bottom:0.5rem; display:block;">
              Select Target Employees (<span id="selected-emp-count">0</span> selected)
            </label>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-select-all-emps">Select All</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-deselect-all-emps">Deselect All</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:0.6rem; max-height:220px; overflow-y:auto; padding:0.75rem; background:rgba(0,0,0,0.2); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              ${users.map(u => `
                <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer; padding:0.3rem 0.5rem; background:rgba(255,255,255,0.03); border-radius:4px;">
                  <input type="checkbox" class="dist-emp-checkbox" value="${u.id}">
                  <img src="${u.avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                  <span style="font-weight:600;">${u.name}</span>
                  <span style="font-size:0.7rem; color:#94a3b8; margin-left:auto;">${u.role}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1.5rem;">
            <label class="form-label" style="font-weight:700;">Distribution Instructions / Notes</label>
            <input type="text" class="form-control" id="dist-module-instructions" placeholder="e.g. Mandatory onboarding exercise for sprint Q3">
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-paper-plane"></i> Distribute Module to Selected Employees
            </button>
          </div>
        </form>
      </div>

      <!-- Manage Workspace Modules List -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-book-open text-primary"></i> Workspace Modules Directory (${modules.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Module Number & Title</th>
                <th>Instructor Lead</th>
                <th>Target Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${modules.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align:center; color:#94a3b8; padding:2rem;">
                    No modules available. Click "Add New Module" above!
                  </td>
                </tr>
              ` : modules.map(m => `
                <tr>
                  <td style="font-weight:700; color:#fff;">${m.number}: ${m.title}</td>
                  <td>${m.instructor || 'Instructor'}</td>
                  <td>${m.deadline || '2026-09-30'}</td>
                  <td><span class="badge ${m.unlocked ? 'badge-success' : 'badge-neutral'}">${m.unlocked ? 'Unlocked' : 'Locked'}</span></td>
                  <td>
                    <button class="btn btn-sm btn-danger btn-delete-module-dist" data-module-id="${m.id}" title="Delete Module">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-list-check text-primary"></i> Module Distribution Records (${distributions.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Module Title</th>
                <th>Distributed To (Selected Employees)</th>
                <th>Distributed By</th>
                <th>Date</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${distributions.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">
                    No module distributions recorded yet. Distribute a module above!
                  </td>
                </tr>
              ` : distributions.map(d => `
                <tr>
                  <td style="font-weight:700; color:#38bdf8;">
                    <i class="fa-solid fa-book-open" style="margin-right:0.4rem;"></i>
                    ${d.moduleNumber} - ${d.moduleTitle}
                  </td>
                  <td style="font-size:0.85rem; max-width:280px; font-weight:600;">${d.targetUserNames}</td>
                  <td>${d.distributedBy}</td>
                  <td>${d.distributedDate}</td>
                  <td><span class="badge badge-neutral">${d.deadline}</span></td>
                  <td><span class="badge badge-success">${d.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const checkboxes = container.querySelectorAll('.dist-emp-checkbox');
    const updateCount = () => {
      const selected = container.querySelectorAll('.dist-emp-checkbox:checked').length;
      const countEl = container.querySelector('#selected-emp-count');
      if (countEl) countEl.innerText = selected;
    };

    checkboxes.forEach(cb => cb.addEventListener('change', updateCount));

    container.querySelector('#btn-select-all-emps')?.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = true);
      updateCount();
    });

    container.querySelector('#btn-deselect-all-emps')?.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = false);
      updateCount();
    });

    container.querySelector('#btn-open-add-module-modal-dist')?.addEventListener('click', () => {
      this.openAddModuleModal(container);
    });

    container.querySelectorAll('.btn-delete-module-dist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modId = e.currentTarget.getAttribute('data-module-id');
        if (confirm("Are you sure you want to delete this module?")) {
          const res = this.storage.deleteModule(modId);
          if (res.success) {
            this.showToast('Module deleted successfully!', 'success');
            this.renderModuleDistributionTab(container);
          }
        }
      });
    });

    container.querySelector('#distribute-module-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const moduleId = container.querySelector('#dist-module-select').value;
      const deadline = container.querySelector('#dist-module-deadline').value;
      const instructions = container.querySelector('#dist-module-instructions').value;
      const selectedIds = Array.from(container.querySelectorAll('.dist-emp-checkbox:checked')).map(cb => cb.value);

      const result = this.storage.distributeModule(moduleId, selectedIds, deadline, instructions);
      if (result.success) {
        this.showToast(`Module distributed to ${result.count} selected employee(s)!`, 'success');
        this.renderModuleDistributionTab(container);
      } else {
        this.showToast(result.error || 'Distribution failed', 'error');
      }
    });
  }

  // --- PROJECT DISTRIBUTION TAB ---
  renderProjectDistributionTab(container) {
    const projects = this.storage.getProjects();
    const leads = this.storage.getProjectLeads();
    const users = this.storage.getUsers();

    container.innerHTML = `
      <div class="admin-header-banner">
        <div class="admin-banner-top">
          <div class="admin-banner-title">
            <h2><i class="fa-solid fa-diagram-project text-primary"></i> Project Distribution Panel</h2>
            <p style="color:#94a3b8; font-size:0.9rem; margin-top:0.25rem;">Allocate workspace projects to Project Leads and selected team members</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem; background: var(--bg-card);">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-users-viewfinder text-primary"></i> Allocate Project to Team</h3>
        </div>

        <form id="distribute-project-form">
          <div class="grid grid-2" style="gap:1.25rem; margin-bottom:1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Select Project</label>
              <select class="form-control" id="dist-proj-select" required>
                <option value="">-- Choose Project --</option>
                ${projects.map(p => `<option value="${p.id}">${p.name} (${p.status})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Assigned Project Lead</label>
              <select class="form-control" id="dist-proj-lead-select" required>
                <option value="">-- Select Project Lead --</option>
                ${leads.map(l => `<option value="${l.id}">${l.name} (${l.role})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1.25rem;">
            <label class="form-label" style="font-weight:700; margin-bottom:0.5rem; display:block;">
              Select Assigned Team Members (<span id="selected-proj-emp-count">0</span> selected)
            </label>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:0.6rem; max-height:200px; overflow-y:auto; padding:0.75rem; background:rgba(0,0,0,0.2); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              ${users.map(u => `
                <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer; padding:0.3rem 0.5rem; background:rgba(255,255,255,0.03); border-radius:4px;">
                  <input type="checkbox" class="dist-proj-emp-checkbox" value="${u.id}">
                  <img src="${u.avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                  <span style="font-weight:600;">${u.name}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-2" style="gap:1.25rem; margin-bottom:1.5rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Target Completion Deadline</label>
              <input type="date" class="form-control" id="dist-proj-deadline" value="2026-10-30">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Priority Level</label>
              <select class="form-control" id="dist-proj-priority">
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="Medium">Medium Priority</option>
              </select>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-diagram-project"></i> Distribute Project to Selected Team
            </button>
          </div>
        </form>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i class="fa-solid fa-folder-tree text-primary"></i> Active Project Roster Allocations (${projects.length})</h3>
          <button class="btn btn-primary btn-sm" id="btn-open-add-project-modal">
            <i class="fa-solid fa-plus"></i> Add New Project
          </button>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Assigned Project Lead</th>
                <th>Assigned Team Members</th>
                <th>Progress</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${projects.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; color:#94a3b8; padding:2rem;">
                    No projects found. Click "Add New Project" above to create one!
                  </td>
                </tr>
              ` : projects.map(p => `
                <tr>
                  <td style="font-weight:700; color:#fff;">${p.name}</td>
                  <td style="font-weight:700; color:#38bdf8;">
                    <i class="fa-solid fa-user-tie" style="margin-right:0.35rem;"></i>
                    ${p.lead || 'Project Lead'}
                  </td>
                  <td style="font-size:0.85rem;">
                    ${(p.teamMembers || []).map(m => `<span class="badge badge-neutral" style="margin:2px;">${m}</span>`).join('')}
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <div style="flex:1; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                        <div style="width:${p.progress || 0}%; height:100%; background:var(--primary);"></div>
                      </div>
                      <span style="font-size:0.75rem; font-weight:700;">${p.progress || 0}%</span>
                    </div>
                  </td>
                  <td>${p.deadline || '2026-09-30'}</td>
                  <td><span class="badge badge-success">${p.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-danger btn-delete-project" data-project-id="${p.id}" title="Delete Project">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const checkboxes = container.querySelectorAll('.dist-proj-emp-checkbox');
    const updateCount = () => {
      const selected = container.querySelectorAll('.dist-proj-emp-checkbox:checked').length;
      const countEl = container.querySelector('#selected-proj-emp-count');
      if (countEl) countEl.innerText = selected;
    };

    checkboxes.forEach(cb => cb.addEventListener('change', updateCount));

    container.querySelector('#btn-open-add-project-modal')?.addEventListener('click', () => {
      this.openAddProjectModal(container);
    });

    container.querySelectorAll('.btn-delete-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projId = e.currentTarget.getAttribute('data-project-id');
        if (confirm("Are you sure you want to delete this project?")) {
          const res = this.storage.deleteProject(projId);
          if (res.success) {
            this.showToast('Project deleted successfully!', 'success');
            this.renderProjectDistributionTab(container);
          }
        }
      });
    });

    container.querySelector('#distribute-project-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const projId = container.querySelector('#dist-proj-select').value;
      const leadId = container.querySelector('#dist-proj-lead-select').value;
      const deadline = container.querySelector('#dist-proj-deadline').value;
      const selectedMemberIds = Array.from(container.querySelectorAll('.dist-proj-emp-checkbox:checked')).map(cb => cb.value);

      const result = this.storage.distributeProject(projId, leadId, selectedMemberIds, deadline);
      if (result.success) {
        this.showToast(`Project "${result.project.name}" allocated to team!`, 'success');
        this.renderProjectDistributionTab(container);
      } else {
        this.showToast(result.error || 'Project allocation failed', 'error');
      }
    });
  }

  // --- PROJECT LEADS TAB ---
  renderProjectLeadsTab(container) {
    const leads = this.storage.getProjectLeads();
    const users = this.storage.getUsers();
    const projects = this.storage.getProjects();

    container.innerHTML = `
      <div class="admin-header-banner">
        <div class="admin-banner-top">
          <div class="admin-banner-title">
            <h2><i class="fa-solid fa-user-tie text-primary"></i> Project Leads & Leadership Roster</h2>
            <p style="color:#94a3b8; font-size:0.9rem; margin-top:0.25rem;">Inspect designated Project Management Leads and assign leadership roles</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title"><i class="fa-solid fa-shield-halved text-primary"></i> Designated Project Management Leads (${leads.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Lead Officer</th>
                <th>Employee ID</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Corporate Email</th>
                <th>Active Projects</th>
              </tr>
            </thead>
            <tbody>
              ${leads.map(l => {
                const assignedProjs = projects.filter(p => p.lead === l.name || (p.teamMembers || []).includes(l.name));
                return `
                  <tr>
                    <td>
                      <div class="user-cell">
                        <img src="${l.avatar}" alt="${l.name}" class="user-avatar-sm">
                        <div class="user-details">
                          <span style="font-weight:700; color:#fff;">${l.name}</span>
                        </div>
                      </div>
                    </td>
                    <td style="font-family:monospace; font-weight:700; color:#38bdf8;">${l.empId || 'EMP'}</td>
                    <td><span class="role-badge ${this.getRoleBadgeClass(l.role)}">${l.role}</span></td>
                    <td>${l.department}</td>
                    <td style="font-size:0.8rem; color:#94a3b8;">${l.email}</td>
                    <td>
                      <span class="badge badge-primary">${assignedProjs.length} Projects</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-user-plus text-primary"></i> Promote Employee to Project Management Lead</h3>
        </div>
        <form id="promote-lead-form">
          <div class="grid grid-2" style="gap:1.25rem; margin-bottom:1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Select Employee</label>
              <select class="form-control" id="promote-emp-select" required>
                <option value="">-- Choose Employee --</option>
                ${users.map(u => `<option value="${u.id}">${u.name} - ${u.department} (${u.role})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Assign Leadership Clearance</label>
              <select class="form-control" id="promote-role-select" required>
                <option value="Project Management Lead">Project Management Lead</option>
                <option value="Manager">Manager</option>
                <option value="VP of Product">VP of Product</option>
                <option value="Director">Director</option>
              </select>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-award"></i> Assign Project Lead Clearance
            </button>
          </div>
        </form>
      </div>
    `;

    container.querySelector('#promote-lead-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = container.querySelector('#promote-emp-select').value;
      const newRole = container.querySelector('#promote-role-select').value;

      const user = users.find(u => u.id === empId);
      if (user) {
        this.storage.updateUserRole(empId, newRole);
        this.showToast(`Assigned ${user.name} to ${newRole}!`, 'success');
        this.renderProjectLeadsTab(container);
      }
    });
  }

  openAddModuleModal(container) {
    let modalContainer = document.getElementById('admin-add-module-modal');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'admin-add-module-modal';
      document.body.appendChild(modalContainer);
    }

    const modules = this.storage.getModules();
    const nextNum = `Module ${String(modules.length + 1).padStart(2, '0')}`;

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width: 520px; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-plus-circle text-primary"></i> Create & Publish New Module
            </h3>
            <button class="btn btn-secondary btn-sm" id="close-add-mod-btn" style="padding: 0.2rem 0.5rem;">&times;</button>
          </div>

          <form id="add-module-form">
            <div class="grid grid-2" style="gap:1rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Module Number</label>
                <input type="text" id="new-mod-number" class="form-control" value="${nextNum}" required>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Instructor</label>
                <input type="text" id="new-mod-instructor" class="form-control" value="Sarah Jenkins" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Module Title</label>
              <input type="text" id="new-mod-title" class="form-control" placeholder="e.g. Advanced System Architecture" required>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Description</label>
              <textarea id="new-mod-desc" class="form-control" rows="2" placeholder="Brief summary of module learning objectives..." required></textarea>
            </div>

            <div class="form-group" style="margin-bottom:1.25rem;">
              <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Target Deadline</label>
              <input type="date" id="new-mod-deadline" class="form-control" value="2026-09-30" required>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" id="cancel-add-mod-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-check"></i> Publish Module
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#close-add-mod-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-add-mod-btn')?.addEventListener('click', closeModal);

    modalContainer.querySelector('#add-module-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const number = modalContainer.querySelector('#new-mod-number').value.trim();
      const title = modalContainer.querySelector('#new-mod-title').value.trim();
      const description = modalContainer.querySelector('#new-mod-desc').value.trim();
      const instructor = modalContainer.querySelector('#new-mod-instructor').value.trim();
      const deadline = modalContainer.querySelector('#new-mod-deadline').value;

      const result = this.storage.addModule({ number, title, description, instructor, deadline });
      if (result.success) {
        closeModal();
        this.showToast(`Published ${result.module.number} - ${result.module.title}!`, 'success');
        this.navigate(this.currentView);
      }
    });
  }

  openAddProjectModal(container) {
    let modalContainer = document.getElementById('admin-add-project-modal');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'admin-add-project-modal';
      document.body.appendChild(modalContainer);
    }

    const leads = this.storage.getProjectLeads();

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width: 520px; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-plus-circle text-primary"></i> Create New Workspace Project
            </h3>
            <button class="btn btn-secondary btn-sm" id="close-add-proj-btn" style="padding: 0.2rem 0.5rem;">&times;</button>
          </div>

          <form id="add-project-form">
            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Project Name</label>
              <input type="text" id="new-proj-name" class="form-control" placeholder="e.g. AI Workflow Optimization Platform" required>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Description</label>
              <textarea id="new-proj-desc" class="form-control" rows="2" placeholder="Project goals and deliverables..." required></textarea>
            </div>

            <div class="grid grid-2" style="gap:1rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Assigned Project Lead</label>
                <select id="new-proj-lead" class="form-control" required>
                  ${leads.map(l => `<option value="${l.name}">${l.name} (${l.role})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.85rem; margin-bottom:0.3rem; display:block;">Target Completion</label>
                <input type="date" id="new-proj-deadline" class="form-control" value="2026-10-30" required>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" id="cancel-add-proj-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-check"></i> Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#close-add-proj-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-add-proj-btn')?.addEventListener('click', closeModal);

    modalContainer.querySelector('#add-project-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modalContainer.querySelector('#new-proj-name').value.trim();
      const description = modalContainer.querySelector('#new-proj-desc').value.trim();
      const lead = modalContainer.querySelector('#new-proj-lead').value;
      const deadline = modalContainer.querySelector('#new-proj-deadline').value;

      const result = this.storage.addProject({ name, description, lead, deadline });
      if (result.success) {
        closeModal();
        this.showToast(`Created project "${result.project.name}"!`, 'success');
        this.navigate(this.currentView);
      }
    });
  }

  // --- TASK DISTRIBUTION TAB ---
  renderTaskDistributionTab(container) {
    const tasks = this.storage.getTasks();
    const users = this.storage.getUsers();
    const projects = this.storage.getProjects();
    const submittedTasks = tasks.filter(t => t.status === 'Submitted');

    container.innerHTML = `
      <div class="admin-header-banner">
        <div class="admin-banner-top">
          <div class="admin-banner-title">
            <h2><i class="fa-solid fa-list-check text-primary"></i> Task Distribution & Verification Control</h2>
            <p style="color:#94a3b8; font-size:0.9rem; margin-top:0.25rem;">Assign tasks to selected team members, set priorities, and verify completed work with screenshots</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem; background: var(--bg-card);">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-paper-plane text-primary"></i> Assign Task to Selected Employees</h3>
        </div>

        <form id="distribute-task-form">
          <div class="grid grid-2" style="gap:1.25rem; margin-bottom:1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Task Title</label>
              <input type="text" class="form-control" id="dist-task-title" required placeholder="e.g. Implement Responsive Navigation & Accessibility">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Target Project</label>
              <select class="form-control" id="dist-task-project" required>
                ${projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                <option value="Hyna Workspace General Tasks">Hyna Workspace General Tasks</option>
              </select>
            </div>
          </div>

          <div class="grid grid-2" style="gap:1.25rem; margin-bottom:1.25rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Priority Level</label>
              <select class="form-control" id="dist-task-priority">
                <option value="High" selected>High Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Target Deadline</label>
              <input type="date" class="form-control" id="dist-task-deadline" value="2026-09-15" required>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1.25rem;">
            <label class="form-label" style="font-weight:700; margin-bottom:0.5rem; display:block;">
              Select Target Employees (<span id="selected-task-emp-count">0</span> selected)
            </label>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-select-all-task-emps">Select All</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-deselect-all-task-emps">Deselect All</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:0.6rem; max-height:220px; overflow-y:auto; padding:0.75rem; background:rgba(0,0,0,0.2); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              ${users.map(u => `
                <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer; padding:0.3rem 0.5rem; background:rgba(255,255,255,0.03); border-radius:4px;">
                  <input type="checkbox" class="dist-task-emp-checkbox" value="${u.id}">
                  <img src="${u.avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                  <span style="font-weight:600;">${u.name}</span>
                  <span style="font-size:0.7rem; color:#94a3b8; margin-left:auto;">${u.role}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-paper-plane"></i> Assign Task to Selected Employees
            </button>
          </div>
        </form>
      </div>

      <!-- Pending Task Work Submissions Verification Card -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-file-signature text-warning"></i> Pending Task Work Submissions & Verification Screenshots (${submittedTasks.length})</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
          ${submittedTasks.length === 0 ? `
            <div style="text-align: center; color: #94a3b8; padding: 1.5rem;">
              No pending task work submissions for review.
            </div>
          ` : submittedTasks.map(t => `
            <div style="padding: 1.25rem; background: rgba(15,23,42,0.8); border-radius: 10px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="badge badge-warning" style="margin-right: 0.5rem;">${t.priority}</span>
                  <span style="font-weight: 700; color: #fff; font-size: 1rem;">${t.title}</span>
                  <span style="font-size: 0.8rem; color: #94a3b8; margin-left: 0.5rem;">(${t.project})</span>
                </div>
                <button class="btn btn-success btn-sm btn-approve-task-dist" data-task-id="${t.id}">
                  <i class="fa-solid fa-check-circle"></i> Verify Image & Approve Task
                </button>
              </div>
              <div style="font-size: 0.85rem; color: #94a3b8;">
                <strong>Assigned To:</strong> ${t.assignedTo} | <strong>Employee Completion Notes:</strong> ${t.submissionText || 'No notes provided'}
              </div>
              ${t.submissionImage ? `
                <div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.35rem;">Verification Screenshot Image:</div>
                  <img src="${t.submissionImage}" alt="Verification Screenshot" style="max-width: 320px; max-height: 200px; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)">
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Active Workspace Tasks Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-list text-primary"></i> Active Task Allocations Directory (${tasks.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; color:#94a3b8; padding:2rem;">
                    No tasks assigned yet. Create & assign a task above!
                  </td>
                </tr>
              ` : tasks.map(t => `
                <tr>
                  <td style="font-weight:700; color:#fff;">${t.title}</td>
                  <td style="font-size:0.85rem;">${t.project}</td>
                  <td style="font-size:0.85rem; font-weight:600;">${t.assignedTo}</td>
                  <td><span class="badge ${t.priority === 'Urgent' ? 'badge-danger' : t.priority === 'High' ? 'badge-warning' : 'badge-primary'}">${t.priority}</span></td>
                  <td style="font-size:0.85rem;">${t.deadline}</td>
                  <td><span class="badge ${t.status === 'Completed' ? 'badge-success' : t.status === 'Submitted' ? 'badge-warning' : 'badge-neutral'}">${t.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-danger btn-delete-task-dist" data-task-id="${t.id}" title="Delete Task">
                      <i class="fa-solid fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const checkboxes = container.querySelectorAll('.dist-task-emp-checkbox');
    const updateCount = () => {
      const selected = container.querySelectorAll('.dist-task-emp-checkbox:checked').length;
      const countEl = container.querySelector('#selected-task-emp-count');
      if (countEl) countEl.innerText = selected;
    };

    checkboxes.forEach(cb => cb.addEventListener('change', updateCount));

    container.querySelector('#btn-select-all-task-emps')?.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = true);
      updateCount();
    });

    container.querySelector('#btn-deselect-all-task-emps')?.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = false);
      updateCount();
    });

    container.querySelectorAll('.btn-approve-task-dist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-task-id');
        this.storage.approveTask(taskId);
        this.showToast('Task verified and approved! Marked as Completed.', 'success');
        this.renderTaskDistributionTab(container);
      });
    });

    container.querySelectorAll('.btn-delete-task-dist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-task-id');
        if (confirm("Are you sure you want to delete this task?")) {
          const res = this.storage.deleteTask(taskId);
          if (res.success) {
            this.showToast('Task deleted successfully!', 'success');
            this.renderTaskDistributionTab(container);
          }
        }
      });
    });

    container.querySelector('#distribute-task-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = container.querySelector('#dist-task-title').value.trim();
      const project = container.querySelector('#dist-task-project').value;
      const priority = container.querySelector('#dist-task-priority').value;
      const deadline = container.querySelector('#dist-task-deadline').value;
      const selectedIds = Array.from(container.querySelectorAll('.dist-task-emp-checkbox:checked')).map(cb => cb.value);

      const result = this.storage.assignTask({
        title,
        project,
        priority,
        deadline,
        assignedToIds: selectedIds
      });

      if (result.success) {
        this.showToast(`Task assigned to ${result.count} selected employee(s)!`, 'success');
        this.renderTaskDistributionTab(container);
      } else {
        this.showToast('Failed to assign task', 'error');
      }
    });
  }

  getRoleBadgeClass(role) {
    switch (role) {
      case 'CEO': return 'role-ceo';
      case 'CTO': return 'role-cto';
      case 'COO': return 'role-coo';
      case 'CPO': return 'role-cpo';
      case 'CMO': return 'role-cmo';
      case 'Director': return 'role-director';
      case 'VP of Product': return 'role-vp';
      case 'Manager': return 'role-manager';
      case 'Project Management Lead': return 'role-pm';
      case 'IT Team': return 'role-it';
      default: return 'role-member';
    }
  }
}

window.adminController = new AdminController();
