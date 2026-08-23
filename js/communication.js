/**
 * HYNA STUDIO WORKSPACE - TEAM CHAT & DISCUSSIONS
 */

class CommunicationController {
  constructor() {
    this.storage = window.storageService;
    this.activeChannel = 'general';
  }

  renderCommunicationView(container) {
    const messages = this.storage.getMessages().filter(m => m.channel === this.activeChannel);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Team Communication</h1>
          <p class="page-subtitle">Real-time team discussion channels and project chat</p>
        </div>
      </div>

      <div class="card" style="padding: 0; display: grid; grid-template-columns: 240px 1fr; height: 600px; overflow: hidden;">
        <!-- Channels Sidebar -->
        <div style="background-color: var(--bg-main); border-right: 1px solid var(--border-color); padding: 1.25rem;">
          <h4 style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.85rem;">Channels</h4>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button class="channel-btn ${this.activeChannel === 'general' ? 'active' : ''}" data-channel="general" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: none; background: ${this.activeChannel === 'general' ? 'var(--primary-light)' : 'transparent'}; color: ${this.activeChannel === 'general' ? 'var(--primary)' : 'var(--text-main)'}; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-align: left;">
              <i class="fa-solid fa-hashtag"></i> general
            </button>
            <button class="channel-btn ${this.activeChannel === 'project-hyna' ? 'active' : ''}" data-channel="project-hyna" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: none; background: ${this.activeChannel === 'project-hyna' ? 'var(--primary-light)' : 'transparent'}; color: ${this.activeChannel === 'project-hyna' ? 'var(--primary)' : 'var(--text-main)'}; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-align: left;">
              <i class="fa-solid fa-hashtag"></i> project-hyna
            </button>
            <button class="channel-btn ${this.activeChannel === 'announcements' ? 'active' : ''}" data-channel="announcements" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: none; background: ${this.activeChannel === 'announcements' ? 'var(--primary-light)' : 'transparent'}; color: ${this.activeChannel === 'announcements' ? 'var(--primary)' : 'var(--text-main)'}; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-align: left;">
              <i class="fa-solid fa-bullhorn"></i> announcements
            </button>
          </div>
        </div>

        <!-- Chat Area -->
        <div style="display: flex; flex-direction: column; height: 100%;">
          <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-hashtag text-primary"></i> ${this.activeChannel}
          </div>

          <!-- Messages Stream -->
          <div style="flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;" id="chat-messages-container">
            ${messages.length === 0 ? `
              <div style="text-align: center; margin: auto; color: var(--text-muted); padding: 2rem;">
                <i class="fa-solid fa-comments text-primary" style="font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.6;"></i>
                <p style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem;">No messages in #${this.activeChannel} yet</p>
                <p style="font-size: 0.8rem; opacity: 0.75;">Type a message below to start the conversation with all team members!</p>
              </div>
            ` : messages.map(m => `
              <div style="display: flex; gap: 0.85rem;">
                <img src="${m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width: 38px; height: 38px; border-radius: var(--radius-full); object-fit: cover;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 700; font-size: 0.875rem;">${m.sender}</span>
                    <span style="font-size: 0.75rem; color: var(--text-light);">${m.time}</span>
                  </div>
                  <div style="background-color: var(--bg-main); padding: 0.65rem 0.95rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-top: 0.25rem; display: inline-block;">
                    ${m.text}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Message Input Form -->
          <form id="chat-input-form" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; gap: 0.75rem;">
            <input type="text" id="chat-message-input" class="form-control" placeholder="Type a message in #${this.activeChannel}..." required style="flex: 1;">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Send</button>
          </form>
        </div>
      </div>
    `;

    this.attachEvents(container);

    // Auto scroll chat stream to bottom
    const msgContainer = container.querySelector('#chat-messages-container');
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  attachEvents(container) {
    container.querySelectorAll('.channel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeChannel = e.currentTarget.dataset.channel;
        this.renderCommunicationView(container);
      });
    });

    container.querySelector('#chat-input-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-message-input');
      const text = input.value.trim();
      if (text) {
        this.storage.sendMessage(text, this.activeChannel);
        input.value = '';
        this.renderCommunicationView(container);
        window.appController?.updateNotificationBadge();
      }
    });
  }
}

window.communicationController = new CommunicationController();
