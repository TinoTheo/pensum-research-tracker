import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const statusToDb: Record<string, string> = {
  'in-progress': 'IN_PROGRESS',
  'completed': 'COMPLETED',
  'blocked': 'BLOCKED',
};

const statusFromDb: Record<string, string> = {
  'IN_PROGRESS': 'in-progress',
  'COMPLETED': 'completed',
  'BLOCKED': 'blocked',
};

function mapReport(report: any) {
  return {
    ...report,
    status: statusFromDb[report.status] || report.status,
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapReport(report));
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  const data: any = { ...body };
  if (data.status) {
    data.status = statusToDb[data.status] || data.status;
  }
  const report = await prisma.report.update({
    where: { id },
    data,
    include: { user: true },
  });
  return NextResponse.json(mapReport(report));
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await prisma.report.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}