import { getUser, getUserId } from '@/lib/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const user = await getUser();
  const userId = await getUserId(user?.email!);
  
  if (user) {
    return NextResponse.json({ user , userId}, { status: 200 });
  } else {
    return NextResponse.json({ user: undefined }, { status: 200 });
  }
}
