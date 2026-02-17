import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export default withAuth(async (req) => {
  const [, , userId, ticketId] = req.nextUrl.pathname.split("/");
  const authUser = req.nextauth.token?.sub;

  if (!authUser) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, openerId: userId },
    select: { openerId: true },
  });

  if (!ticket || (ticket.openerId !== authUser && userId !== authUser)) {
    return NextResponse.redirect(new URL("/404", req.url));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/transcripts/:path*"] };
