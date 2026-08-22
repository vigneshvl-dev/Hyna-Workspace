/**
 * HYNA STUDIO WORKSPACE - MODULE MANAGEMENT SYSTEM
 * Implements the sequential unlocking workflow:
 * Assigned -> In Progress -> Submitted -> Under Review -> Approved -> Completed -> Next Module Unlocked
 */

class ModuleController {
  constructor() {
    this.storage = window.storageService;
    this.auth = window.authService;
    this.currentFilter = 'all';
  }

  renderModulesView(container) {
    const modules = this.storage.getModules();
    const isManager = this.auth.isManagerOrAdmin();

    const filteredModules = modules.filter(m => {
      if (this.currentFilter === 'my') return m.assignedTo === this.auth.getCurrentUser().id;
      if (this.currentFilter === 'in_progress') return m.status === 'In Progress';
      if (this.currentFilter === 'submitted') return m.status === 'Submitted';
      if (this.currentFilter === 'completed') return m.status === 'Completed';
      if (this.currentFilter === 'upcoming') return !m.unlocked;
      return true;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Modules Hub</h1>
          <p class="page-subtitle">Sequential learning modules and milestone deliverables</p>
        </div>
        ${isManager ? `
          <button class="btn btn-primary" id="create-module-btn">
            <i class="fa-solid fa-plus"></i> Create New Module
          </button>
        ` : ''}
      </div>

      <!-- Progression Status Bar Header -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div class="card-header" style="margin-bottom: 0.5rem;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Sequential Progression Pipeline Workflow
          </span>
        </div>
        <div class="progression-pipeline">
          <div class="pipeline-step completed"><div class="pipeline-node"><i class="fa-solid fa-check"></i></div><span class="pipeline-label">Assigned</span></div>
          <div class="pipeline-step active"><div class="pipeline-node">2</div><span class="pipeline-label">In Progress</span></div>
          <div class="pipeline-step"><div class="pipeline-node">3</div><span class="pipeline-label">Submitted</span></div>
          <div class="pipeline-step"><div class="pipeline-node">4</div><span class="pipeline-label">Under Review</span></div>
          <div class="pipeline-step"><div class="pipeline-node">5</div><span class="pipeline-label">Approved</span></div>
          <div class="pipeline-step"><div class="pipeline-node"><i class="fa-solid fa-lock-open"></i></div><span class="pipeline-label">Next Unlocked</span></div>
        </div>
      </div>

      <!-- Tabs Filter -->
      <div class="tabs-header">
        <button class="tab-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All Modules (${modules.length})</button>
        <button class="tab-btn ${this.currentFilter === 'in_progress' ? 'active' : ''}" data-filter="in_progress">In Progress</button>
        <button class="tab-btn ${this.currentFilter === 'submitted' ? 'active' : ''}" data-filter="submitted">Submitted / Review</button>
        <button class="tab-btn ${this.currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">Completed</button>
        <button class="tab-btn ${this.currentFilter === 'upcoming' ? 'active' : ''}" data-filter="upcoming">Upcoming (Locked)</button>
      </div>

      <!-- Module Cards Grid -->
      <div class="modules-grid">
        ${filteredModules.map(m => this.renderModuleCard(m, isManager)).join('')}
      </div>
    `;

    this.attachEvents(container);
  }

  renderModuleCard(m, isManager) {
    const isLocked = !m.unlocked;

    return `
      <div class="module-card ${isLocked ? 'locked' : ''}">
        ${isLocked ? `
          <div class="locked-badge-banner">
            <i class="fa-solid fa-lock"></i> Complete previous module to unlock
          </div>
        ` : ''}

        <div class="module-card-header">
          <span class="module-number-badge">${m.number}</span>
          <span class="badge ${m.status === 'Completed' ? 'badge-success' : m.status === 'Submitted' ? 'badge-warning' : m.status === 'In Progress' ? 'badge-primary' : 'badge-neutral'}">
            ${m.status}
          </span>
        </div>

        <h3 class="module-title">${m.title}</h3>
        <p class="module-description">${m.description}</p>

        <div class="module-meta-group">
          <div class="module-meta-row">
            <span>Deadline:</span>
            <span class="module-meta-val">${m.deadline}</span>
          </div>
          <div class="module-meta-row">
            <span>Instructor/Lead:</span>
            <span class="module-meta-val">${m.instructor}</span>
          </div>
          <div class="module-meta-row">
            <span>Progress:</span>
            <span class="module-meta-val">${m.progress}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${m.progress}%"></div>
          </div>
        </div>

        <div class="module-card-footer">
          ${isLocked ? `
            <button class="btn btn-secondary btn-sm" disabled style="width: 100%;">
              <i class="fa-solid fa-lock"></i> Locked
            </button>
          ` : m.status === 'Submitted' && isManager ? `
            <button class="btn btn-success btn-sm open-module-btn" data-id="${m.id}" style="width: 100%;">
              <i class="fa-solid fa-user-check"></i> Review & Approve Submission
            </button>
          ` : `
            <button class="btn ${m.status === 'Completed' ? 'btn-secondary' : 'btn-primary'} btn-sm open-module-btn" data-id="${m.id}" style="width: 100%;">
              ${m.status === 'Completed' ? 'View Completed Module' : 'Continue Module <i class="fa-solid fa-arrow-right"></i>'}
            </button>
          `}
        </div>
      </div>
    `;
  }

  attachEvents(container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentFilter = e.target.dataset.filter;
        this.renderModulesView(container);
      });
    });

    container.querySelectorAll('.open-module-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modId = e.currentTarget.dataset.id;
        this.openModuleDetailModal(modId);
      });
    });

    container.querySelector('#create-module-btn')?.addEventListener('click', () => {
      this.openCreateModuleModal();
    });
  }

  openModuleDetailModal(modId) {
    const mod = this.storage.getModuleById(modId);
    if (!mod) return;

    const isManager = this.auth.isManagerOrAdmin();

    const modalHTML = `
      <div class="modal-overlay active" id="module-modal-overlay">
        <div class="modal-card" style="max-width: 720px;">
          <div class="modal-header">
            <div>
              <span class="badge badge-primary">${mod.number}</span>
              <h2 class="modal-title" style="margin-top: 0.25rem;">${mod.title}</h2>
            </div>
            <button class="modal-close-btn" id="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Overview & Learning Objectives</h4>
            <p style="font-size: 0.95rem; color: var(--text-main); margin-top: 0.5rem; line-height: 1.6;">${mod.description}</p>
          </div>

          <div class="card" style="background-color: var(--bg-main); padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;"><i class="fa-solid fa-list-check text-primary"></i> Module Content & Assignment</h4>
            <p style="font-size: 0.9rem; color: var(--text-main);">${mod.content || 'Complete instructions and push your repository changes.'}</p>
          </div>

          ${mod.status === 'Submitted' ? `
            <div class="card" style="background-color: var(--warning-light); border-color: var(--warning-border); padding: 1.25rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.85rem; font-weight: 700; color: #b45309;"><i class="fa-solid fa-clock"></i> Submission Details (Under Review)</h4>
              <p style="font-size: 0.85rem; margin-top: 0.25rem; color: #78350f;"><strong>Notes:</strong> ${mod.submissionText || 'Submission pending review'}</p>
              ${mod.submissionLink ? `<p style="font-size: 0.85rem; color: #78350f;"><strong>Link:</strong> <a href="${mod.submissionLink}" target="_blank">${mod.submissionLink}</a></p>` : ''}
            </div>
          ` : ''}

          <!-- Submission Form for Employee or Review Form for Manager -->
          ${mod.status === 'In Progress' ? `
            <form id="module-submit-form" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem;"><i class="fa-solid fa-upload text-primary"></i> Submit Work for Review</h4>
              <div class="form-group">
                <label class="form-label">Submission Summary / Notes</label>
                <textarea class="form-control" id="submission-text" required placeholder="Describe your completed work, code changes, and test verification..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Repository or PR Link (Optional)</label>
                <input type="url" class="form-control" id="submission-link" placeholder="https://github.com/hyna-studio/repo/pull/42">
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fa-solid fa-paper-plane"></i> Submit Module for Review
              </button>
            </form>
          ` : mod.status === 'Submitted' && isManager ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; gap: 1rem;">
              <button class="btn btn-success btn-lg" id="approve-module-btn" style="flex: 1;">
                <i class="fa-solid fa-check-circle"></i> Approve Module & Unlock Next
              </button>
            </div>
          ` : mod.status === 'Completed' ? `
            <div class="badge badge-success" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.9rem;">
              <i class="fa-solid fa-circle-check"></i> Module Approved & Completed
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('module-modal-overlay');
    const closeBtn = document.getElementById('close-modal-btn');

    const closeModal = () => {
      overlay.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.getElementById('module-submit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('submission-text').value;
      const link = document.getElementById('submission-link').value;
      this.storage.submitModule(modId, text, link);
      closeModal();
      window.appController?.showToast('Module submitted for Manager review!', 'success');
      window.appController?.navigate('modules');
    });

    document.getElementById('approve-module-btn')?.addEventListener('click', () => {
      this.storage.approveModule(modId);
      closeModal();
      window.appController?.showToast('Module approved! Next module unlocked.', 'success');
      window.appController?.navigate('modules');
    });
  }

  openCreateModuleModal() {
    const modalHTML = `
      <div class="modal-overlay active" id="create-mod-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">Create New Module</h2>
            <button class="modal-close-btn" id="close-create-mod"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form id="create-mod-form">
            <div class="form-group">
              <label class="form-label">Module Title</label>
              <input type="text" class="form-control" id="new-mod-title" required placeholder="e.g. React Architecture & State Management">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-control" id="new-mod-desc" required placeholder="Module goals and requirements..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Deadline</label>
              <input type="date" class="form-control" id="new-mod-date" required>
            </div>
            <div class="form-group">
              <label class="form-label">Instructor Lead</label>
              <input type="text" class="form-control" id="new-mod-instructor" value="${this.auth.getCurrentUser().name}">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Create Module</button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('create-mod-modal');
    document.getElementById('close-create-mod').addEventListener('click', () => overlay.remove());

    document.getElementById('create-mod-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.storage.createModule({
        title: document.getElementById('new-mod-title').value,
        description: document.getElementById('new-mod-desc').value,
        deadline: document.getElementById('new-mod-date').value,
        instructor: document.getElementById('new-mod-instructor').value
      });
      overlay.remove();
      window.appController?.showToast('New module created!', 'success');
      window.appController?.navigate('modules');
    });
  }
}

window.moduleController = new ModuleController();
