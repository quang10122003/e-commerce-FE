export type TokenType =
    | "Bearer"
    | string;

export type AssignmentStatus =
    | "UNASSIGNED"
    | "ASSIGNED"
    | string;

export type MessageType =
    | "TEXT"
    | "SYSTEM"
    | string;

export interface WsTicketResponse {
    ticket: string;
    tokenType: TokenType;
    expiresInSeconds: number;
}

export interface ChatRoom {
    id: number;

    productId: number;
    productName: string;

    userId: number;
    userName: string;

    adminId: number | null;
    adminName: string | null;

    assignmentStatus: AssignmentStatus;

    lastMessageContent: string | null;

    lastMessageType: MessageType | null;

    lastMessageSenderId: number | null;
    lastMessageSenderName: string | null;

    lastMessageAt: string | null;

    unreadCount: number;

    createdAt: string;
}

export interface ChatMessage {
    id: number;

    roomId: number;

    senderId: number | null;
    senderName: string | null;

    content: string;

    messageType: MessageType;

    read: boolean;

    createdAt: string;
}