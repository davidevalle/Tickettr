import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse("# metrics placeholder\n", {
    headers: { "Content-Type": "text/plain; version=0.0.4" },
  });
}
