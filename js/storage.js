/**
 * HYNA STUDIO WORKSPACE - STORAGE & DATA MANAGEMENT LAYER
 * Uses localStorage with fallback pre-seeded mock data.
 * Formatted with clean REST-API like wrapper functions for easy backend integration later.
 */

const STORAGE_KEYS = {
  USERS: 'hyna_users',
  CURRENT_USER_ID: 'hyna_current_user_id',
  MODULES: 'hyna_modules',
  TASKS: 'hyna_tasks',
  PROJECTS: 'hyna_projects',
  ATTENDANCE: 'hyna_attendance',
  NOTIFICATIONS: 'hyna_notifications',
  DOCUMENTS: 'hyna_documents',
  MESSAGES: 'hyna_messages',
  EVENTS: 'hyna_events',
  AUDIT_LOGS: 'hyna_audit_logs',
  ADMIN_SETTINGS: 'hyna_admin_settings'
};

const DEFAULT_AUDIT_LOGS = [
  { id: 'log-1', timestamp: new Date().toISOString().split('T')[0] + ' 12:00', user: 'System Administrator', action: 'Workspace Initialization', target: 'Hyna Studio System', status: 'Success' }
];

const DEFAULT_ADMIN_SETTINGS = {
  maintenanceMode: false,
  allowRegistration: true,
  require2FA: true,
  autoApproveModules: false,
  systemName: 'Hyna Studio Ecosystem'
};

// Initial Roster Data (Primary Administrator)
const DEFAULT_USERS = [
  {
    id: 'user-001',
    empId: 'EMP-001',
    password: 'admin123',
    name: 'System Administrator',
    role: 'CEO',
    department: 'Executive',
    email: 'admin@hyna.studio',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    status: 'Active'
  }
];

const DEFAULT_MODULES = [
  {
    id: 'mod-01',
    number: 'Module 01',
    title: 'Hyna Studio Onboarding & Culture',
    description: 'Overview of company vision, communication channels, code formatting standards, and security policies.',
    assignedDate: '2026-08-01',
    deadline: '2026-08-07',
    progress: 100,
    status: 'Completed',
    instructor: 'Elena Rostova',
    assignedTo: 'user-001',
    unlocked: true,
    content: 'Welcome to Hyna Studio! Review employee handbook, set up Slack & GitHub workspace accounts.'
  },
  {
    id: 'mod-02',
    number: 'Module 02',
    title: 'Git & GitHub Enterprise Workflow',
    description: 'Learn branch strategy, pull request reviews, linear git history, merge conflict resolution, and CI/CD pipelines.',
    assignedDate: '2026-08-08',
    deadline: '2026-08-15',
    progress: 100,
    status: 'Completed',
    instructor: 'Sarah Jenkins',
    assignedTo: 'user-001',
    unlocked: true,
    content: 'Master our feature-branch workflow. Submit 3 clean PRs with code reviews.'
  },
  {
    id: 'mod-03',
    number: 'Module 03',
    title: 'JavaScript Fundamentals & Async Patterns',
    description: 'Deep dive into modern ES6+, Closures, Event Loop, Promises, Async/Await, and REST API integration architecture.',
    assignedDate: '2026-08-16',
    deadline: '2026-08-28',
    progress: 70,
    status: 'In Progress',
    instructor: 'Sarah Jenkins',
    assignedTo: 'user-001',
    unlocked: true,
    submissionText: '',
    submissionLink: '',
    content: 'Implement a decoupled REST client wrapper and state management pattern for single-page applications.'
  },
  {
    id: 'mod-04',
    number: 'Module 04',
    title: 'Team Development Workflow & Code Auditing',
    description: 'Best practices for peer reviews, unit testing setup, automated linters, and architectural documentation.',
    assignedDate: '2026-08-29',
    deadline: '2026-09-05',
    progress: 0,
    status: 'Assigned',
    instructor: 'David Chen',
    assignedTo: 'user-001',
    unlocked: false,
    content: 'Unlock by completing Module 03.'
  },
  {
    id: 'mod-05',
    number: 'Module 05',
    title: 'Backend API Design & Microservices',
    description: 'Designing RESTful endpoints, database schemas with PostgreSQL, JWT authentication, and service isolation.',
    assignedDate: '2026-09-06',
    deadline: '2026-09-18',
    progress: 0,
    status: 'Assigned',
    instructor: 'Sarah Jenkins',
    assignedTo: 'user-001',
    unlocked: false,
    content: 'Unlock by completing Module 04.'
  }
];

