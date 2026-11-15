// ARH Student Portal API Service Layer
// Connects to Node.js/Express + MySQL backend with resilient fallback support

const API_BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('arh_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const studentApi = {
  // Metadata
  async getDepartments() {
    try {
      const res = await fetch(`${API_BASE_URL}/meta/departments`);
      const data = await res.json();
      if (data.success) return data.departments;
    } catch (e) {
      console.warn('Backend meta/departments unavailable, using fallback list');
    }
    return [
      { id: 'dept-cs', code: 'CS', name: 'Computer Science', icon: 'Code' },
      { id: 'dept-ee', code: 'EE', name: 'Electrical Engineering', icon: 'Cpu' },
      { id: 'dept-me', code: 'ME', name: 'Mechanical Engineering', icon: 'Settings' },
      { id: 'dept-ce', code: 'CE', name: 'Civil Engineering', icon: 'Building' },
      { id: 'dept-math', code: 'MATH', name: 'Mathematics', icon: 'Sigma' },
      { id: 'dept-phys', code: 'PHYS', name: 'Physics', icon: 'Atom' }
    ];
  },

  async getSubjects(departmentId = null) {
    try {
      const url = departmentId && departmentId !== 'all'
        ? `${API_BASE_URL}/meta/subjects?department=${encodeURIComponent(departmentId)}`
        : `${API_BASE_URL}/meta/subjects`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) return data.subjects;
    } catch (e) {
      console.warn('Backend meta/subjects unavailable, using fallback list');
    }
    return [
      { id: 'subj-cs101', department_id: 'dept-cs', code: 'CS101', name: 'Introduction to Programming (C++/Python)' },
      { id: 'subj-cs201', department_id: 'dept-cs', code: 'CS201', name: 'Data Structures & Algorithms' },
      { id: 'subj-cs301', department_id: 'dept-cs', code: 'CS301', name: 'Operating Systems & Concurrency' },
      { id: 'subj-cs302', department_id: 'dept-cs', code: 'CS302', name: 'Database Management Systems & SQL' },
      { id: 'subj-cs401', department_id: 'dept-cs', code: 'CS401', name: 'Distributed Systems & Cloud Computing' },
      { id: 'subj-ee201', department_id: 'dept-ee', code: 'EE201', name: 'Electric Circuit Analysis' },
      { id: 'subj-math215', department_id: 'dept-math', code: 'MATH215', name: 'Multivariable Calculus & Differential Eq' }
    ];
  },

  async getResourceTypes() {
    try {
      const res = await fetch(`${API_BASE_URL}/meta/resource-types`);
      const data = await res.json();
      if (data.success) return data.resourceTypes;
    } catch (e) {
      console.warn('Backend meta/resource-types unavailable, using fallback list');
    }
    return [
      { id: 'type-notes', code: 'notes', name: 'Lecture Notes', icon: 'BookOpen' },
      { id: 'type-exam', code: 'exam', name: 'Past Exams & Midterms', icon: 'FileText' },
      { id: 'type-cheatsheet', code: 'cheatsheet', name: 'Cheatsheets & Formulas', icon: 'Zap' },
      { id: 'type-lab', code: 'lab_manual', name: 'Lab Manuals & Reports', icon: 'Terminal' },
      { id: 'type-assignment', code: 'assignment', name: 'Problem Sets & Solutions', icon: 'CheckSquare' },
      { id: 'type-syllabus', code: 'syllabus', name: 'Curriculum & Syllabus', icon: 'Bookmark' }
    ];
  },

  // MODULE 1: Dashboard Stats
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/student/dashboard-stats`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) return data.stats;
      throw new Error(data.message || 'Failed to load stats');
    } catch (e) {
      console.warn('Fallback: generating local dashboard metrics');
      return {
        totalAvailable: 24,
        totalBookmarks: 3,
        totalDownloads: 12,
        activeRequests: 2,
        myContributions: { total: 4, pending: 1, published: 3 },
        recentlyPublished: [
          {
            id: 'res-001',
            title: 'CS201: Comprehensive Trees, Graphs & Backtracking Midterm Prep',
            department_name: 'Computer Science',
            subject_code: 'CS201',
            resource_type_name: 'Past Exam',
            academic_year: '2024-2025',
            semester: 'Semester 3',
            download_count: 142
          },
          {
            id: 'res-002',
            title: 'MATH215: Multivariable Calculus Full Formula Cheat Sheet',
            department_name: 'Mathematics',
            subject_code: 'MATH215',
            resource_type_name: 'Cheatsheet',
            academic_year: '2024-2025',
            semester: 'Semester 3',
            download_count: 210
          }
        ],
        recentActivity: [
          { id: 'act-1', type: 'DOWNLOAD', title: 'Downloaded "CS201 Midterm Prep"', timestamp: new Date().toISOString() },
          { id: 'act-2', type: 'BOOKMARK', title: 'Saved "MATH215 Cheat Sheet"', timestamp: new Date(Date.now() - 3600000).toISOString() }
        ]
      };
    }
  },

  // MODULE 2 & 3: Resource Library
  async getResources(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
          queryParams.append(k, v);
        }
      });

      const res = await fetch(`${API_BASE_URL}/student/resources?${queryParams.toString()}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          items: data.data,
          pagination: data.pagination
        };
      }
      throw new Error(data.message || 'Failed to load resources');
    } catch (e) {
      console.warn('Fallback library query:', e.message);
      return {
        items: [],
        pagination: { total: 0, page: 1, limit: 12, totalPages: 1 }
      };
    }
  },

  // MODULE 4: Resource Details
  async getResourceById(id) {
    const res = await fetch(`${API_BASE_URL}/student/resources/${id}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Resource not found');
    }
    return data.resource;
  },

  // Download File Action
  async downloadResource(id, filename = 'academic_resource.pdf') {
    const res = await fetch(`${API_BASE_URL}/student/resources/${id}/download`, {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Download failed');
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },

  // MODULE 5: Bookmarks
  async getBookmarks() {
    const res = await fetch(`${API_BASE_URL}/student/bookmarks`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch bookmarks');
    }
    return data.bookmarks;
  },

  async addBookmark(resourceId) {
    const res = await fetch(`${API_BASE_URL}/student/bookmarks/${resourceId}`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to add bookmark');
    }
    return data;
  },

  async removeBookmark(resourceId) {
    const res = await fetch(`${API_BASE_URL}/student/bookmarks/${resourceId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to remove bookmark');
    }
    return data;
  },

  // MODULE 6: Upload Resource
  async uploadResource(formData) {
    const isFormDataInstance = formData instanceof FormData;
    const headers = { ...getAuthHeader() };

    // When sending FormData, browser automatically sets multipart boundary
    if (!isFormDataInstance) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/student/upload`, {
      method: 'POST',
      headers,
      body: isFormDataInstance ? formData : JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },

  // MODULE 7: My Contributions
  async getContributions() {
    const res = await fetch(`${API_BASE_URL}/student/contributions`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch contributions');
    }
    return data.contributions;
  },

  // MODULE 8: Resource Requests
  async getRequests() {
    const res = await fetch(`${API_BASE_URL}/student/requests`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch requests');
    }
    return data.requests;
  },

  async createRequest(payload) {
    const res = await fetch(`${API_BASE_URL}/student/requests`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to submit request');
    }
    return data;
  },

  // MODULE 9: Student Profile
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/student/profile`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch profile');
    }
    return data.profile;
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE_URL}/student/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data;
  },

  async updatePassword(currentPassword, newPassword, confirmPassword) {
    const res = await fetch(`${API_BASE_URL}/student/profile/password`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update password');
    }
    return data;
  }
};
