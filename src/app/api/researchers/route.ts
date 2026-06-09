import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/auth";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { reports: true } } },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, password, department } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }
  const user = await createUser(email, password, name, "RESEARCHER");
  if (department) {
    await prisma.user.update({ where: { id: user.id }, data: { department } });
  }
  const { password: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}