export const uploadFile = async (uri, path) => {
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing in .env");
    }

    const formData = new FormData();
    
    // Create a file object from URI
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const type = uri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    
    formData.append('file', {
      uri: uri,
      name: filename,
      type: type
    });
    
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', path); // Organize in folders like 'provider_documents'

    // Cloudinary supports 'auto' resource type which handles both images and raw files (PDFs)
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || "Failed to upload to Cloudinary");
    }
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw error;
  }
};
