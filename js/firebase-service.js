/**
 * HYNA STUDIO WORKSPACE - FIREBASE LIVE CLOUD SERVICE
 * Live REST & Realtime Sync with https://hyna-workspace-b8748-default-rtdb.firebaseio.com/
 */

class FirebaseService {
  constructor() {
    this.baseUrl = "https://hyna-workspace-b8748-default-rtdb.firebaseio.com";
    this.init();
  }

  init() {
    console.log("⚡ [Firebase Service] Initialized for https://hyna-workspace-b8748-default-rtdb.firebaseio.com/");
  }

  // --- Users Roster ---
  async getUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/users.json`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data) return null;
      return Object.values(data);
    } catch (e) {
      console.warn("Firebase fetch error:", e);
      return null;
    }
  }

  async getUserByEmpId(empId) {
    if (!empId) return null;
    const users = await this.getUsers();
    if (!users) return null;
    const cleanId = empId.trim().toLowerCase();
    return users.find(u => u.empId && u.empId.toLowerCase() === cleanId);
  }

  async updateUser(userId, updatedData) {
    try {
      await fetch(`${this.baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      this.addAuditLog('Employee Profile Updated', `User ${userId} updated in Cloud Database`);
    } catch (e) {
      console.warn("Firebase update user error:", e);
    }
  }

  async deleteUser(userId) {
    try {
      await fetch(`${this.baseUrl}/users/${userId}.json`, { method: 'DELETE' });
      this.addAuditLog('Employee Deleted', `User ${userId} deleted from Cloud Database`);
    } catch (e) {
      console.warn("Firebase delete user error:", e);
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      await fetch(`${this.baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      this.addAuditLog('Role Escalation', `User ${userId} updated to ${newRole}`);
    } catch (e) {
      console.warn("Firebase update error:", e);
    }
  }

  async updateUserPassword(userId, newPassword) {
    try {
      await fetch(`${this.baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      this.addAuditLog('Password Reset', `User ${userId} password updated in Cloud Database`);
    } catch (e) {
      console.warn("Firebase password update error:", e);
    }
  }

  async updateUserEmail(userId, newEmail) {
    try {
      await fetch(`${this.baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      this.addAuditLog('Gmail / Email Update', `User ${userId} email updated in Cloud Database`);
    } catch (e) {
      console.warn("Firebase email update error:", e);
    }
  }

  async updateUserName(userId, newName) {
    try {
      await fetch(`${this.baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      this.addAuditLog('Name Updated', `User ${userId} name updated in Cloud Database`);
    } catch (e) {
      console.warn("Firebase name update error:", e);
    }
  }

  async toggleUserStatus(userId, currentStatus) {
    try {
      const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      await fetch(`${this.baseUrl}/users/${userId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      this.addAuditLog('Account Status Changed', `User ${userId} set to ${nextStatus}`);
    } catch (e) {
      console.warn("Firebase update error:", e);
    }
  }

  async addUser(userData) {
    try {
      const id = userData.id || `user-00${Date.now()}`;
      const payload = {
        id: id,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        ...userData
      };
      await fetch(`${this.baseUrl}/users/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.addAuditLog('New Employee Onboarded', `${userData.name} (${userData.role})`);
      return payload;
    } catch (e) {
      console.warn("Firebase add error:", e);
      return null;
    }
  }

  // --- Audit Logs ---
  async getAuditLogs() {
    try {
      const res = await fetch(`${this.baseUrl}/audit_logs.json`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data) return null;
      return Object.values(data).reverse();
    } catch (e) {
      return null;
    }
  }

  async addAuditLog(action, target, status = 'Success') {
    try {
      const logId = `log-${Date.now()}`;
      const now = new Date();
      const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const payload = {
        id: logId,
        timestamp: timeStr,
        user: 'Hyna Admin',
        action: action,
        target: target,
        status: status
      };
      await fetch(`${this.baseUrl}/audit_logs/${logId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Audit log add error:", e);
    }
  }

  async sendMessage(msgData) {
    try {
      const msgId = msgData.id || `m-${Date.now()}`;
      await fetch(`${this.baseUrl}/messages/${msgId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
    } catch (e) {
      console.warn("Firebase send message error:", e);
    }
  }

  async getMessages() {
    try {
      const res = await fetch(`${this.baseUrl}/messages.json`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data) return null;
      return Object.values(data);
    } catch (e) {
      console.warn("Firebase fetch messages error:", e);
      return null;
    }
  }

  // --- Real-time Cloud Sync for Submissions, Documents & Calendar ---
  async syncCollection(collectionName, dataArray) {
    try {
      const payload = JSON.parse(JSON.stringify(dataArray));
      const res = await fetch(`${this.baseUrl}/${collectionName}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.log(`✅ [Firebase Cloud DB] Synced ${collectionName} (${payload.length} items) across all devices`);
      }
    } catch (e) {
      console.warn(`Firebase collection sync error (${collectionName}):`, e);
    }
  }

  startCloudAutoSync() {
    if (this.syncTimer) return;
    
    // Poll Cloud Database every 2.5s to sync additions, edits & deletions across all devices in real-time
    this.syncTimer = setInterval(async () => {
      try {
        const [users, modules, docs, events, msgs, att, deletedUserIds] = await Promise.all([
          fetch(`${this.baseUrl}/users.json`).then(r => r.ok ? r.json() : null),
          fetch(`${this.baseUrl}/modules.json`).then(r => r.ok ? r.json() : null),
          fetch(`${this.baseUrl}/documents.json`).then(r => r.ok ? r.json() : null),
          fetch(`${this.baseUrl}/events.json`).then(r => r.ok ? r.json() : null),
          fetch(`${this.baseUrl}/messages.json`).then(r => r.ok ? r.json() : null),
          fetch(`${this.baseUrl}/attendance.json`).then(r => r.ok ? r.json() : null),
          fetch(`${this.baseUrl}/deleted_user_ids.json`).then(r => r.ok ? r.json() : null)
        ]);

        let viewNeedsRefresh = false;

        if (users) {
          const list = Array.isArray(users) ? users : Object.values(users);
          const currentStr = localStorage.getItem('hyna_users');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_users', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (modules) {
          const list = Array.isArray(modules) ? modules : Object.values(modules);
          const currentStr = localStorage.getItem('hyna_modules');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_modules', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (docs) {
          const list = Array.isArray(docs) ? docs : Object.values(docs);
          const currentStr = localStorage.getItem('hyna_documents');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_documents', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (events) {
          const list = Array.isArray(events) ? events : Object.values(events);
          const currentStr = localStorage.getItem('hyna_events');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_events', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (msgs) {
          const list = Array.isArray(msgs) ? msgs : Object.values(msgs);
          const currentStr = localStorage.getItem('hyna_messages');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_messages', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (att) {
          const list = Array.isArray(att) ? att : Object.values(att);
          const currentStr = localStorage.getItem('hyna_attendance');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_attendance', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (deletedUserIds) {
          const list = Array.isArray(deletedUserIds) ? deletedUserIds : Object.values(deletedUserIds);
          const currentStr = localStorage.getItem('hyna_deleted_user_ids');
          if (JSON.stringify(list) !== currentStr) {
            localStorage.setItem('hyna_deleted_user_ids', JSON.stringify(list));
            viewNeedsRefresh = true;
          }
        }

        if (viewNeedsRefresh) {
          const activeInput = document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
          const hasOpenModal = document.querySelector('.modal-card, .admin-modal, #admin-modal-container:not(:empty)');

          if (!activeInput && !hasOpenModal) {
            const appContent = document.getElementById('app-content');
            const adminContent = document.getElementById('admin-app-content');

            if (appContent && window.appController) {
              const currentRoute = window.location.hash.replace('#', '') || 'dashboard';
              window.appController.navigate(currentRoute);
            }
            if (adminContent && window.adminController) {
              const currentRoute = window.adminController.currentView || 'overview';
              window.adminController.navigate(currentRoute);
            }
          }
        }
      } catch (e) {
        // Silent background sync
      }
    }, 2500);
  }

  async syncModuleSubmission(modData) {
    try {
      await fetch(`${this.baseUrl}/modules/${modData.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modData)
      });
      this.addAuditLog('Module Cloud Sync', `Module ${modData.number || modData.id} synced across all devices`);
    } catch (e) {
      console.warn("Firebase module sync error:", e);
    }
  }

  async syncAttendanceRecord(attLog) {
    try {
      const key = attLog.date.replace(/[^0-9-]/g, '');
      await fetch(`${this.baseUrl}/attendance/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attLog)
      });
    } catch (e) {
      console.warn("Firebase attendance sync error:", e);
    }
  }

  async syncDocument(docData) {
    try {
      await fetch(`${this.baseUrl}/documents/${docData.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
    } catch (e) {
      console.warn("Firebase document sync error:", e);
    }
  }

  async deleteDocument(docId) {
    try {
      await fetch(`${this.baseUrl}/documents/${docId}.json`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Firebase delete document error:", e);
    }
  }

  async syncCalendarEvent(eventData) {
    try {
      await fetch(`${this.baseUrl}/events/${eventData.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
    } catch (e) {
      console.warn("Firebase calendar event sync error:", e);
    }
  }

  async deleteCalendarEvent(eventId) {
    try {
      await fetch(`${this.baseUrl}/events/${eventId}.json`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Firebase delete event error:", e);
    }
  }
}

window.firebaseService = new FirebaseService();
