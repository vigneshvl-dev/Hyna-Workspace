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
          <p class="page-subtitle">Hyna Studio employee profiles, roles, and status (${users.length} Team Members)</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem;">
        ${users.map(u => `
          <div class="card" style="text-align: center; position: relative; padding: 1.5rem 1rem;">
            ${u.id !== 'user-001' && u.empId !== 'EMP-001' ? `
              <button class="btn btn-secondary btn-sm btn-delete-team-member" data-id="${u.id}" data-name="${u.name}" style="position: absolute; top: 1rem; left: 1rem; padding: 0.25rem 0.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);" title="Delete Employee">
                <i class="fa-solid fa-trash text-danger" style="font-size: 0.8rem;"></i>
              </button>
            ` : ''}
            <div style="position: absolute; top: 1rem; right: 1rem;">
              <span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}" style="font-size: 0.65rem;">
                <i class="fa-solid fa-circle" style="font-size: 0.45rem;"></i> ${u.status || 'Active'}
              </span>
            </div>
            <img src="${u.avatar}" alt="${u.name}" style="width: 80px; height: 80px; border-radius: var(--radius-full); object-fit: cover; margin: 0 auto 0.85rem auto; border: 3px solid var(--primary-light); box-shadow: 0 4px 12px rgba(0,0,0,0.08);" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.2rem;">${u.name}</h3>
            <div style="font-size: 0.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; letter-spacing: 0.05em;">${u.empId || 'EMP'}</div>
            <span class="badge badge-primary" style="margin-bottom: 0.6rem;">${u.role}</span>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 600;">${u.department || 'General'}</p>
            <a href="mailto:${u.email}" style="font-size: 0.78rem; color: var(--secondary); font-weight: 600; text-decoration: none;">
              <i class="fa-regular fa-envelope" style="margin-right: 0.25rem;"></i>${u.email}
            </a>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-delete-team-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        if (confirm(`Are you sure you want to delete "${name}" from the team directory?`)) {
          this.storage.deleteUser(id);
          window.appController?.showToast(`Deleted employee "${name}"`, 'info');
          this.renderTeamView(container);
        }
      });
    });
  }
}

window.teamController = new TeamController();
