/**
 * HYNA STUDIO WORKSPACE - TEAM CHAT & DISCUSSIONS
 */

class CommunicationController {
  constructor() {
    this.storage = window.storageService;
    this.activeChannel = 'general';
  }

  renderCommunicationView(container) {
    const channels = this.storage.getChannels();
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
        <div style="background-color: var(--bg-main); border-right: 1px solid var(--border-color); padding: 1.25rem; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h4 style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin: 0;">Channels</h4>
            <button id="btn-create-channel" title="Create New Channel" style="background: var(--primary-light); color: var(--primary); border: none; border-radius: var(--radius-full); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto;">
            ${channels.map(c => `
              <button class="channel-btn ${this.activeChannel === c.id ? 'active' : ''}" data-channel="${c.id}" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: none; background: ${this.activeChannel === c.id ? 'var(--primary-light)' : 'transparent'}; color: ${this.activeChannel === c.id ? 'var(--primary)' : 'var(--text-main)'}; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-align: left; width: 100%;">
                <i class="fa-solid ${c.icon || 'fa-hashtag'}"></i> ${c.name}
              </button>
            `).join('')}
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
                <img src="${m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${m.sender}" style="width: 38px; height: 38px; border-radius: var(--radius-full); object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';">
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

    container.querySelector('#btn-create-channel')?.addEventListener('click', () => {
      this.openCreateChannelModal(container);
    });

    const form = container.querySelector('#chat-input-form');
    const handleSend = (e) => {
      if (e) e.preventDefault();
      const input = container.querySelector('#chat-message-input') || document.getElementById('chat-message-input');
      if (!input) return;
      const text = input.value.trim();
      if (text) {
        this.storage.sendMessage(text, this.activeChannel);
        input.value = '';
        this.renderCommunicationView(container);
        window.appController?.updateNotificationBadge();
      }
    };

    form?.addEventListener('submit', handleSend);
  }

  openCreateChannelModal(container) {
    let modalContainer = document.getElementById('channel-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'channel-modal-container';
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width: 440px; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-plus-circle text-primary"></i> Create New Channel
            </h3>
            <button class="btn btn-secondary btn-sm" id="close-channel-modal-btn" style="padding: 0.2rem 0.5rem;">&times;</button>
          </div>

          <form id="create-channel-form">
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" style="font-size: 0.85rem; margin-bottom: 0.5rem; display: block;">Channel Name</label>
              <div style="position: relative; display: flex; align-items: center;">
                <span style="position: absolute; left: 0.85rem; color: var(--text-muted); font-weight: 700;">#</span>
                <input type="text" id="new-channel-name" class="form-control" placeholder="e.g. frontend-team, design-sprint" required style="padding-left: 2rem;" autofocus>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">Names are lowercased and hyphenated (e.g. <code>project-hyna</code>).</p>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" id="cancel-channel-modal-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-check"></i> Create Channel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#close-channel-modal-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-channel-modal-btn')?.addEventListener('click', closeModal);

    modalContainer.querySelector('#create-channel-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = modalContainer.querySelector('#new-channel-name');
      const rawName = nameInput ? nameInput.value : '';

      const result = this.storage.createChannel(rawName);
      if (result.success) {
        this.activeChannel = result.channel.id;
        closeModal();
        window.appController?.showToast(`Created channel #${result.channel.name}!`, 'success');
        this.renderCommunicationView(container);
      } else {
        window.appController?.showToast(result.error || 'Failed to create channel', 'error');
      }
    });
  }
}

window.communicationController = new CommunicationController();
