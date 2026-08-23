/**
 * HYNA STUDIO WORKSPACE - CALENDAR CONTROLLER
 */

class CalendarController {
  constructor() {
    this.storage = window.storageService;
  }

  renderCalendarView(container) {
    const events = this.storage.getEvents();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Workspace Calendar</h1>
          <p class="page-subtitle">Meetings, module deadlines, and company events</p>
        </div>
      </div>

      <div class="calendar-layout-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-regular fa-calendar-days text-primary"></i> August 2026</h3>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm"><i class="fa-solid fa-chevron-left"></i></button>
              <button class="btn btn-secondary btn-sm"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>

          <!-- Responsive Touch Scroll Wrapper -->
          <div class="table-responsive" style="overflow-x: auto; -webkit-overflow-scrolling: touch; border: none; padding-bottom: 0.5rem;">
            <div style="min-width: 620px;">
              <!-- Calendar Header Days -->
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-weight: 700; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
              </div>
              
              <!-- Calendar 31-Day Matrix -->
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                ${Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
                  const dayEvents = events.filter(e => e.date === dateStr);
                  return `
                    <div style="min-height: 75px; background-color: ${day === 22 ? 'var(--primary-light)' : 'var(--bg-main)'}; border: 1px solid ${day === 22 ? 'var(--primary)' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 0.4rem; text-align: right;">
                      <span style="font-size: 0.8rem; font-weight: 700; color: ${day === 22 ? 'var(--primary)' : 'var(--text-main)'};">${day}</span>
                      ${dayEvents.map(e => `
                        <div class="badge ${e.type === 'Deadline' ? 'badge-danger' : e.type === 'Meeting' ? 'badge-primary' : 'badge-purple'}" style="display: block; font-size: 0.65rem; padding: 2px 4px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left;">
                          ${e.title}
                        </div>
                      `).join('')}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i class="fa-solid fa-list-ul text-primary"></i> Scheduled Events</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${events.map(e => `
              <div style="padding: 0.85rem; background: var(--bg-main); border-radius: var(--radius-md); border-left: 4px solid ${e.type === 'Deadline' ? 'var(--danger)' : 'var(--primary)'};">
                <div style="font-size: 0.85rem; font-weight: 700;">${e.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                  <i class="fa-regular fa-clock"></i> ${e.date} at ${e.time}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

window.calendarController = new CalendarController();
