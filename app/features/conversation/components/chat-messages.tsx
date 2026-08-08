"use client";

import { isTextUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

/** Extracts plain text from a `UIMessage` by joining all text parts. */
function getMessageText(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
};

/**
 * Renders the conversation message list with markdown responses and a loading indicator.
 */
export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <ConversationContent>
      {messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <MessageContent>
            <MessageResponse>{getMessageText(message)}</MessageResponse>
          </MessageContent>
        </Message>
      ))}

      {isWaiting ? (
        <Message from="assistant">
          <MessageContent>
            <Marker>
              <MarkerIcon>
                <Loader />
              </MarkerIcon>
              <MarkerContent>Thinking...</MarkerContent>
            </Marker>
          </MessageContent>
        </Message>
      ) : null}
    </ConversationContent>
  );
}