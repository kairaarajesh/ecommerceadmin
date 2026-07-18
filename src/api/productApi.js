import axiosInstance from "./axiosInstance";


export const postProduct = async (productData) => {
  try {
    const response = await axiosInstance.post('/api/product/create', productData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
    });
      return response.data;
    }catch (error) {
    const message = error.response?.data?.message || 'Failed to create product';
    throw new Error(message);
  }
};

export const getProducts = async () => {
  try {
    const response = await axiosInstance.get('/api/product/getall');  
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch products';
    throw new Error(message);
  }   
};

export const updateProduct = async (id, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/product/update/${id}`, updatedData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update product';
    throw new Error(message);
  } 
};

export const deleteProduct = async (id, deleteData) => {
  try {
    const response = await axiosInstance.delete(`/api/product/delete/${id}`, deleteData);
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to delete product';
    throw new Error(message);
  }
};