import axiosInstance from './axiosInstance';

export const getAllBrand =async () =>{
    try{
        const response = await axiosInstance.get('/api/brand/all');
        return response.data.brand;
    }catch(error){
         const message = error.response?.data?.message || 'Failed to fetch categories';
         throw new error (message);
    }
};

export const postBrand = async (categoryData) =>{
    try{
        const response = await axiosInstance.post('/api/brand/create', categoryData, {
      headers: {
          "Content-Type": "multipart/form-data",
        },

    });
    return response.data;
}
    catch(error){
        
    }
}

export const updateBrand = async (id, updatedData) => {
    try{
     const response = await axiosInstance.put(`/api/brand/update/${id}`, updatedData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update banner';
    throw new Error(message);
  }
}

export const deleteBrand = async (id, deleteBrand) => {
     try {
    const response = await axiosInstance.delete(`/api/brand/delete/${id}`, deleteBrand);
    return response.data;
  }
  catch (error) {
    const message = error.response?.data?.message || 'Failed to delete banner';
    throw new Error(message);
  }
}