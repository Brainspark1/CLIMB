import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '../../../../lib/prisma';

const prisma = getPrismaClient();

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
