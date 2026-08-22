/**
 * HYNA STUDIO WORKSPACE - DOCUMENT VAULT CONTROLLER
 */

class DocumentController {
  constructor() {
    this.storage = window.storageService;
  }

  renderDocumentsView(container) {
    const docs = this.storage.getDocuments();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Document Vault</h1>
          <p class="page-subtitle">Project deliverables, company guidelines, and module submission templates</p>
        </div>
        <button class="btn btn-primary" id="upload-doc-btn">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Document
        </button>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i class="fa-solid fa-folder-open text-primary"></i> Workspace Files</h3>
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
              ${docs.map(d => `
                <tr>
                  <td style="font-weight: 700;">
                    <i class="fa-solid ${d.type === 'PDF' ? 'fa-file-pdf text-danger' : 'fa-file-code text-primary'}" style="margin-right: 0.5rem;"></i>
                    ${d.name}
                  </td>
                  <td><span class="badge badge-neutral">${d.category}</span></td>
                  <td>${d.uploadedBy}</td>
                  <td>${d.date}</td>
                  <td>${d.size}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm download-doc-btn" data-name="${d.name}">
                      <i class="fa-solid fa-download"></i> Download
                    </button>
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
        window.appController?.showToast(`Downloading file: ${name}`, 'info');
      });
    });

    container.querySelector('#upload-doc-btn')?.addEventListener('click', () => {
      window.appController?.showToast('Select a file to upload to Hyna Document Vault', 'info');
    });
  }
}

window.documentController = new DocumentController();
