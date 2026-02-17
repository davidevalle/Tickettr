interface TranscriptMessage {
  id: string;
  authorName: string;
  authorIcon: string | null;
  createdAt: Date;
  content: string;
}

export function Transcripts({ messages }: { messages: TranscriptMessage[] }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Ticket Transcript</h1>
      <p className="mb-6 text-sm text-slate-500">Archived ticket conversation.</p>
      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              {message.authorIcon ? <img src={message.authorIcon} alt="avatar" className="h-8 w-8 rounded-full" /> : null}
              <strong>{message.authorName}</strong>
              <span className="text-xs text-slate-500">{message.createdAt.toLocaleString()}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
