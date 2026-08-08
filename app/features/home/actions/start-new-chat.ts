"use server"

import { prisma } from "@/lib/db";
import { requireUser } from "../../auth/action/require-user";

export async function startNewChat() {
    const user = await requireUser();

    // 1. Check if the user already has an empty conversation (0 messages)
    const existingEmpty = await prisma.conversation.findFirst({
        where: {
            userId: user.id,
            isArchived: false,
            messages: {
                none: {},
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (existingEmpty) {
        return existingEmpty.id;
    }

    // 2. Only create a new conversation if no empty conversation exists
    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
            title: "New Chat",
        },
    });

    return conversation.id;
}