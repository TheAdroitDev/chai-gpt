"use client"


import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, type UIMessage } from 'ai';
import React, { useMemo } from 'react'
import { useConversations } from "../hooks/use-conversation"
import { useChat } from "@ai-sdk/react"
import { queryKeys } from '../utils/query-keys';
import { toast } from 'sonner';
import { ChatMessages } from './chat-messages';
import { ChatEmpty } from './chat-empty';
import { ChatComposer } from './chat-composer';


import {
  Conversation,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { useStickToBottomContext } from 'use-stick-to-bottom';
import { Persona, type PersonaState } from '@/components/ai-elements/persona';

type ConversationViewProps = {
    conversationId: string;
    initialMessages: UIMessage[]
}

function ComposerWithScroll({
    onSend,
    isSending,
    status,
}: {
    onSend: (text: string) => Promise<void> | void;
    isSending: boolean;
    status: ChatStatus;
}) {
    const { scrollToBottom } = useStickToBottomContext();
    const [isInputFocused, setIsInputFocused] = React.useState(true);

    const personaState: PersonaState =
        status === "submitted"
            ? "thinking"
            : status === "streaming"
            ? "speaking"
            : isInputFocused
            ? "idle"
            : "asleep";

    return (
        <div className="sticky bottom-0 z-20 w-full shrink-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-3 pb-2">
            <div className="mx-auto flex max-w-3xl justify-end px-4 pb-1 md:px-6">
                <Persona variant="mana" state={personaState} className="size-10 sm:size-12 pointer-events-none bg-transparent dark:mix-blend-screen" />
            </div>
            <ChatComposer
                onSend={async (text) => {
                    scrollToBottom({ behavior: "smooth" });
                    await onSend(text);
                }}
                isSending={isSending}
                autoFocus
                onFocusChange={setIsInputFocused}
            />
        </div>
    );
}

export const ConversationView = ({ conversationId, initialMessages }: ConversationViewProps) => {
    const queryClient = useQueryClient()
    const { data: conversations } = useConversations();

    const transport = useMemo(() => new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
            body: {
                id, message: messages.at(-1)
            }
        })
    }), []);

    const { messages, sendMessage, status } = useChat({
        id: conversationId,
        messages: initialMessages,
        transport,
        onFinish: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    })

    const title =
        conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

    return (
        <div className="relative flex h-full max-h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <Conversation className="relative h-full w-full min-h-0 overflow-y-auto">
                {/* Sticky top navbar header */}
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mx-1 h-4" />
                    <h1 className="truncate text-sm font-medium text-foreground/90 max-w-[70vw] sm:max-w-md md:max-w-xl" title={title}>
                        {title}
                    </h1>
                </header>

                {/* Messages content area */}
                <div className="flex-1 min-h-0">
                    {messages.length === 0 ? (
                        <ChatEmpty />
                    ) : (
                        <ChatMessages messages={messages} status={status} />
                    )}
                </div>

                {/* Sticky bottom input container — scrolls to bottom on user send */}
                <ComposerWithScroll
                    onSend={(text) => {
                        void sendMessage({ text });
                    }}
                    isSending={status !== "ready"}
                    status={status}
                />

                <ConversationScrollButton className="bottom-24 z-30" />
            </Conversation>
        </div>
    )
}

