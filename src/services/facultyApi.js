// ARH Faculty Portal API Service Layer
// Connects to Node.js/Express + MySQL backend with JWT authentication

const API_BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('arh_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const facultyApi = {
  // MODULE 1: Dashboard Stats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/faculty/dashboard-stats`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch faculty dashboard stats.');
    }
    return data.stats;
  },

  // MODULE 2 & 3: Manage Resources & Filtering
  async getResources(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all' && v !== 'ALL') {
        queryParams.append(k, v);
      }
    });

    const res = await fetch(`${API_BASE_URL}/faculty/resources?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load faculty resources.');
    }
    return {
      items: data.data || [],
      pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  async getResourceById(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/resources/${id}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Resource not found.');
    }
    return data.resource;
  },

  async uploadResource(formData) {
    const isFormData = formData instanceof FormData;
    const headers = { ...getAuthHeader() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/faculty/resources`, {
      method: 'POST',
      headers,
      body: isFormData ? formData : JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to publish faculty resource.');
    }
    return data;
  },

  async updateResource(id, payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/resources/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update resource metadata.');
    }
    return data;
  },

  async archiveResource(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/resources/${id}/archive`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to archive resource.');
    }
    return data;
  },

  async deleteResource(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/resources/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete resource.');
    }
    return data;
  },

  // MODULE 4: Department Management
  async getDepartments() {
    const res = await fetch(`${API_BASE_URL}/faculty/departments`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch departments.');
    }
    return data.departments || [];
  },

  async createDepartment(payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/departments`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to register department.');
    }
    return data.department;
  },

  async updateDepartment(id, payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/departments/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update department.');
    }
    return data.department;
  },

  async deleteDepartment(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/departments/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete department.');
    }
    return data;
  },

  // MODULE 5: Subject Management
  async getSubjects(departmentId = null) {
    const url = departmentId && departmentId !== 'all'
      ? `${API_BASE_URL}/faculty/subjects?department=${encodeURIComponent(departmentId)}`
      : `${API_BASE_URL}/faculty/subjects`;

    const res = await fetch(url, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch subjects.');
    }
    return data.subjects || [];
  },

  async createSubject(payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/subjects`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to register subject.');
    }
    return data.subject;
  },

  async updateSubject(id, payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/subjects/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update subject.');
    }
    return data.subject;
  },

  async deleteSubject(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/subjects/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete subject.');
    }
    return data;
  },

  // MODULE 6: Resource Type Management
  async getResourceTypes() {
    const res = await fetch(`${API_BASE_URL}/faculty/resource-types`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch resource types.');
    }
    return data.resourceTypes || [];
  },

  async createResourceType(payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/resource-types`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to register resource type.');
    }
    return data.resourceType;
  },

  async updateResourceType(id, payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/resource-types/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update resource type.');
    }
    return data.resourceType;
  },

  async deleteResourceType(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/resource-types/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete resource type.');
    }
    return data;
  },

  // MODULE 7: Academic Year Management
  async getAcademicYears() {
    const res = await fetch(`${API_BASE_URL}/faculty/academic-years`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch academic years.');
    }
    return data.academicYears || [];
  },

  async createAcademicYear(payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/academic-years`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create academic year.');
    }
    return data.academicYear;
  },

  async updateAcademicYear(id, payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/academic-years/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update academic year.');
    }
    return data.academicYear;
  },

  async setActiveAcademicYear(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/academic-years/${id}/set-active`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to set active academic year.');
    }
    return data.academicYear;
  },

  async deleteAcademicYear(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/academic-years/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete academic year.');
    }
    return data;
  },

  // MODULE 8: Student Contribution Verification
  async getVerifications(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all' && v !== 'ALL') {
        queryParams.append(k, v);
      }
    });

    const res = await fetch(`${API_BASE_URL}/faculty/verification?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load verification submissions.');
    }
    return {
      items: data.data || [],
      pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      counts: data.counts || { all: 0, pending: 0, underReview: 0, verified: 0, rejected: 0, published: 0 }
    };
  },

  async getVerificationDetails(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/verification/${id}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch submission review details.');
    }
    return data.data; // { resource, reviewHistory }
  },

  async updateVerificationStatus(id, { status, remarks }) {
    const res = await fetch(`${API_BASE_URL}/faculty/verification/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, remarks })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update verification status.');
    }
    return data;
  },

  // MODULE 9: Faculty Resource Request Management
  async getRequests(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all' && v !== 'ALL') {
        queryParams.append(k, v);
      }
    });

    const res = await fetch(`${API_BASE_URL}/faculty/requests?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load resource requests.');
    }
    return {
      items: data.data || [],
      pagination: data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      counts: data.counts || { all: 0, pending: 0, inProgress: 0, completed: 0, closed: 0 }
    };
  },

  async getRequestDetails(id) {
    const res = await fetch(`${API_BASE_URL}/faculty/requests/${id}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch request details.');
    }
    return data.request;
  },

  async updateRequestStatus(id, { status, staff_remarks }) {
    const res = await fetch(`${API_BASE_URL}/faculty/requests/${id}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, staff_remarks })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update request status.');
    }
    return data;
  },

  // MODULE 10: Reports & Analytics
  async getReportsAnalytics() {
    const res = await fetch(`${API_BASE_URL}/faculty/reports/analytics`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load reports and analytics.');
    }
    return data.data;
  },

  // MODULE 11: Faculty Profile & Credential Management
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load faculty profile.');
    }
    return {
      profile: data.profile,
      stats: data.stats
    };
  },

  async updateProfile(payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update profile.');
    }
    return data.profile;
  },

  async updatePassword(payload) {
    const res = await fetch(`${API_BASE_URL}/faculty/profile/password`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update password.');
    }
    return data;
  }
};
