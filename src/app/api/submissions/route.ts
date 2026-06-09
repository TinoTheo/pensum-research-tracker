import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

const statusToDb: Record<string, Status> = {
  'in-progress': 'IN_PROGRESS',
  'completed': 'COMPLETED',
  'blocked': 'BLOCKED',
};

const statusFromDb: Record<string, string> = {
  'IN_PROGRESS': 'in-progress',
  'COMPLETED': 'completed',
  'BLOCKED': 'blocked',
};

function mapReports(reports: any[]) {
  return reports.map((r) => ({
    ...r,
    status: statusFromDb[r.status] || r.status,
  }));
}

function mapReport(report: any) {
  return {
    ...report,
    status: statusFromDb[report.status] || report.status,
  };
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(mapReports(reports));
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, problem, findings, solutions, status, userId, attachments } = body;

    if (!title || !problem || !findings || !solutions || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbStatus: Status = statusToDb[status] ?? Status.IN_PROGRESS;

    const report = await prisma.report.create({
      data: {
        title,
        problem,
        findings,
        solutions,
        status: dbStatus,
        userId,
        attachments,
      },
      include: { user: true },
    });

    return NextResponse.json(mapReport(report), { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}