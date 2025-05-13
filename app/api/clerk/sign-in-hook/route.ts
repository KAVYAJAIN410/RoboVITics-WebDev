import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body?.data?.attributes?.email_address || "";

  const allowedDomain = "@vitstudent.ac.in";

  if (!email.endsWith(allowedDomain)) {
    return NextResponse.json(
      {
        status: "fail",
        message: "Only VIT student emails are allowed.",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({ status: "allow" });
}
