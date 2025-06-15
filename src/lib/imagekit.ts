export async function uploadImage(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const base64File = Buffer.from(buffer).toString('base64');

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64File,
        fileName: file.name,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 