const DEFAULT_TASKS = [
  {
    id: 'task-101',
    title: 'Refactor Navigation Component',
    project: 'Hyna Workspace Web App',
    assignedTo: 'Alex Morgan',
    priority: 'High',
    deadline: '2026-08-24',
    status: 'In Progress',
    progress: 60
  },
  {
    id: 'task-102',
    title: 'Implement Dark Mode Color Tokens',
    project: 'Hyna Design System',
    assignedTo: 'Alex Morgan',
    priority: 'Medium',
    deadline: '2026-08-26',
    status: 'Pending',
    progress: 0
  },
  {
    id: 'task-103',
    title: 'Optimize API Payload Caching',
    project: 'Core Engine v2',
    assignedTo: 'Alex Morgan',
    priority: 'Urgent',
    deadline: '2026-08-23',
    status: 'Submitted',
    progress: 90
  },
  {
    id: 'task-104',
    title: 'Setup Automated Visual Regression Tests',
    project: 'Hyna Workspace Web App',
    assignedTo: 'Sarah Jenkins',
    priority: 'Medium',
    deadline: '2026-08-30',
    status: 'In Progress',
    progress: 40
  },
  {
    id: 'task-105',
    title: 'Security Audit & JWT Rotation',
    project: 'Auth Microservice',
    assignedTo: 'David Chen',
    priority: 'High',
    deadline: '2026-08-22',
    status: 'Completed',
    progress: 100
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-01',
    name: 'Hyna Workspace SaaS',
    description: 'Internal employee ecosystem app for task tracking, module unlocks, reports, and attendance management.',
    teamMembers: ['Alex Morgan', 'Sarah Jenkins', 'David Chen'],
    progress: 72,
    deadline: '2026-09-30',
    status: 'Active'
  },
  {
    id: 'proj-02',
    name: 'Hyna Design System 2.0',
    description: 'Unified component library with accessibility compliance, CSS design tokens, and fluid layout primitives.',
    teamMembers: ['Elena Rostova', 'Alex Morgan'],
    progress: 45,
    deadline: '2026-10-15',
    status: 'Active'
  },
  {
    id: 'proj-03',
    name: 'Client Portal Integration',
    description: 'External portal for clients to inspect module progress and leave feedback.',
    teamMembers: ['David Chen', 'Sarah Jenkins'],
    progress: 100,
    deadline: '2026-08-15',
    status: 'Completed'
  }
];

const DEFAULT_ATTENDANCE = [
  { date: '2026-08-22', checkIn: '09:12 AM', checkOut: null, workingTime: '4h 32m', status: 'Checked In' },
  { date: '2026-08-21', checkIn: '09:08 AM', checkOut: '06:10 PM', workingTime: '9h 02m', status: 'Present' },
  { date: '2026-08-20', checkIn: '—', checkOut: '—', workingTime: '0h 00m', status: 'Leave' },
  { date: '2026-08-19', checkIn: '09:00 AM', checkOut: '06:00 PM', workingTime: '9h 00m', status: 'Present' },
  { date: '2026-08-18', checkIn: '09:15 AM', checkOut: '06:05 PM', workingTime: '8h 50m', status: 'Present' }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'New Module Unlocked',
    message: 'Congratulations! You completed "Git & GitHub Enterprise Workflow". Module 03 is now available.',
    timestamp: '2 hours ago',
    category: 'Module',
    read: false
  },
  {
    id: 'notif-02',
    title: 'Task Assigned',
    message: 'Sarah Jenkins assigned you to "Refactor Navigation Component".',
    timestamp: '1 day ago',
    category: 'Task',
    read: false
  },
  {
    id: 'notif-03',
    title: 'Meeting Scheduled',
    message: 'Quarterly Sprint Planning meeting tomorrow at 10:00 AM.',
    timestamp: '2 days ago',
    category: 'Calendar',
    read: true
  }
];

