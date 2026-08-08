"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";


/**
 * App shell with collapsible sidebar and main content area for chat views.
 */
export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full max-h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-full max-h-svh flex flex-col overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}