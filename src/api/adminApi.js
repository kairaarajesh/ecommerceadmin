import axios from './axios';


export const postRegister = async (adminData) => {
  try {
    const response = await axios.post('/api/admin/create', adminData, {
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
    const response = await axios.post('/api/admin/login', { email, password });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

export const getBanners = async () => {
  try {
    const response = await axios.get('/api/banner/getall');
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch banners';
    throw new Error(message);
  } 
};


export const postProduct = async (productData) => {
  try {
    const response = await axios.post('/api/product/create', productData);
      return response.data;
    }catch (error) {
    const message = error.response?.data?.message || 'Failed to create product';
    throw new Error(message);
  }
};

export const getProducts = async () => {
  try {
    const response = await axios.get('/api/product/getall');  
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch products';
    throw new Error(message);
  }   
};

export const updateProduct = async (id, updatedData) => {
  try {
    const response = await axios.put(`/api/product/update/${id}`, updatedData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update product';
    throw new Error(message);
  } 
};

export const deleteProduct = async (id, deleteData) => {
  try {
    const response = await axios.delete(`/api/product/delete/${id}`, deleteData);
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to delete product';
    throw new Error(message);
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get('/api/category/all');
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch categories';
    throw new Error(message);
  }
};