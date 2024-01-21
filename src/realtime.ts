// noinspection JSUnusedGlobalSymbols

import WebSocket from "ws";
import { WsMessage } from "./types/WsMessage";
import { Message, MessageQuery } from "./models/Message";
import { MessageModel, MessageQueryModel } from "./types/Message";
import { RequestFunc } from "./client";

export class RealtimeClient {
    accessToken: string | null;
    ws: WebSocket | null;
    pingInterval: NodeJS.Timeout | null;

    onMessageCreatedEvent: (message: Message) => void;
    onMessageEditedEvent: (message: MessageQuery) => void;
    onMessageDeletedEvent: (message: MessageQuery) => void;

    constructor(
        private getToken: () => Promise<string>,
        private request: RequestFunc
    ) {
        this.accessToken = null;
        this.ws = null;
        this.pingInterval = null;
        this.onMessageCreatedEvent = (_) => { };
        this.onMessageEditedEvent = (_) => { };
        this.onMessageDeletedEvent = (_) => { };
    }

    public async start(userUid: string) {
        if (!this.accessToken)
            this.accessToken = await this.getToken();

        if (this.ws)
            throw new Error("WebSocket already initialized");

        this.ws = new WebSocket(`wss://api.jusfuny.com/users/${userUid}/ws`, {
            headers: {
                "Authorization": this.accessToken
            }
        });

        this.ws.on("open", () => {
            console.log("Client started");
        });

        this.ws.on("message", (message: Buffer) => {
            const wsMessage: WsMessage = JSON.parse(message.toString("utf-8"));

            if (wsMessage.type == 1) { // Chat message created
                const data = wsMessage.data as MessageModel;
                this.onMessageCreatedEvent(new Message(data, data.author.id == userUid, userUid, this.request));
            }
            else if (wsMessage.type == 2) { // Chat message edited
                const data = wsMessage.data as MessageQueryModel;
                this.onMessageEditedEvent(new MessageQuery(data, data.author.id == userUid, this.request));
            }
            else if (wsMessage.type == 3) { // Chat message deleted
                const data = wsMessage.data as MessageQueryModel;
                this.onMessageDeletedEvent(new MessageQuery(data, data.author.id == userUid, this.request));
            }
        })

        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState == WebSocket.OPEN) {
                this.ws.send("heartbeat");
            }
        }, 2000);
    }

    public async stop() {
        if (!this.ws || !this.pingInterval)
            throw new Error("WebSocket not initialized");
        if (this.ws.readyState != WebSocket.OPEN)
            throw new Error("WebSocket not opened");

        this.ws.close();
        this.ws = null;
        clearInterval(this.pingInterval);
    }

    public on(event: "messageCreate" | "messageDelete" | "messageEdit", lambda: (param: any) => void) {
        switch (event) {
            case "messageCreate":
                this.onMessageCreatedEvent = lambda;
                return;
            case "messageEdit":
                this.onMessageEditedEvent = lambda;
                return;
            case "messageDelete":
                this.onMessageDeletedEvent = lambda;
                return;
        }
    }
}