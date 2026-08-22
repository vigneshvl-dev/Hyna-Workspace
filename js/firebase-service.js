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
}

window.firebaseService = new FirebaseService();
