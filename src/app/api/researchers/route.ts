import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { reports: true } } },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, department } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }
  const user = await prisma.user.create({
    data: { name, email, department },
  });
  return NextResponse.json(user, { status: 201 });
}