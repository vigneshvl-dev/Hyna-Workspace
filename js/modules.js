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

    const activeMod = modules.find(m => m.status === 'Assigned' && m.unlocked) || modules.find(m => m.status === 'In Progress') || modules.find(m => m.status === 'Submitted') || modules[0];

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Modules Hub</h1>
          <p class="page-subtitle">Sequential learning modules and milestone deliverables</p>
        </div>
      </div>

      <!-- Progression Status Bar Header -->
      <div class="card" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div class="card-header" style="margin-bottom: 0.5rem;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Sequential Progression Pipeline Workflow
          </span>
        </div>
        <div class="progression-pipeline">
          <div class="pipeline-step ${activeMod && activeMod.status !== 'Assigned' ? 'completed' : 'active'}">
            <div class="pipeline-node">${activeMod && activeMod.status !== 'Assigned' ? '<i class="fa-solid fa-check"></i>' : '1'}</div>
            <span class="pipeline-label">Assigned</span>
          </div>
          <div class="pipeline-step ${activeMod && activeMod.status === 'In Progress' ? 'active' : (activeMod && ['Submitted', 'Completed'].includes(activeMod.status) ? 'completed' : '')}">
            <div class="pipeline-node">${activeMod && ['Submitted', 'Completed'].includes(activeMod.status) ? '<i class="fa-solid fa-check"></i>' : '2'}</div>
            <span class="pipeline-label">In Progress</span>
          </div>
          <div class="pipeline-step ${activeMod && activeMod.status === 'Submitted' ? 'active' : (activeMod && activeMod.status === 'Completed' ? 'completed' : '')}">
            <div class="pipeline-node">${activeMod && activeMod.status === 'Completed' ? '<i class="fa-solid fa-check"></i>' : '3'}</div>
            <span class="pipeline-label">Submitted</span>
          </div>
          <div class="pipeline-step ${activeMod && activeMod.status === 'Submitted' ? 'active' : (activeMod && activeMod.status === 'Completed' ? 'completed' : '')}">
            <div class="pipeline-node">${activeMod && activeMod.status === 'Completed' ? '<i class="fa-solid fa-check"></i>' : '4'}</div>
            <span class="pipeline-label">Under Review</span>
          </div>
          <div class="pipeline-step ${activeMod && activeMod.status === 'Completed' ? 'completed' : ''}">
            <div class="pipeline-node">${activeMod && activeMod.status === 'Completed' ? '<i class="fa-solid fa-check"></i>' : '5'}</div>
            <span class="pipeline-label">Approved</span>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-node"><i class="fa-solid fa-lock-open"></i></div>
            <span class="pipeline-label">Next Unlocked</span>
          </div>
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
            ${m.status || 'Assigned'}
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
            <span class="module-meta-val">${m.progress || 0}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${m.progress || 0}%"></div>
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
          ` : m.status === 'Assigned' ? `
            <button class="btn btn-primary btn-sm open-module-btn" data-id="${m.id}" style="width: 100%;">
              <i class="fa-solid fa-rocket"></i> Start Module (0%)
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
        this.openModuleDetailModal(modId, container);
      });
    });
  }

  openModuleDetailModal(modId, mainContainer = null) {
    let mod = this.storage.getModuleById(modId);
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

          <!-- Workspace Tools & Environment Selector -->
          <div class="card" style="background-color: var(--bg-main); border: 1px solid var(--border-color); padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">
              <i class="fa-solid fa-laptop-code text-primary"></i> Select Desktop Workspace Tool / Environment
            </h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
              Select the application you are using for this module to launch it on desktop and attach environment info to your submission:
            </p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;" id="workspace-tools-grid">
              <button type="button" class="btn btn-secondary tool-select-btn active-tool-tile" data-tool="VS Code" data-url="https://vscode.dev" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-size: 0.85rem; border-radius: 8px; border: 1px solid #38bdf8;">
                <i class="fa-solid fa-code" style="color: #007acc; font-size: 1.1rem;"></i> VS Code
              </button>
              <button type="button" class="btn btn-secondary tool-select-btn" data-tool="GitHub" data-url="https://github.com" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                <i class="fa-brands fa-github" style="color: #fff; font-size: 1.1rem;"></i> GitHub
              </button>
              <button type="button" class="btn btn-secondary tool-select-btn" data-tool="Google Antigravity" data-url="https://antigravity.google.com" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: #a855f7; font-size: 1.1rem;"></i> Google Antigravity
              </button>
              <button type="button" class="btn btn-secondary tool-select-btn" data-tool="Canva" data-url="https://canva.com" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                <i class="fa-solid fa-palette" style="color: #00c4cc; font-size: 1.1rem;"></i> Canva
              </button>
              <button type="button" class="btn btn-secondary tool-select-btn" data-tool="Figma" data-url="https://figma.com" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                <i class="fa-brands fa-figma" style="color: #f24e1e; font-size: 1.1rem;"></i> Figma
              </button>
              <button type="button" class="btn btn-secondary tool-select-btn" data-tool="Excel Sheet" data-url="https://sheets.google.com" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; font-size: 0.85rem; border-radius: 8px;">
                <i class="fa-solid fa-file-excel" style="color: #107c41; font-size: 1.1rem;"></i> Excel Sheet
              </button>
            </div>
            <div id="selected-tool-badge" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 700; color: #38bdf8;">
              Active Environment: ${mod.selectedTool || 'VS Code'}
            </div>
          </div>

          ${mod.status === 'Submitted' ? `
            <div class="card" style="background-color: var(--warning-light); border-color: var(--warning-border); padding: 1.25rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.85rem; font-weight: 700; color: #b45309;"><i class="fa-solid fa-clock"></i> Submission Details (Under Review by Admin)</h4>
              <p style="font-size: 0.85rem; margin-top: 0.25rem; color: #78350f;"><strong>Environment / Tool Used:</strong> <span class="badge badge-primary">${mod.selectedTool || 'VS Code'}</span></p>
              <p style="font-size: 0.85rem; margin-top: 0.25rem; color: #78350f;"><strong>Notes:</strong> ${mod.submissionText || 'Submission pending review'}</p>
              ${mod.submissionLink ? `<p style="font-size: 0.85rem; color: #78350f;"><strong>Link:</strong> <a href="${mod.submissionLink}" target="_blank">${mod.submissionLink}</a></p>` : ''}
              ${mod.submissionImage ? `
                <div style="margin-top: 0.75rem;">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #78350f; display: block; margin-bottom: 0.25rem;">Attached Verification Screenshot:</label>
                  <img src="${mod.submissionImage}" alt="Verification Screenshot" style="max-width: 280px; max-height: 180px; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)">
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Assigned 0% Action or Submission Form or Review Form -->
          ${mod.status === 'Assigned' ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
              <div class="card" style="background-color: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3); padding: 1.25rem; margin-bottom: 1.25rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; color: #38bdf8;"><i class="fa-solid fa-flag"></i> Module Assigned (0% Progress)</h4>
                <p style="font-size: 0.85rem; color: var(--text-main); margin-top: 0.25rem;">Click "Start Module" to begin learning and unlock the submission pipeline.</p>
              </div>
              <button class="btn btn-primary btn-lg" id="btn-start-module-action" style="width: 100%;">
                <i class="fa-solid fa-rocket"></i> 🚀 Start Module (0%)
              </button>
            </div>
          ` : mod.status === 'In Progress' ? `
            <form id="module-submit-form" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem;"><i class="fa-solid fa-upload text-primary"></i> Submit Work for Admin Verification</h4>
              
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="font-weight: 700;">Submission Summary / Notes</label>
                <textarea class="form-control" id="submission-text" required placeholder="Describe your completed work, code changes, and test verification..."></textarea>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="font-weight: 700;">
                  <i class="fa-solid fa-image text-primary"></i> Attach Verification Screenshot / Image
                </label>
                <input type="file" id="submission-image-picker" accept="image/*" class="form-control" style="padding: 0.4rem;">
                <div id="submission-image-preview-container" style="display: none; margin-top: 0.5rem;">
                  <img id="submission-image-preview" style="max-width: 220px; max-height: 140px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: cover;">
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label">Repository or PR Link (Optional)</label>
                <input type="url" class="form-control" id="submission-link" placeholder="https://github.com/hyna-studio/repo/pull/42">
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fa-solid fa-paper-plane"></i> Submit Module & Verification Image to Admin
              </button>
            </form>
          ` : mod.status === 'Submitted' && isManager ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; gap: 1rem;">
              <button class="btn btn-success btn-lg" id="approve-module-btn" style="flex: 1;">
                <i class="fa-solid fa-check-circle"></i> Verify & Approve Module (Unlock Next at 0%)
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

    let pendingSubmissionImage = null;
    const imgPicker = document.getElementById('submission-image-picker');
    imgPicker?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const dataUrl = await window.compressImageFile(file, 600, 600, 0.8);
          pendingSubmissionImage = dataUrl;
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            pendingSubmissionImage = evt.target.result;
            const prevContainer = document.getElementById('submission-image-preview-container');
            const prevImg = document.getElementById('submission-image-preview');
            if (prevContainer && prevImg) {
              prevImg.src = pendingSubmissionImage;
              prevContainer.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
          return;
        }

        const prevContainer = document.getElementById('submission-image-preview-container');
        const prevImg = document.getElementById('submission-image-preview');
        if (prevContainer && prevImg) {
          prevImg.src = pendingSubmissionImage;
          prevContainer.style.display = 'block';
        }
      }
    });

    let selectedTool = mod.selectedTool || 'VS Code';
    document.querySelectorAll('.tool-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolName = e.currentTarget.getAttribute('data-tool');
        const toolUrl = e.currentTarget.getAttribute('data-url');
        selectedTool = toolName;

        document.querySelectorAll('.tool-select-btn').forEach(b => {
          b.style.borderColor = 'var(--border-color)';
        });
        e.currentTarget.style.borderColor = '#38bdf8';

        const badge = document.getElementById('selected-tool-badge');
        if (badge) badge.innerText = `Active Environment: ${toolName} (Launching...)`;

        window.open(toolUrl, '_blank');
        window.appController?.showToast(`Selected ${toolName}. Application launched!`, 'info');
      });
    });

    document.getElementById('btn-start-module-action')?.addEventListener('click', () => {
      this.storage.startModule(modId);
      closeModal();
      window.appController?.showToast('Module Started! Work submission form unlocked.', 'success');
      const c = mainContainer || document.getElementById('app-content');
      if (c) this.renderModulesView(c);
      this.openModuleDetailModal(modId, c);
    });

    document.getElementById('module-submit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('submission-text').value;
      const link = document.getElementById('submission-link').value;
      this.storage.submitModule(modId, text, link, pendingSubmissionImage, selectedTool);
      closeModal();
      window.appController?.showToast(`Module & Verification Screenshot (${selectedTool}) submitted for Admin review!`, 'success');
      window.appController?.navigate('modules');
    });

    document.getElementById('approve-module-btn')?.addEventListener('click', () => {
      this.storage.approveModule(modId);
      closeModal();
      window.appController?.showToast('Module approved! Next module unlocked starting at 0%.', 'success');
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
