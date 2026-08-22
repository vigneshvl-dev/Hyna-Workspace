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

  attachEvents(container) {
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
