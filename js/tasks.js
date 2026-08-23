/**
 * HYNA STUDIO WORKSPACE - TASK MANAGEMENT CONTROLLER
 */

class TaskController {
  constructor() {
    this.storage = window.storageService;
    this.auth = window.authService;
    this.viewMode = 'kanban'; // 'kanban' or 'list'
  }

  renderTasksView(container) {
    const tasks = this.storage.getTasks();
    const isManager = this.auth.isManagerOrAdmin();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Tasks Management</h1>
          <p class="page-subtitle">Track deliverables, assign tasks, and monitor task status</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary btn-sm" id="toggle-view-btn">
            <i class="fa-solid ${this.viewMode === 'kanban' ? 'fa-list' : 'fa-columns'}"></i>
            ${this.viewMode === 'kanban' ? 'Switch to List View' : 'Switch to Kanban Board'}
          </button>
          ${isManager ? `
            <button class="btn btn-primary btn-sm" id="create-task-btn">
              <i class="fa-solid fa-plus"></i> New Task
            </button>
          ` : ''}
        </div>
      </div>

      ${this.viewMode === 'kanban' ? this.renderKanbanBoard(tasks) : this.renderListView(tasks)}
    `;

    this.attachEvents(container);
  }

  renderKanbanBoard(tasks) {
    const columns = [
      { id: 'Pending', name: 'Pending', icon: 'fa-circle', color: '#64748b' },
      { id: 'In Progress', name: 'In Progress', icon: 'fa-spinner', color: '#2563eb' },
      { id: 'Submitted', name: 'Submitted for Review', icon: 'fa-paper-plane', color: '#d97706' },
      { id: 'Completed', name: 'Completed', icon: 'fa-circle-check', color: '#10b981' }
    ];

    return `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; overflow-x: auto;">
        ${columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return `
            <div class="card" style="background-color: var(--bg-main); border: 1px solid var(--border-color); padding: 1rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 2px solid ${col.color}; padding-bottom: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                  <i class="fa-solid ${col.icon}" style="color: ${col.color};"></i> ${col.name}
                </span>
                <span class="badge badge-neutral">${colTasks.length}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${colTasks.map(t => `
                  <div class="card task-card" style="padding: 1rem; cursor: pointer;" data-id="${t.id}">
                    <span class="badge ${t.priority === 'Urgent' ? 'badge-danger' : t.priority === 'High' ? 'badge-warning' : 'badge-primary'}" style="margin-bottom: 0.4rem;">
                      ${t.priority}
                    </span>
                    <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.25rem;">${t.title}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted); mb-2">${t.project}</p>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-light);">
                      <span><i class="fa-regular fa-user"></i> ${t.assignedTo}</span>
                      <span><i class="fa-regular fa-clock"></i> ${t.deadline}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderListView(tasks) {
    return `
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
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
              ${tasks.map(t => `
                <tr>
                  <td style="font-weight: 700;">${t.title}</td>
                  <td>${t.project}</td>
                  <td>${t.assignedTo}</td>
                  <td><span class="badge ${t.priority === 'Urgent' ? 'badge-danger' : t.priority === 'High' ? 'badge-warning' : 'badge-primary'}">${t.priority}</span></td>
                  <td>${t.deadline}</td>
                  <td><span class="badge ${t.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${t.status}</span></td>
                  <td>
                    <select class="form-control status-select" data-id="${t.id}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
                      <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option value="Submitted" ${t.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                      <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

    container.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const taskId = e.currentTarget.dataset.id;
        this.openTaskDetailModal(taskId, container);
      });
    });

    container.querySelector('#toggle-view-btn')?.addEventListener('click', () => {
      this.viewMode = this.viewMode === 'kanban' ? 'list' : 'kanban';
      this.renderTasksView(container);
    });

    container.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const taskId = e.target.dataset.id;
        const newStatus = e.target.value;
        this.storage.updateTaskStatus(taskId, newStatus);
        window.appController?.showToast(`Task status updated to ${newStatus}`, 'info');
      });
    });

    container.querySelector('#create-task-btn')?.addEventListener('click', () => {
      this.openCreateTaskModal(container);
    });
  }

  openTaskDetailModal(taskId, container) {
    const tasks = this.storage.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'Pending') {
      this.storage.updateTaskStatus(taskId, 'In Progress');
      task.status = 'In Progress';
    }

    const modalHTML = `
      <div class="modal-overlay active" id="task-modal-overlay">
        <div class="modal-card" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <span class="badge ${task.priority === 'Urgent' ? 'badge-danger' : task.priority === 'High' ? 'badge-warning' : 'badge-primary'}">${task.priority} Priority</span>
              <h2 class="modal-title" style="margin-top: 0.25rem;">${task.title}</h2>
            </div>
            <button class="modal-close-btn" id="close-task-modal-btn"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.25rem;">Project: <strong>${task.project}</strong></p>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Assigned To: <strong>${task.assignedTo}</strong> • Deadline: <strong>${task.deadline}</strong></p>
          </div>

          ${task.status === 'Submitted' ? `
            <div class="card" style="background-color: var(--warning-light); border-color: var(--warning-border); padding: 1.25rem; margin-bottom: 1.25rem;">
              <h4 style="font-size: 0.85rem; font-weight: 700; color: #b45309;"><i class="fa-solid fa-clock"></i> Work Submitted (Under Review by Admin)</h4>
              <p style="font-size: 0.85rem; margin-top: 0.25rem; color: #78350f;"><strong>Notes:</strong> ${task.submissionText || 'Pending Admin verification'}</p>
              ${task.submissionImage ? `
                <div style="margin-top: 0.75rem;">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #78350f; display: block; margin-bottom: 0.25rem;">Verification Screenshot:</label>
                  <img src="${task.submissionImage}" alt="Verification Screenshot" style="max-width: 280px; max-height: 180px; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)">
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${task.status === 'In Progress' ? `
            <form id="task-submit-form" style="border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem;"><i class="fa-solid fa-upload text-primary"></i> Submit Task Work for Admin Review</h4>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="font-weight: 700;">Completion Notes / Summary</label>
                <textarea class="form-control" id="task-submit-text" required placeholder="Describe what was built, changes made, and test results..."></textarea>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="font-weight: 700;">
                  <i class="fa-solid fa-image text-primary"></i> Attach Verification Screenshot / Image
                </label>
                <input type="file" id="task-submit-image-picker" accept="image/*" class="form-control" style="padding: 0.4rem;">
                <div id="task-img-preview-container" style="display: none; margin-top: 0.5rem;">
                  <img id="task-img-preview" style="max-width: 220px; max-height: 140px; border-radius: 8px; border: 1px solid var(--border-color); object-fit: cover;">
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label">Deliverable PR / Link (Optional)</label>
                <input type="url" class="form-control" id="task-submit-link" placeholder="https://github.com/hyna/repo/pull/12">
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fa-solid fa-paper-plane"></i> Submit Task & Verification Image to Admin
              </button>
            </form>
          ` : task.status === 'Completed' ? `
            <div class="badge badge-success" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.9rem;">
              <i class="fa-solid fa-circle-check"></i> Task Work Verified & Approved by Admin
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('task-modal-overlay');
    const closeBtn = document.getElementById('close-task-modal-btn');
    const closeModal = () => overlay.remove();

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    let pendingTaskImage = null;
    const imgPicker = document.getElementById('task-submit-image-picker');
    imgPicker?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const dataUrl = await window.compressImageFile(file, 600, 600, 0.8);
          pendingTaskImage = dataUrl;
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            pendingTaskImage = evt.target.result;
            const prevContainer = document.getElementById('task-img-preview-container');
            const prevImg = document.getElementById('task-img-preview');
            if (prevContainer && prevImg) {
              prevImg.src = pendingTaskImage;
              prevContainer.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
          return;
        }

        const prevContainer = document.getElementById('task-img-preview-container');
        const prevImg = document.getElementById('task-img-preview');
        if (prevContainer && prevImg) {
          prevImg.src = pendingTaskImage;
          prevContainer.style.display = 'block';
        }
      }
    });

    document.getElementById('task-submit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('task-submit-text').value;
      const link = document.getElementById('task-submit-link').value;
      this.storage.submitTask(taskId, text, link, pendingTaskImage);
      closeModal();
      window.appController?.showToast('Task work submitted for Admin verification!', 'success');
      this.renderTasksView(container);
    });
  }

  openCreateTaskModal(container) {
    const modalHTML = `
      <div class="modal-overlay active" id="create-task-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">Assign New Task</h2>
            <button class="modal-close-btn" id="close-create-task"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form id="create-task-form">
            <div class="form-group">
              <label class="form-label">Task Title</label>
              <input type="text" class="form-control" id="task-title" required placeholder="e.g. Implement OAuth Flow">
            </div>
            <div class="form-group">
              <label class="form-label">Project</label>
              <input type="text" class="form-control" id="task-project" required value="Hyna Workspace SaaS">
            </div>
            <div class="form-group">
              <label class="form-label">Assigned Employee</label>
              <input type="text" class="form-control" id="task-assignee" required value="Alex Morgan">
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-control" id="task-priority">
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Deadline</label>
              <input type="date" class="form-control" id="task-date" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Assign Task</button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('create-task-modal');
    document.getElementById('close-create-task').addEventListener('click', () => overlay.remove());

    document.getElementById('create-task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.storage.createTask({
        title: document.getElementById('task-title').value,
        project: document.getElementById('task-project').value,
        assignedTo: document.getElementById('task-assignee').value,
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-date').value
      });
      overlay.remove();
      window.appController?.showToast('New task assigned!', 'success');
      this.renderTasksView(container);
    });
  }
}

window.taskController = new TaskController();
