import { loadChatMessages } from '@/app/features/ai/actions/chat-store';
import { getConversation } from '@/app/features/conversation/actions/conversation-actions';
import { ConversationView } from '@/app/features/conversation/components/conversatoin-view';
import { notFound } from 'next/navigation';
import React from 'react'

type ConversationPageProps = {
    params: Promise<{ id: string }>
};

const layout = async ({ params }: ConversationPageProps) => {
    const { id } = await params;
    try {
        await getConversation(id)
    } catch (error) {
        notFound()
    }
    
    const initialMessages = await loadChatMessages(id)
   
    return (
        <ConversationView 
        key={id}
      conversationId={id}
      initialMessages={initialMessages}
        />
    )
}

export default layout