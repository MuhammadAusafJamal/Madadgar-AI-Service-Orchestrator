export const uploadFile = async (uri, folder) => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing in .env');
  }

  const filename = uri.substring(uri.lastIndexOf('/') + 1);
  const type = uri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri, name: filename, type });
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }
  return data.secure_url;
};
