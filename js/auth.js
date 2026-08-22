/**
 * HYNA STUDIO WORKSPACE - AUTHENTICATION & ROLE MANAGER
 * Controls Employee ID login, admin clearance, and session security.
 */

class AuthService {
  constructor() {
    this.storage = window.storageService;
  }

  getCurrentUser() {
    return this.storage.getCurrentUser();
  }

  getRole() {
    return this.getCurrentUser().role;
  }

  isManagerOrAdmin() {
    const role = this.getRole();
    return ['Manager', 'Project Management Lead', 'Director', 'CEO', 'Admin', 'Super Admin'].includes(role);
  }

  isAdmin() {
    const role = this.getRole();
    return ['Director', 'CEO', 'Admin', 'Super Admin'].includes(role);
  }

  isCEO() {
    const role = this.getRole();
    return ['CEO', 'Super Admin'].includes(role);
  }

  switchRole(userId) {
    this.storage.setCurrentUserRole(userId);
    window.location.reload();
  }

  loginWithEmpId(empId, password) {
    return this.storage.authenticateUser(empId, password);
  }

  logout() {
    this.storage.clearSession();
    window.location.href = 'login.html';
  }

  requireAuth() {
    if (!this.storage.isSessionActive()) {
      window.location.href = 'login.html';
    }
  }

  requireAdminAuth() {
    if (!this.storage.isSessionActive()) {
      window.location.href = 'login.html';
      return;
    }
    if (!this.isManagerOrAdmin()) {
      alert(`Access Denied: Current user (${this.getCurrentUser().name}) does not have Administrative clearance.`);
      window.location.href = 'index.html';
    }
  }
}

window.authService = new AuthService();
