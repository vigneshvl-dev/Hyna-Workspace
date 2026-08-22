/**
 * HYNA STUDIO WORKSPACE - PROJECT MANAGEMENT CONTROLLER
 */

class ProjectController {
  constructor() {
    this.storage = window.storageService;
  }

  renderProjectsView(container) {
    const projects = this.storage.getProjects();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Active Projects</h1>
          <p class="page-subtitle">Track project health, team allocations, and milestone deliverables</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
        ${projects.map(p => `
          <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; font-weight: 800;">${p.name}</h3>
              <span class="badge ${p.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${p.status}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.5;">${p.description}</p>
            
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem;">
                <span>Overall Progress</span>
                <span>${p.progress}%</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${p.progress}%;"></div>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
              <div><i class="fa-solid fa-users"></i> ${p.teamMembers.length} Members</div>
              <div><i class="fa-regular fa-calendar"></i> Due ${p.deadline}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

window.projectController = new ProjectController();
