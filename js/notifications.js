/**
 * HYNA STUDIO WORKSPACE - NOTIFICATION CONTROLLER
 */

class NotificationController {
  constructor() {
    this.storage = window.storageService;
  }

  renderNotificationsView(container) {
    const notifications = this.storage.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Notifications Hub</h1>
          <p class="page-subtitle">Stay updated on module unlocks, task assignments, and workspace events</p>
        </div>
        <button class="btn btn-secondary btn-sm" id="mark-all-read-btn">
          <i class="fa-solid fa-check-double"></i> Mark All as Read
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-bell text-primary"></i> Recent Alerts (${unreadCount} Unread)</h3>
        </div>
        <div class="notifications-list" id="notif-list-container">
          ${notifications.length === 0 ? `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
              <i class="fa-solid fa-bell-slash" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
              <p>No notifications yet</p>
            </div>
          ` : notifications.map(n => `
            <div class="feed-item ${n.read ? '' : 'unread'}" style="padding: 1rem; ${n.read ? '' : 'background-color: var(--primary-light); border-radius: var(--radius-md); margin-bottom: 0.5rem;'}">
              <div class="feed-icon" style="${n.read ? '' : 'background-color: var(--primary); color: #fff;'}">
                <i class="fa-solid ${n.category === 'Module' ? 'fa-book-open' : n.category === 'Task' ? 'fa-check-square' : 'fa-calendar-alt'}"></i>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span class="feed-title">${n.title}</span>
                  <span class="badge ${n.category === 'Module' ? 'badge-primary' : 'badge-warning'}">${n.category}</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${n.message}</p>
                <span class="feed-time"><i class="fa-regular fa-clock"></i> ${n.timestamp}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('mark-all-read-btn')?.addEventListener('click', () => {
      this.storage.markAllNotificationsRead();
      this.renderNotificationsView(container);
      window.appController?.updateNotificationBadge();
    });
  }
}

window.notificationController = new NotificationController();
