import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/users?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'UserId required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to find user' }, { status: 500 });
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'UserId and name required' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { id: userId, name },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
