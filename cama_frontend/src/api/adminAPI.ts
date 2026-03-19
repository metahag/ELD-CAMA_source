
  export const approveUpload = async (id: string): Promise<void> => {
    const response = await fetch(`/api/uploads/${id}/approve`, { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to approve');
    }
  };
  
  export const rejectUpload = async (id: string): Promise<void> => {
    const response = await fetch(`/api/uploads/${id}/reject`, { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to reject');
    }
  };
