import axiosInstance from './axiosInstance';


export const postRegister = async (adminData) => {
  try {
    const response = await axiosInstance.post('/api/admin/create', adminData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data; // { success, message, token, user }
  } catch (error) {
    if (error.response) {
      const data = error.response.data || {};
      const status = error.response.status;

      // Extract message from various backend error shapes
      let message = data.message || data.error || data.msg;
      if (!message && data.errors) {
        const errList = Array.isArray(data.errors) ? data.errors : Object.values(data.errors);
        message = errList.map((e) => (typeof e === 'string' ? e : e?.message || e?.msg)).filter(Boolean).join('; ');
      }
      if (!message && status === 500) {
        message = 'Server error. Check backend logs or try again.';
      }

      throw new Error(message || 'Registration failed');
    }
    if (error.request) {
      throw new Error('Server not responding');
    }
    throw new Error(error.message || 'Something went wrong');
  }
};

export const postLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post('/api/admin/login', { email, password });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

export const getBanners = async () => {
  try {
    const response = await axiosInstance.get('/api/banner/getall');
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch banners';
    throw new Error(message);
  } 
};

export const postBanner = async (bannerData) => {
  try {
    const response = await axiosInstance.post('/api/banner/create', bannerData);
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to create banner';
    throw new Error(message);
  } 
};

export const updateBanner = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/banner/update/${id}`, updatedData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update banner';
    throw new Error(message);
  }
};

export const deleteBanner = async (id, deleteData) => {
  try {
    const response = await axiosInstance.delete(`/api/banner/delete/${id}`, deleteData);
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to delete banner';
    throw new Error(message);
  }
};

export const searchBanners = async (query) => {
  try {
    const response = await axiosInstance.get(`/api/banner/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to search banners';
    throw new Error(message);
  }
};