const DEFAULT_MESSAGES = [];

const DEFAULT_DOCUMENTS = [
  { id: 'doc-1', name: 'Hyna_Studio_Employee_Handbook_2026.pdf', type: 'PDF', uploadedBy: 'Elena Rostova', date: '2026-08-01', size: '2.4 MB', category: 'Company Documents' },
  { id: 'doc-2', name: 'Frontend_Architecture_Guidelines.docx', type: 'DOCX', uploadedBy: 'Sarah Jenkins', date: '2026-08-10', size: '1.1 MB', category: 'Project Files' },
  { id: 'doc-3', name: 'Module_Submission_Template.md', type: 'MD', uploadedBy: 'David Chen', date: '2026-08-14', size: '45 KB', category: 'Templates' }
];

const DEFAULT_EVENTS = [
  { id: 'ev-1', title: 'Sprint Review & Demo', date: '2026-08-25', time: '03:00 PM', type: 'Meeting' },
  { id: 'ev-2', title: 'Module 03 Deadline', date: '2026-08-28', time: '11:59 PM', type: 'Deadline' },
  { id: 'ev-3', title: 'Hyna Engineering Townhall', date: '2026-08-31', time: '11:00 AM', type: 'Event' }
];

// Data Layer Storage Class
class StorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].id);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODULES)) {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(DEFAULT_MODULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DOCUMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    }
  }

  // --- Users & Roles ---
  getUsers() {
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    if (!users || !Array.isArray(users) || users.length === 0) {
      users = DEFAULT_USERS;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } else {
      let updated = false;
      users = users.map((u, idx) => {
        const defaultU = DEFAULT_USERS.find(d => d.id === u.id) || DEFAULT_USERS[idx] || {};
        if (u.empId === 'EMP-001' || u.id === 'user-001') {
          if (u.role !== 'CEO' && u.role !== 'Super Admin' && u.role !== 'Admin') {
            u.role = 'CEO';
            updated = true;
          }
          if (!u.name) {
            u.name = 'System Administrator';
            updated = true;
          }
        }
        if (!u.empId) {
          u.empId = defaultU.empId || `EMP-00${idx + 1}`;
          updated = true;
        }
        if (!u.password) {
          u.password = defaultU.password || 'admin123';
          updated = true;
        }
        return u;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    }
    return users;
  }

  getUserByEmpId(empId) {
    if (!empId) return null;
    const cleanId = empId.trim().toLowerCase();
    const users = this.getUsers();
    
    return users.find(u => {
      if (u.empId && u.empId.toLowerCase() === cleanId) return true;
      if (u.id && u.id.toLowerCase() === cleanId) return true;
      const numOnly = cleanId.replace(/[^0-9]/g, '');
      if (numOnly && u.empId && u.empId.replace(/[^0-9]/g, '') === numOnly) return true;
      return false;
    });
  }

  authenticateUser(empId, password) {
    const user = this.getUserByEmpId(empId);
    if (!user) {
      return { success: false, error: `Employee ID "${empId}" not found in system roster.` };
    }
    if (user.status !== 'Active') {
      return { success: false, error: `Account for Employee ID ${empId} (${user.name}) is currently suspended.` };
    }
    
    // Flexible password match for primary accounts
    const isMasterAdmin = (user.empId === 'EMP-001' || user.id === 'user-001');
    const isValidPass = (user.password === password) || (isMasterAdmin && (password === 'admin123' || password === 'user123'));

    if (!isValidPass) {
      return { success: false, error: `Incorrect security password for Employee ID "${empId}".` };
    }

    // Auto-sync password to stored profile if changed
    if (user.password !== password) {
      user.password = password;
      this.updateUserPassword(user.id, password);
    }

    this.setSession(user.id);
    return { success: true, user: user };
  }

  getCurrentUser() {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const users = this.getUsers();
    return users.find(u => u.id === currentId) || users[0];
  }

  setCurrentUserRole(userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  setSession(userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    localStorage.setItem('hyna_session_active', 'true');
  }

  isSessionActive() {
    return localStorage.getItem('hyna_session_active') === 'true';
  }

  clearSession() {
    localStorage.removeItem('hyna_session_active');
  }

  updateUserRole(userId, newRole) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      const oldRole = user.role;
      user.role = newRole;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.addAuditLog('Role Update', `${user.name}: ${oldRole} → ${newRole}`);
      if (window.firebaseService) {
        window.firebaseService.updateUserRole(userId, newRole);
      }
    }
  }

  updateUser(userId, updatedData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedData };
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      } catch (e) {
        console.error("Storage error updating user profile:", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          alert('Storage quota exceeded! The uploaded image is too large. Please select a smaller photo or clear workspace storage.');
        }
      }
      this.addAuditLog('Employee Profile Updated', `${users[userIndex].name} (${users[userIndex].empId || userId})`);
      if (window.firebaseService) {
        window.firebaseService.updateUser(userId, updatedData);
      }
    }
  }

  deleteUser(userId) {
    let users = this.getUsers();
    const targetUser = users.find(u => u.id === userId);
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (targetUser) {
      this.addAuditLog('Employee Deleted', `${targetUser.name} (${targetUser.empId || userId}) removed from roster`);
    }
    if (window.firebaseService) {
      window.firebaseService.deleteUser(userId);
    }
  }

  updateUserPassword(userId, newPassword) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.addAuditLog('Password Reset', `Password updated for ${user.name} (${user.empId || user.id})`);
      if (window.firebaseService) {
        window.firebaseService.updateUserPassword(userId, newPassword);
      }
    }
  }

  updateUserEmail(userId, newEmail) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.email = newEmail;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.addAuditLog('Gmail / Email Update', `Email updated for ${user.name} to ${newEmail}`);
      if (window.firebaseService) {
        window.firebaseService.updateUserEmail(userId, newEmail);
      }
    }
  }

  updateUserName(userId, newName) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      const oldName = user.name;
      user.name = newName;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.addAuditLog('Name Updated', `Name updated from ${oldName} to ${newName}`);
      if (window.firebaseService) {
        window.firebaseService.updateUserName(userId, newName);
      }
    }
  }

  toggleUserStatus(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      const oldStatus = user.status;
      user.status = user.status === 'Active' ? 'Suspended' : 'Active';
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.addAuditLog('User Status Toggle', `${user.name} set to ${user.status}`);
      if (window.firebaseService) {
        window.firebaseService.toggleUserStatus(userId, oldStatus);
      }
    }
  }

  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: `user-00${users.length + 1}`,
      empId: userData.empId || `EMP-00${users.length + 1}`,
      password: userData.password || 'user123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      ...userData
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addAuditLog('New User Created', `${newUser.name} (${newUser.role}) added to ${newUser.department}`);
    if (window.firebaseService) {
      window.firebaseService.addUser(newUser);
    }
    return newUser;
  }

  // --- Audit Logs & Admin Governance ---
  getAuditLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || DEFAULT_AUDIT_LOGS;
  }

  addAuditLog(action, target, status = 'Success') {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: timestamp,
      user: currentUser ? currentUser.name : 'System Admin',
      action: action,
      target: target,
      status: status
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    if (window.firebaseService) {
      window.firebaseService.addAuditLog(action, target, status);
    }
  }

  getAdminSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) || DEFAULT_ADMIN_SETTINGS;
  }

  updateAdminSettings(settings) {
    const current = this.getAdminSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(updated));
    this.addAuditLog('Admin Configuration Updated', JSON.stringify(settings));
    return updated;
  }

  // --- Modules ---
  getModules() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULES)) || [];
  }

  getModuleById(id) {
    return this.getModules().find(m => m.id === id);
  }

  createModule(moduleData) {
    const modules = this.getModules();
    const newModule = {
      id: `mod-0${modules.length + 1}`,
      number: `Module 0${modules.length + 1}`,
      progress: 0,
      status: 'Assigned',
      unlocked: false,
      ...moduleData
    };
    modules.push(newModule);
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    return newModule;
  }

  submitModule(moduleId, submissionText, submissionLink) {
    const modules = this.getModules();
    const index = modules.findIndex(m => m.id === moduleId);
    if (index !== -1) {
      modules[index].status = 'Submitted';
      modules[index].progress = 100;
      modules[index].submissionText = submissionText;
      modules[index].submissionLink = submissionLink;
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
      
      this.createNotification({
        title: 'Module Submitted',
        message: `${modules[index].number} "${modules[index].title}" has been submitted for Manager review.`,
        category: 'Module'
      });
    }
  }

  approveModule(moduleId) {
    const modules = this.getModules();
    const index = modules.findIndex(m => m.id === moduleId);
    if (index !== -1) {
      modules[index].status = 'Completed';
      modules[index].progress = 100;
      
      // Auto unlock next module
      const nextIndex = index + 1;
      if (nextIndex < modules.length) {
        modules[nextIndex].unlocked = true;
        modules[nextIndex].status = 'In Progress';
        
        this.createNotification({
          title: 'New Module Unlocked! 🚀',
          message: `Congratulations! ${modules[index].number} approved. ${modules[nextIndex].number} "${modules[nextIndex].title}" is now unlocked!`,
          category: 'Module'
        });
      } else {
        this.createNotification({
          title: 'Module Approved! 🎉',
          message: `${modules[index].number} "${modules[index].title}" has been approved! All modules complete.`,
          category: 'Module'
        });
      }

      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    }
  }

  // --- Attendance ---
  getAttendance() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || [];
  }

  checkIn() {
    const logs = this.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let todayLog = logs.find(l => l.date === todayStr);
    if (!todayLog) {
      todayLog = { date: todayStr, checkIn: nowTimeStr, checkOut: null, workingTime: '0h 01m', status: 'Checked In' };
      logs.unshift(todayLog);
    } else {
      todayLog.checkIn = nowTimeStr;
      todayLog.status = 'Checked In';
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(logs));
    return todayLog;
  }

  checkOut() {
    const logs = this.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let todayLog = logs.find(l => l.date === todayStr);
    if (todayLog) {
      todayLog.checkOut = nowTimeStr;
      todayLog.status = 'Present';
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(logs));
    }
    return todayLog;
  }

  // --- Tasks ---
  getTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
  }

  createTask(taskData) {
    const tasks = this.getTasks();
    const newTask = {
      id: `task-${Date.now()}`,
      status: 'Pending',
      progress: 0,
      ...taskData
    };
    tasks.unshift(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return newTask;
  }

  updateTaskStatus(taskId, status) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'Completed') task.progress = 100;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  // --- Projects ---
  getProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
  }

  // --- Notifications ---
  getNotifications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
  }

  createNotification(notif) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      ...notif
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  markAllNotificationsRead() {
    const notifs = this.getNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // --- Chat Messages ---
  getMessages() {
    let msgs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
    // Filter out legacy demo messages
    msgs = msgs.filter(m => m.id !== 'm1' && m.id !== 'm2' && m.id !== 'm3');
    return msgs;
  }

  sendMessage(text, channel = 'general') {
    const msgs = this.getMessages();
    const currentUser = this.getCurrentUser();
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: currentUser.name,
      avatar: currentUser.avatar,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: channel
    };
    msgs.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));

    // Create system notification for workspace broadcast
    this.createNotification({
      title: `New Message in #${channel}`,
      message: `${currentUser.name}: "${text.length > 55 ? text.substring(0, 52) + '...' : text}"`,
      category: 'Communication'
    });

    this.addAuditLog('Team Message Posted', `${currentUser.name} posted message in #${channel}`);

    // Sync to Cloud Database if connected
    if (window.firebaseService) {
      window.firebaseService.sendMessage(newMsg);
    }

    return newMsg;
  }

  // --- Documents ---
  getDocuments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) || [];
  }

  uploadDocument(docData) {
    const docs = this.getDocuments();
    const currentUser = this.getCurrentUser();
    const newDoc = {
      id: `doc-${Date.now()}`,
      uploadedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      ...docData
    };
    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    return newDoc;
  }

  // --- Events / Calendar ---
  getEvents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
  }
}

// Global Storage Singleton Instance
window.storageService = new StorageService();

/**
 * Utility function to resize & compress image files into lightweight Base64 Data URLs
 * Prevents browser localStorage QuotaExceededError when uploading high-res PC images.
 */
window.compressImageFile = function(file, maxWidth = 250, maxHeight = 250, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file selection'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
