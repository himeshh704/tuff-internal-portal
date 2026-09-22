import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file name
    const ext = path.extname(file.name) || '.jpg';
    const filename = `order_slip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }

    const filePath = path.join(publicUploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload order slip file' },
      { status: 500 }
    );
  }
}
