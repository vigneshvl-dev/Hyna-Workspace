/**
 * HYNA STUDIO WORKSPACE - ATTENDANCE SYSTEM CONTROLLER
 */

class AttendanceController {
  constructor() {
    this.storage = window.storageService;
    this.timerInterval = null;
    this.secondsWorked = 4 * 3600 + 32 * 60 + 15; // default live ticker base
  }

  renderAttendanceView(container) {
    const logs = this.storage.getAttendance();
    const todayLog = logs.find(l => l.date === new Date().toISOString().split('T')[0]);
    const isCheckedIn = todayLog && todayLog.status === 'Checked In';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Attendance Tracker</h1>
          <p class="page-subtitle">Log daily working hours, track monthly attendance metrics and leave balance</p>
        </div>
      </div>

      <div class="attendance-hero-card">
        <div class="clock-widget-box">
          <span class="clock-status-pill ${isCheckedIn ? 'clock-status-checked-in' : 'clock-status-checked-out'}">
            <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i>
            Status: ${isCheckedIn ? 'Checked In' : 'Not Checked In'}
          </span>
          <div class="live-time-ticker" id="live-timer-display">${this.formatDuration(this.secondsWorked)}</div>
          <div class="live-date-display"><i class="fa-regular fa-calendar-days"></i> ${new Date().toDateString()}</div>
          <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            ${!isCheckedIn ? `
              <button class="btn btn-success btn-lg" id="check-in-btn">
                <i class="fa-solid fa-play"></i> Check In
              </button>
            ` : `
              <button class="btn btn-danger btn-lg" id="check-out-btn">
                <i class="fa-solid fa-stop"></i> Check Out
              </button>
            `}
          </div>
        </div>

        <div class="attendance-stats-summary">
          <div class="stat-box-item">
            <div class="stat-box-title">Monthly Attendance</div>
            <div class="stat-box-value" style="color: var(--primary);">92%</div>
            <span style="font-size: 0.75rem; color: var(--success); font-weight: 700;">+4% from last month</span>
          </div>
          <div class="stat-box-item">
            <div class="stat-box-title">Present Days</div>
            <div class="stat-box-value" style="color: var(--success);">18 Days</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Out of 20 working days</span>
          </div>
          <div class="stat-box-item">
            <div class="stat-box-title">Total Hours Logged</div>
            <div class="stat-box-value" style="color: #9333ea;">154.5 hrs</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Avg 8.1 hrs/day</span>
          </div>
          <div class="stat-box-item">
            <div class="stat-box-title">Leave Balance</div>
            <div class="stat-box-value" style="color: var(--warning);">4 Days</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Remaining paid leave</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-history text-primary"></i> Attendance History</h3>
          <span class="badge badge-neutral">August 2026</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td style="font-weight: 700;">${log.date}</td>
                  <td>${log.checkIn}</td>
                  <td>${log.checkOut || '—'}</td>
                  <td style="font-weight: 600;">${log.workingTime}</td>
                  <td>
                    <span class="badge ${log.status === 'Present' ? 'badge-success' : log.status === 'Checked In' ? 'badge-primary' : 'badge-warning'}">
                      ${log.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachEvents(container);
    this.startLiveTimer(isCheckedIn);
  }

  attachEvents(container) {
    container.querySelector('#check-in-btn')?.addEventListener('click', () => {
      this.storage.checkIn();
      window.appController?.showToast('Successfully Checked In! Timer started.', 'success');
      this.renderAttendanceView(container);
    });

    container.querySelector('#check-out-btn')?.addEventListener('click', () => {
      this.storage.checkOut();
      window.appController?.showToast('Checked Out successfully.', 'info');
      this.renderAttendanceView(container);
    });
  }

  startLiveTimer(isCheckedIn) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (isCheckedIn) {
      this.timerInterval = setInterval(() => {
        this.secondsWorked++;
        const el = document.getElementById('live-timer-display');
        if (el) el.innerText = this.formatDuration(this.secondsWorked);
      }, 1000);
    }
  }

  formatDuration(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs}h ${mins < 10 ? '0' + mins : mins}m ${secs < 10 ? '0' + secs : secs}s`;
  }
}

window.attendanceController = new AttendanceController();
