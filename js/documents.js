class DocumentController {
  constructor() {
    this.storage = window.storageService;
  }

  getFileIconClass(type) {
    const t = (type || '').toUpperCase();
    if (['IMAGE', 'PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(t)) return 'fa-file-image text-success';
    if (['AUDIO', 'WEBM', 'MP3', 'WAV', 'M4A', 'OGG'].includes(t)) return 'fa-file-audio text-warning';
    if (t === 'PDF') return 'fa-file-pdf text-danger';
    if (['DOCX', 'DOC'].includes(t)) return 'fa-file-word text-info';
    if (['MD', 'JS', 'JSON', 'HTML', 'CSS', 'TXT'].includes(t)) return 'fa-file-code text-primary';
    return 'fa-file text-muted';
  }

  renderDocumentsView(container) {
    const docs = this.storage.getDocuments();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Document Vault</h1>
          <p class="page-subtitle">Project deliverables, company guidelines, images, and voice recordings</p>
        </div>
        <button class="btn btn-primary" id="upload-doc-btn">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Document / File
        </button>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-folder-open text-primary"></i> Workspace Files (${docs.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Category</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${docs.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    <i class="fa-solid fa-folder-open" style="font-size: 2rem; opacity: 0.5; margin-bottom: 0.5rem; display: block;"></i>
                    No documents uploaded yet. Click "Upload Document / File" above!
                  </td>
                </tr>
              ` : docs.map(d => `
                <tr>
                  <td style="font-weight: 700;">
                    <i class="fa-solid ${this.getFileIconClass(d.type)}" style="margin-right: 0.5rem; font-size: 1.1rem;"></i>
                    ${d.name}
                  </td>
                  <td><span class="badge badge-neutral">${d.category || 'General'}</span></td>
                  <td>${d.uploadedBy || 'Employee'}</td>
                  <td>${d.date || 'Today'}</td>
                  <td>${d.size || 'N/A'}</td>
                  <td style="display: flex; gap: 0.4rem; align-items: center;">
                    <button class="btn btn-secondary btn-sm download-doc-btn" data-name="${d.name}" data-url="${d.fileData || ''}">
                      <i class="fa-solid fa-download"></i> Download
                    </button>
                    ${d.fileData && (d.type === 'IMAGE' || d.type === 'PNG' || d.type === 'JPG') ? `
                      <button class="btn btn-secondary btn-sm preview-doc-btn" data-url="${d.fileData}" title="Preview Image">
                        <i class="fa-solid fa-eye text-primary"></i>
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.download-doc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.dataset.name;
        const url = e.currentTarget.dataset.url;
        if (url && url.startsWith('data:')) {
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.click();
        }
        window.appController?.showToast(`Downloading file: ${name}`, 'success');
      });
    });

    container.querySelectorAll('.preview-doc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = e.currentTarget.dataset.url;
        if (url) window.open(url);
      });
    });

    container.querySelector('#upload-doc-btn')?.addEventListener('click', () => {
      this.openUploadModal(container);
    });
  }

  openUploadModal(container) {
    let modalContainer = document.getElementById('doc-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'doc-modal-container';
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop">
        <div class="admin-modal" style="max-width: 480px; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="margin: 0; font-weight: 800; font-size: 1.15rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-cloud-arrow-up text-primary"></i> Upload Workspace File
            </h3>
            <button class="btn btn-secondary btn-sm" id="close-doc-modal-btn" style="padding: 0.2rem 0.5rem;">&times;</button>
          </div>

          <form id="upload-doc-form">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-size: 0.85rem; margin-bottom: 0.4rem; display: block;">Select File (Document, Image, Audio/Voice)</label>
              <input type="file" id="doc-file-picker" class="form-control" required style="padding: 0.4rem;">
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-size: 0.85rem; margin-bottom: 0.4rem; display: block;">Display Name</label>
              <input type="text" id="doc-display-name" class="form-control" placeholder="File name" required>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" style="font-size: 0.85rem; margin-bottom: 0.4rem; display: block;">Category</label>
              <select id="doc-category-select" class="form-control">
                <option value="Project Files">Project Files</option>
                <option value="Images">Images & Photos</option>
                <option value="Voice Recordings">Voice Recordings</option>
                <option value="Company Documents">Company Documents</option>
                <option value="Templates">Templates</option>
              </select>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" id="cancel-doc-modal-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-cloud-arrow-up"></i> Upload File
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#close-doc-modal-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#cancel-doc-modal-btn')?.addEventListener('click', closeModal);

    const filePicker = modalContainer.querySelector('#doc-file-picker');
    const nameInput = modalContainer.querySelector('#doc-display-name');
    const categorySelect = modalContainer.querySelector('#doc-category-select');

    filePicker?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (nameInput) nameInput.value = file.name;
        if (categorySelect) {
          if (file.type.startsWith('image/')) categorySelect.value = 'Images';
          else if (file.type.startsWith('audio/')) categorySelect.value = 'Voice Recordings';
        }
      }
    });

    modalContainer.querySelector('#upload-doc-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const file = filePicker.files[0];
      const displayName = nameInput.value.trim();
      const category = categorySelect.value;

      if (!file) {
        window.appController?.showToast('Please select a file to upload.', 'error');
        return;
      }

      // Calculate formatted size
      let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      // Ext type
      const ext = file.name.split('.').pop().toUpperCase();

      const reader = new FileReader();
      reader.onload = (evt) => {
        const fileData = evt.target.result;
        this.storage.uploadDocument({
          name: displayName,
          type: ext,
          category: category,
          size: sizeStr,
          fileData: fileData
        });

        closeModal();
        window.appController?.showToast(`Uploaded "${displayName}" to Document Vault!`, 'success');
        this.renderDocumentsView(container);
      };
      reader.readAsDataURL(file);
    });
  }
}

window.documentController = new DocumentController();
