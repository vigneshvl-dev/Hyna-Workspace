/**
 * HYNA STUDIO WORKSPACE - SUPABASE REALTIME CLOUD BACKEND SERVICE
 * Live REST & Realtime Cross-Device Synchronization with Supabase PostgreSQL
 */

const SUPABASE_URL = 'https://gnjqbtkkijkffkfshwsw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CLuGsWusuD6hsLPT5HhUqQ_24B5YSum';

class SupabaseService {
  constructor() {
    this.url = SUPABASE_URL;
    this.restUrl = "https://gnjqbtkkijkffkfshwsw.supabase.co/rest/v1";
    this.key = SUPABASE_ANON_KEY;
    this.isConfigured = true;
    this.init();
  }

  init() {
    if (window.supabase && this.key && !this.key.includes('YOUR_SUPABASE')) {
      this.client = window.supabase.createClient(this.url, this.key);
      console.log("⚡ [Supabase Live Cloud DB] Initialized for " + this.url);
      this.seedInitialCloudData();
      this.startRealtimeSync();
    } else {
      console.log("⚡ [Supabase Live REST] Endpoint set to " + this.restUrl);
      this.seedInitialCloudData();
      this.startRestSync();
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
  startRestSync() {
    if (this.syncTimer) return;
    this.syncTimer = setInterval(async () => {
      if (!this.key || this.key.includes('YOUR_SUPABASE')) return;
      try {
        const headers = { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` };
        const [users, modules, docs, events] = await Promise.all([
          fetch(`${this.restUrl}/users?select=*`, { headers }).then(r => r.ok ? r.json() : null),
          fetch(`${this.restUrl}/modules?select=*`, { headers }).then(r => r.ok ? r.json() : null),
          fetch(`${this.restUrl}/documents?select=*`, { headers }).then(r => r.ok ? r.json() : null),
          fetch(`${this.restUrl}/events?select=*`, { headers }).then(r => r.ok ? r.json() : null)
        ]);

        let needsRefresh = false;

        if (users) {
          const str = JSON.stringify(users);
          if (str !== localStorage.getItem('hyna_users')) {
            localStorage.setItem('hyna_users', str);
            needsRefresh = true;
          }
        }
        if (modules) {
          const str = JSON.stringify(modules);
          if (str !== localStorage.getItem('hyna_modules')) {
            localStorage.setItem('hyna_modules', str);
            needsRefresh = true;
          }
        }
        if (docs) {
          const str = JSON.stringify(docs);
          if (str !== localStorage.getItem('hyna_documents')) {
            localStorage.setItem('hyna_documents', str);
            needsRefresh = true;
          }
        }
        if (events) {
          const str = JSON.stringify(events);
          if (str !== localStorage.getItem('hyna_events')) {
            localStorage.setItem('hyna_events', str);
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
    if (this.client) {
      try {
        await this.client.from('users').delete().eq('id', userId);
        console.log(`✅ [Supabase Client] Deleted user ${userId} from cloud database`);
        return;
      } catch (e) {}
    }
    if (this.key && !this.key.includes('YOUR_SUPABASE')) {
      try {
        await fetch(`${this.restUrl}/users?id=eq.${userId}`, {
          method: 'DELETE',
          headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        console.log(`✅ [Supabase REST] Deleted user ${userId} from cloud database`);
      } catch (e) {
        console.warn("Supabase delete user error:", e);
      }
    }
  }

  async deleteModule(moduleId) {
    if (this.client) {
      try {
        await this.client.from('modules').delete().eq('id', moduleId);
        console.log(`✅ [Supabase Client] Deleted module ${moduleId} from cloud database`);
        return;
      } catch (e) {}
    }
    if (this.key && !this.key.includes('YOUR_SUPABASE')) {
      try {
        await fetch(`${this.restUrl}/modules?id=eq.${moduleId}`, {
          method: 'DELETE',
          headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        console.log(`✅ [Supabase REST] Deleted module ${moduleId} from cloud database`);
      } catch (e) {
        console.warn("Supabase delete module error:", e);
      }
    }
  }

  async deleteDocument(docId) {
    if (this.client) {
      try {
        await this.client.from('documents').delete().eq('id', docId);
        console.log(`✅ [Supabase Client] Deleted document ${docId} from cloud database`);
        return;
      } catch (e) {}
    }
    if (this.key && !this.key.includes('YOUR_SUPABASE')) {
      try {
        await fetch(`${this.restUrl}/documents?id=eq.${docId}`, {
          method: 'DELETE',
          headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        console.log(`✅ [Supabase REST] Deleted document ${docId} from cloud database`);
      } catch (e) {
        console.warn("Supabase delete document error:", e);
      }
    }
  }

  async deleteEvent(eventId) {
    if (this.client) {
      try {
        await this.client.from('events').delete().eq('id', eventId);
        console.log(`✅ [Supabase Client] Deleted event ${eventId} from cloud database`);
        return;
      } catch (e) {}
    }
    if (this.key && !this.key.includes('YOUR_SUPABASE')) {
      try {
        await fetch(`${this.restUrl}/events?id=eq.${eventId}`, {
          method: 'DELETE',
          headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
        });
        console.log(`✅ [Supabase REST] Deleted event ${eventId} from cloud database`);
      } catch (e) {
        console.warn("Supabase delete event error:", e);
      }
    }
  }
}

window.supabaseService = new SupabaseService();
