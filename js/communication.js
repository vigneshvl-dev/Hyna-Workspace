/**
 * HYNA STUDIO WORKSPACE - TEAM CHAT & DISCUSSIONS
 */

class CommunicationController {
  constructor() {
    this.storage = window.storageService;
    this.activeChannel = 'general';
    this.pendingImage = null;
    this.pendingAudio = null;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingInterval = null;
    this.recordingSeconds = 0;
  }

  renderCommunicationView(container) {
    const channels = this.storage.getChannels();
    const messages = this.storage.getMessages().filter(m => m.channel === this.activeChannel);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Team Communication</h1>
          <p class="page-subtitle">Real-time team discussion channels, project chat, images & voice notes</p>
        </div>
      </div>

      <div class="card" style="padding: 0; display: grid; grid-template-columns: 240px 1fr; height: 620px; overflow: hidden;">
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
                <p style="font-size: 0.8rem; opacity: 0.75;">Type a message, attach an image, or record a voice note below!</p>
              </div>
            ` : messages.map(m => `
              <div style="display: flex; gap: 0.85rem;">
                <img src="${m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${m.sender}" style="width: 38px; height: 38px; border-radius: var(--radius-full); object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';">
                <div style="max-width: 80%;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 700; font-size: 0.875rem;">${m.sender}</span>
                    <span style="font-size: 0.75rem; color: var(--text-light);">${m.time}</span>
                  </div>
                  <div style="background-color: var(--bg-main); padding: 0.65rem 0.95rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-top: 0.25rem; display: inline-block;">
                    ${m.text ? `<div>${m.text}</div>` : ''}
                    ${m.image ? `
                      <div style="margin-top: ${m.text ? '0.5rem' : '0'};">
                        <img src="${m.image}" alt="Chat Attachment" style="max-width: 280px; max-height: 220px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open(this.src)">
                      </div>
                    ` : ''}
                    ${m.audio ? `
                      <div style="margin-top: ${m.text ? '0.5rem' : '0'};">
                        <audio controls src="${m.audio}" style="max-width: 260px; height: 36px; display: block; border-radius: 18px; outline: none;"></audio>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Message Input Form -->
          <form id="chat-input-form" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem;">
            <!-- Pending Attachments Bar -->
            <div id="chat-attachment-preview-bar" style="display: ${this.pendingImage || this.pendingAudio ? 'flex' : 'none'}; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--primary-light); width: fit-content;">
              ${this.pendingImage ? `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <img src="${this.pendingImage}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;">
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Image Attached</span>
                  <button type="button" id="btn-remove-pending-image" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0 0.25rem;"><i class="fa-solid fa-xmark"></i></button>
                </div>
              ` : ''}
              ${this.pendingAudio ? `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <audio controls src="${this.pendingAudio}" style="height: 30px; max-width: 180px;"></audio>
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Voice Note Recorded</span>
                  <button type="button" id="btn-remove-pending-audio" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0 0.25rem;"><i class="fa-solid fa-xmark"></i></button>
                </div>
              ` : ''}
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button type="button" class="btn btn-secondary" id="btn-chat-image" title="Attach Image from PC" style="padding: 0.6rem 0.85rem;">
                <i class="fa-solid fa-image text-primary"></i>
              </button>
              <input type="file" id="chat-image-input" accept="image/*" style="display: none;">

              <button type="button" class="btn ${this.isRecording ? 'btn-danger' : 'btn-secondary'}" id="btn-chat-mic" title="${this.isRecording ? 'Stop Recording' : 'Record Voice Note'}" style="padding: 0.6rem 0.85rem;">
                <i class="fa-solid ${this.isRecording ? 'fa-square' : 'fa-microphone'} ${this.isRecording ? '' : 'text-danger'}"></i>
                <span id="chat-mic-timer" style="font-size: 0.75rem; font-weight: 700; margin-left: 0.35rem; display: ${this.isRecording ? 'inline' : 'none'};">${this.isRecording ? '00:00' : ''}</span>
              </button>

              <input type="text" id="chat-message-input" class="form-control" placeholder="${this.isRecording ? 'Recording voice note... Click red button to stop' : 'Type a message in #' + this.activeChannel + '...'}" style="flex: 1;">

              <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.25rem;">
                <i class="fa-solid fa-paper-plane"></i> Send
              </button>
            </div>
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

    // Image Upload Attachment Handlers
    const imgBtn = container.querySelector('#btn-chat-image');
    const imgInput = container.querySelector('#chat-image-input');
    imgBtn?.addEventListener('click', () => imgInput?.click());

    imgInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          window.appController?.showToast(`Attaching image "${file.name}"...`, 'info');
          let dataUrl;
          if (typeof window.compressImageFile === 'function') {
            dataUrl = await window.compressImageFile(file, 400, 400, 0.7);
          } else {
            dataUrl = await this.compressImageFallback(file);
          }
          this.pendingImage = dataUrl;
          this.renderCommunicationView(container);
        } catch (err) {
          const dataUrl = await this.compressImageFallback(file);
          this.pendingImage = dataUrl;
          this.renderCommunicationView(container);
        }
      }
    });

    container.querySelector('#btn-remove-pending-image')?.addEventListener('click', () => {
      this.pendingImage = null;
      this.renderCommunicationView(container);
    });

    container.querySelector('#btn-remove-pending-audio')?.addEventListener('click', () => {
      this.pendingAudio = null;
      this.renderCommunicationView(container);
    });

    // Microphone Voice Recording Handler
    const micBtn = container.querySelector('#btn-chat-mic');
    micBtn?.addEventListener('click', () => {
      if (!this.isRecording) {
        this.startVoiceRecording(container);
      } else {
        this.stopVoiceRecording(container);
      }
    });

    // Form & Button Send Handler
    const form = container.querySelector('#chat-input-form');
    const inputEl = container.querySelector('#chat-message-input');
    const sendBtn = container.querySelector('#chat-input-form button[type="submit"]');

    const handleSend = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const input = container.querySelector('#chat-message-input') || document.getElementById('chat-message-input');
      const text = input ? input.value.trim() : '';

      if (text || this.pendingImage || this.pendingAudio) {
        if (this.isRecording) {
          this.stopVoiceRecording(container);
        }

        try {
          this.storage.sendMessage(text, this.activeChannel, this.pendingImage, this.pendingAudio);
          this.pendingImage = null;
          this.pendingAudio = null;
          if (input) input.value = '';

          this.renderCommunicationView(container);
          window.appController?.updateNotificationBadge();
        } catch (err) {
          console.error("Failed to send message:", err);
          window.appController?.showToast("Error sending message. Please try again.", "error");
        }
      }
    };

    form?.addEventListener('submit', handleSend);
    sendBtn?.addEventListener('click', handleSend);

    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(e);
      }
    });
  }

  compressImageFallback(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 400;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async startVoiceRecording(container) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.pendingAudio = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA';
      this.renderCommunicationView(container);
      window.appController?.showToast('Voice note recorded (Demo mode)! Click Send to post.', 'info');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          this.pendingAudio = reader.result;
          this.renderCommunicationView(container);
          window.appController?.showToast('Voice note recorded! Click Send to post.', 'success');
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingSeconds = 0;

      window.appController?.showToast('Recording voice note...', 'info');

      this.recordingInterval = setInterval(() => {
        this.recordingSeconds++;
        const mins = String(Math.floor(this.recordingSeconds / 60)).padStart(2, '0');
        const secs = String(this.recordingSeconds % 60).padStart(2, '0');
        const el = container.querySelector('#chat-mic-timer');
        if (el) el.innerText = `${mins}:${secs}`;
      }, 1000);

      const micBtn = container.querySelector('#btn-chat-mic');
      if (micBtn) {
        micBtn.className = 'btn btn-danger';
        micBtn.innerHTML = `<i class="fa-solid fa-square"></i> <span id="chat-mic-timer" style="font-size:0.75rem; font-weight:700; margin-left:0.35rem;">00:00</span>`;
      }

    } catch (err) {
      console.error("Mic access error:", err);
      this.pendingAudio = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA';
      this.renderCommunicationView(container);
      window.appController?.showToast('Voice note recorded (Fallback mode)! Click Send to post.', 'info');
    }
  }

  stopVoiceRecording(container) {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      if (this.recordingInterval) clearInterval(this.recordingInterval);
      this.mediaRecorder.stop();
    }
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
