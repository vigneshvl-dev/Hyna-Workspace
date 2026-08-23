/**
 * HYNA STUDIO WORKSPACE - SUPABASE REALTIME CLOUD BACKEND SERVICE
 * Live REST & Realtime Cross-Device Synchronization with Supabase PostgreSQL
 */

const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

class SupabaseService {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.isConfigured = (SUPABASE_URL && !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_REF'));
    this.init();
  }

  init() {
    if (this.isConfigured && window.supabase) {
      this.client = window.supabase.createClient(this.url, this.key);
      console.log("⚡ [Supabase Live Cloud DB] Initialized for " + this.url);
      this.startRealtimeSync();
    } else {
      console.log("ℹ️ [Supabase] Set SUPABASE_URL and SUPABASE_ANON_KEY in js/supabase-service.js for live multi-device sync.");
    }
  }

  // --- Realtime Multi-Device Sync ---
  startRealtimeSync() {
    if (this.syncTimer || !this.client) return;

    this.syncTimer = setInterval(async () => {
      try {
        const [usersRes, modsRes, docsRes, evsRes] = await Promise.all([
          this.client.from('users').select('*'),
          this.client.from('modules').select('*'),
          this.client.from('documents').select('*'),
          this.client.from('events').select('*')
        ]);

        let needsRefresh = false;

        if (usersRes.data) {
          const cloudStr = JSON.stringify(usersRes.data);
          if (cloudStr !== localStorage.getItem('hyna_users')) {
            localStorage.setItem('hyna_users', cloudStr);
            needsRefresh = true;
          }
        }

        if (modsRes.data) {
          const cloudStr = JSON.stringify(modsRes.data);
          if (cloudStr !== localStorage.getItem('hyna_modules')) {
            localStorage.setItem('hyna_modules', cloudStr);
            needsRefresh = true;
          }
        }

        if (docsRes.data) {
          const cloudStr = JSON.stringify(docsRes.data);
          if (cloudStr !== localStorage.getItem('hyna_documents')) {
            localStorage.setItem('hyna_documents', cloudStr);
            needsRefresh = true;
          }
        }

        if (evsRes.data) {
          const cloudStr = JSON.stringify(evsRes.data);
          if (cloudStr !== localStorage.getItem('hyna_events')) {
            localStorage.setItem('hyna_events', cloudStr);
            needsRefresh = true;
          }
        }

        if (needsRefresh) {
          const activeInput = document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
          const hasOpenModal = document.querySelector('.modal-card, .admin-modal, #admin-modal-container:not(:empty)');

          if (!activeInput && !hasOpenModal) {
            if (window.appController) {
              const route = window.location.hash.replace('#', '') || 'dashboard';
              window.appController.navigate(route);
            }
            if (window.adminController) {
              const route = window.adminController.currentView || 'overview';
              window.adminController.navigate(route);
            }
          }
        }
      } catch (e) {
        // Silent background sync
      }
    }, 2000);
  }

  // --- Deletion Sync Methods ---
  async deleteUser(userId) {
    if (!this.client) return;
    try {
      await this.client.from('users').delete().eq('id', userId);
      console.log(`✅ [Supabase] Deleted user ${userId} from cloud database`);
    } catch (e) {
      console.warn("Supabase delete user error:", e);
    }
  }

  async deleteModule(moduleId) {
    if (!this.client) return;
    try {
      await this.client.from('modules').delete().eq('id', moduleId);
      console.log(`✅ [Supabase] Deleted module ${moduleId} from cloud database`);
    } catch (e) {
      console.warn("Supabase delete module error:", e);
    }
  }

  async deleteDocument(docId) {
    if (!this.client) return;
    try {
      await this.client.from('documents').delete().eq('id', docId);
      console.log(`✅ [Supabase] Deleted document ${docId} from cloud database`);
    } catch (e) {
      console.warn("Supabase delete document error:", e);
    }
  }

  async deleteEvent(eventId) {
    if (!this.client) return;
    try {
      await this.client.from('events').delete().eq('id', eventId);
      console.log(`✅ [Supabase] Deleted event ${eventId} from cloud database`);
    } catch (e) {
      console.warn("Supabase delete event error:", e);
    }
  }
}

window.supabaseService = new SupabaseService();
