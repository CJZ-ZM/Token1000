import { NextRequest, NextResponse } from 'next/server';
import { getPendingSubmissions, reviewSubmission } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple admin auth check (in production, use proper authentication)
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'token1000-admin-key';

function verifyAdmin(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-key');
  return apiKey === ADMIN_KEY;
}

// GET - List all pending submissions (admin only)
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';

    const submissions = await getPendingSubmissions();

    // Filter by status if specified
    const filtered = status === 'all'
      ? submissions
      : submissions.filter((s: any) => s.status === status);

    return NextResponse.json({
      submissions: filtered,
      total: filtered.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST - Review a submission (approve/reject)
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { submissionId, action, reviewedBy } = body;

    if (!submissionId || !action || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId, action, reviewedBy' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'duplicate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve, reject, or duplicate' },
        { status: 400 }
      );
    }

    await reviewSubmission(submissionId, action === 'approve', reviewedBy);

    return NextResponse.json({
      success: true,
      message: `Submission ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked as duplicate'}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json(
      { error: 'Failed to review submission' },
      { status: 500 }
    );
  }
}
