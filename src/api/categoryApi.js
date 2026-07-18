import axiosInstance from './axiosInstance';

export const getAllCategory = async () => {
  try {
    const response = await axiosInstance.get("/api/category/getall");
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch categories';
    throw new Error(message);
  }
};


export const postCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/api/category/create', categoryData, {
      headers: {
          "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create category';
    throw new Error(message);
  }
};


export const updateCategory = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/category/update/${id}`, updatedData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
  } catch (error) { 
    const message = error.response?.data?.message || 'Failed to update category';
    throw new Error(message);
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/category/delete/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete category';
    throw new Error(message);
  }
};
