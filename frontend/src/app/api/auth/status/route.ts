import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  try {
    const isAuthed = await isAuthenticated();

    return NextResponse.json(
      { authenticated: isAuthed },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}
