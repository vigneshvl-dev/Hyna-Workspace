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
    return ['Manager', 'Project Management Lead', 'IT Team', 'VP of Product', 'Director', 'CMO', 'CPO', 'COO', 'CTO', 'CEO', 'Admin', 'Super Admin'].includes(role);
  }

  isAdmin() {
    const role = this.getRole();
    return ['Director', 'VP of Product', 'IT Team', 'CMO', 'CPO', 'COO', 'CTO', 'CEO', 'Admin', 'Super Admin'].includes(role);
  }

  isCEO() {
    const role = this.getRole();
    return ['CEO', 'CTO', 'COO', 'CPO', 'CMO', 'Super Admin'].includes(role);
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
      window.location.href = 'index.html';
      return false;
    }
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.empId !== 'EMP-001' && currentUser.id !== 'user-001')) {
      alert(`Access Denied: Only Employee ID EMP-001 (VIGNESH V L) is authorized to access the Admin Panel.`);
      window.location.href = 'index.html#dashboard';
      return false;
    }
    return true;
  }
}

window.authService = new AuthService();
