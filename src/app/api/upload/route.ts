import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error('Please define the ImageKit environment variables inside .env.local');
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(req: NextRequest) {
  try {
    const { file, fileName } = await req.json();
    
    const response = await imagekit.upload({
      file,
      fileName,
      useUniqueFileName: true,
    });

    return NextResponse.json({ url: response.url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
} 