"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Monitor,
  Moon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  Sun,
  Trash2Icon,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";

// -----------------------------------------------------------------

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConversations, useDeleteConversation, useUpdateConversation } from "../hooks/use-conversation";

type Conversation = NonNullable<
  ReturnType<typeof useConversations>["data"]
>[number];

/**
 * Main application sidebar — logo, new chat, conversation list, theme toggle, and account.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: conversations, isLoading } = useConversations();

  const activeId = pathname.startsWith("/c/")
    ? pathname.split("/")[2]
    : undefined;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="font-semibold tracking-tight"
              render={<Link href="/" />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                C
              </span>
              <span className="truncate min-w-0 font-semibold group-data-[collapsible=icon]:hidden">
                ChaiGPT
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New chat" render={<Link href="/" />}>
              <PlusIcon className="shrink-0" />
              <span className="truncate min-w-0 group-data-[collapsible=icon]:hidden">
                New chat
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <ChatList
                conversations={conversations}
                isLoading={isLoading}
                activeId={activeId}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Renders the conversation list with loading skeletons or an empty-state message. */
function ChatList({
  conversations,
  isLoading,
  activeId,
}: {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeId: string | undefined;
}) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <Skeleton className="h-8 w-full" />
          </SidebarMenuItem>
        ))}
      </>
    );
  }

  if (!conversations?.length) {
    return (
      <p className="px-2 py-1.5 text-xs text-muted-foreground">No chats yet</p>
    );
  }

  return (
    <>
      {conversations.map((conversation) => (
        <ChatItem
          key={conversation.id}
          conversation={conversation}
          isActive={activeId === conversation.id}
        />
      ))}
    </>
  );
}

/** Single sidebar row for a conversation with rename, pin, and delete actions. */
function ChatItem({
  conversation,
  isActive,
}: {
  conversation: Conversation;
  isActive: boolean;
}) {
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation(
    isActive ? conversation.id : undefined
  );

  /** Prompts the user to rename the conversation and persists the new title. */
  function handleRename() {
    const next = window.prompt("Rename chat", conversation.title);
    if (!next || next.trim() === conversation.title) return;
    updateConversation.mutate({ id: conversation.id, title: next });
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={conversation.title}
        render={<Link href={`/c/${conversation.id}`} />}
        className={cn("w-full justify-start overflow-hidden", isActive && "font-medium")}
      >
        <span className="truncate min-w-0 flex-1 text-left">{conversation.title}</span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              showOnHover
              className="data-popup-open:bg-sidebar-accent"
            />
          }
        >
          <MoreHorizontalIcon />
          <span className="sr-only">Chat actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleRename}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateConversation.mutate({
                id: conversation.id,
                isPinned: !conversation.isPinned,
              })
            }
          >
            {conversation.isPinned ? <PinOffIcon /> : <PinIcon />}
            {conversation.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteConversation.mutate(conversation.id)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

/** Footer menu with Shadcn theme toggler and Clerk user account button. */
function SidebarFooterMenu() {
  const { setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip="Toggle theme"
                className="w-full justify-start gap-2.5"
              />
            }
          >
            <div className="relative flex size-4 items-center justify-center shrink-0">
              <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </div>
            <span className="truncate min-w-0 group-data-[collapsible=icon]:hidden">Theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 size-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 size-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 size-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-1.5 py-1.5 min-w-0 overflow-hidden">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8 shrink-0",
              },
            }}
          />
          <span className="truncate min-w-0 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
            Account
          </span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}