import { auth } from '@clerk/nextjs/server'
import React from 'react'
import { onBoard } from '../features/auth/action/onboard';
import { ChatShell } from '../features/conversation/components/chat-shell';


// Authenticated app layout — protects routes, syncs user to DB, and wraps content in `ChatShell` later !.

const RootGrouplayout = async ({ children }: { children: React.ReactNode }) => {

    await auth.protect();
    await onBoard();

    return (
        <>
        <ChatShell>
        { children }
        </ChatShell>
        </>
    )
}

export default RootGrouplayout