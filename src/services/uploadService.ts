import { getAuthHeaders } from '../stores/useAuthStore';

export interface UploadResponse {
  success: boolean;
  message?: string;
  url: string;
  publicId?: string;
}

export const uploadService = {
  async uploadImage(file: File, folder: string = 'general'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const headers = getAuthHeaders();
    // Delete Content-Type so browser sets multipart boundary automatically
    delete headers['Content-Type'];

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }

    return data;
  },
};
