import { Transcripts } from "@/components/transcripts";
import { prisma } from "@/lib/prisma";

export default async function UserTranscript({ params }: { params: { ticket: string; user: string } }) {
  const messages = await prisma.ticketMessage.findMany({
    where: {
      ticketId: params.ticket,
      ticket: {
        openerId: params.user,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return <Transcripts messages={messages} />;
}
