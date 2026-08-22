/**
 * HYNA STUDIO WORKSPACE - TEAM DIRECTORY CONTROLLER
 */

class TeamController {
  constructor() {
    this.storage = window.storageService;
  }

  renderTeamView(container) {
    const users = this.storage.getUsers();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Team Directory</h1>
          <p class="page-subtitle">Hyna Studio employee profiles, roles, and status</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${users.map(u => `
          <div class="card" style="text-align: center;">
            <img src="${u.avatar}" alt="${u.name}" style="width: 80px; height: 80px; border-radius: var(--radius-full); object-fit: cover; margin: 0 auto 1rem auto; border: 3px solid var(--primary-light);">
            <h3 style="font-size: 1.1rem; font-weight: 800;">${u.name}</h3>
            <span class="badge badge-primary" style="margin: 0.35rem 0 0.75rem 0;">${u.role}</span>
            <p style="font-size: 0.8rem; color: var(--text-muted); mb-2">${u.department}</p>
            <p style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">${u.email}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}

window.teamController = new TeamController();
