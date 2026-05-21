import { getMessages } from "@/app/actions/chat";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatWindow from "./ChatWindow";

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversationId = params.id;
  const { messages, error } = await getMessages(conversationId);

  if (error || !messages) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/50">
        Percakapan tidak ditemukan atau Anda tidak memiliki akses.
      </div>
    );
  }

  // Ambil detail percakapan untuk mendapatkan nama header chat
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true, handle: true } } }
      }
    }
  });

  if (!conversation) return null;

  const otherParticipant = conversation.participants.find(p => p.userId !== session.user?.id)?.user;
  const chatName = conversation.isGroup ? conversation.name : otherParticipant?.name || "User";
  const chatImage = conversation.isGroup ? null : otherParticipant?.image;

  return (
    <ChatWindow 
      initialMessages={messages} 
      conversationId={conversationId} 
      currentUser={session.user} 
      chatName={chatName || "Chat"} 
      chatImage={chatImage} 
    />
  );
}
