"use client"
import { ChatMessage } from "@/types/chat/chat";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCreateWsTicketMutation } from "../api/backend-api"
import { createChatStompClient } from "./createChatStompClient";

type Options = {
    roomId: number | null;
    onMessage: (message: ChatMessage) => void
};

export function useChatRoomSocket({ roomId, onMessage } : Options){
    // Giữ STOMP client hiện tại để có thể publish tin nhắn và đóng kết nối khi đổi room/unmount.
    const clientRef = useRef<Client | null>(null);

    // Giữ subscription của room hiện tại để unsubscribe đúng topic khi cleanup.
    const subscriptionRef = useRef<StompSubscription | null>(null);

    // Status kết nối dùng cho UI: idle, connecting, connected hoặc error.
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
    const [createWsTicket] = useCreateWsTicketMutation();

    useEffect(()=>{
        if(!roomId){
            return
        }
        // Flag đánh dấu effect đã cleanup, tránh set state/subscribe sau khi room đổi hoặc component unmount.
        let disposed = false
        async function connect(){
            try{
                setStatus("connecting")
                
                const ticketRepone = await createWsTicket().unwrap();
                const wsTicket = ticketRepone.data;
                if (!wsTicket) {
                    throw new Error("Khong tao duoc ws-ticket");
                }
                if(disposed) return

                const client = createChatStompClient({
                    ticket:wsTicket.ticket,
                    onConnect:()=>{
                        if(disposed) return
                        setStatus("connected")

                        subscriptionRef.current = client.subscribe(
                            `/topic/chat/rooms/${roomId}`,
                            (frame:IMessage) =>{
                                const messge = JSON.parse(frame.body) as ChatMessage
                                onMessage(messge)
                            }
                        )
                    },
                    onError:()=>{
                        if(!disposed) setStatus("error")
                    }
                })
                clientRef.current = client
                client.activate()
            }
            catch{
                if(!disposed) setStatus("error")
            }
        }
        connect();

        return() =>{
            disposed = true
            subscriptionRef.current?.unsubscribe()
            subscriptionRef.current = null
            clientRef.current?.deactivate()
            clientRef.current = null
           
        }
    },[roomId,createWsTicket,onMessage])

    const sendMessage = useCallback((content:string)=>{
        if(!roomId || !clientRef.current?.connected) return false
        clientRef.current.publish({
            destination: `/api/chat/rooms/${roomId}/send`,
            body:JSON.stringify({content})
        })

        return true
    },[roomId])

    return {sendMessage,status}
}
