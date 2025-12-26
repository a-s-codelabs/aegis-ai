import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { voice } = body;

    if (!voice || !['default', 'female', 'male'].includes(voice)) {
      return NextResponse.json(
        { error: 'Invalid voice preference' },
        { status: 400 }
      );
    }

    const sessionData = req.headers.get('cookie');
    
    return NextResponse.json({ success: true, voice });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save voice preference' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const sessionData = req.headers.get('cookie');
    
    return NextResponse.json({ voice: 'default' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get voice preference' },
      { status: 500 }
    );
  }
}

