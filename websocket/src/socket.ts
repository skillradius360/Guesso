import { WebSocket, WebSocketServer } from "ws";
import { createServer, Server } from "http";
import { word_generator } from "./words";

const server: Server = createServer();

type Player = {
    user: WebSocket;
    from: { x: number; y: number };
    to: { x: number; y: number };
    eventType: "create" | "join" | "broadcast";
    joinId?: number;
    score: number;
};

type RoomSchema = {
    [roomName: string]: {
        generatedWord: string;
        players: Record<string, Player>;
    };
};

type chatType = {
    [roomId: string]: Record<
        string,
        {
            username: string;
            word: string;
            correct: boolean;
        }
    >;
};

let lobby: RoomSchema = {};

let generatedWord: string = "";

let roomChat: chatType = {};

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data: string) {
        const message = JSON.parse(data);

        if (message.event == "create") {
            createRoom(ws, message.roomId);
            setInterval(()=>{
                changeEvent(message.roomId)
            },5000)
        } else if (message.event == "join") {
            joinRoom(ws, message.roomId, message.username, message.x, message.y);
        } else if (message.event == "broadcast") {
            broadcast(message.roomId, message.username, message.from, message.to);
        } else if (message.event == "switch") {
            changeEvent(message.roomId);
        } else if (message.event == "sendAll") {
            sendFullData(message.roomId);
        } else if (message.event == "generateWord") {
            sendGenWord(ws);
        } else if (message.event == "setSelectedWord") {
            generatedWord = message.word;
            if (lobby[message.roomId]) {
                lobby[message.roomId]!.generatedWord = message.word;
            }
        } else if (message.event == "createChat") {
            createChat(message.username, message.roomId, message.word);
        }
    });
});

console.log(lobby);

function createRoom(ws: WebSocket, roomId: string) {
    if (!lobby[roomId]) {
        lobby[roomId] = {
            generatedWord: "",
            players: {},
        };
    } else {
        ws.send(
            JSON.stringify({
                event: "create",
                msg: "room exists",
            })
        );
    }
}

function joinRoom(
    ws: WebSocket,
    roomId: string,
    username: string,
    from: { x: number; y: number },
    to: { x: number; y: number }
) {
    if (lobby[roomId]) {
        const roomLen = Object.keys(lobby[roomId].players).length || 5;
        const random = Math.floor(Math.random() * roomLen);

        lobby[roomId].players[username] = {
            user: ws,
            from,
            to,
            eventType: "join",
            joinId: random,
            score: 0,
        };

        console.log(lobby);
    } else {
        ws.send(
            JSON.stringify({
                event: "join",
                msg: "room does not exists",
            })
        );
    }
}

function broadcast(
    roomId: string,
    username: string,
    from: string,
    to: string
) {
    if (!lobby[roomId]) return;

    Object.entries(lobby[roomId].players).forEach(([name, player]) => {
        if (name === username) return;

        if (player.user.readyState === WebSocket.OPEN) {
            player.user.send(
                JSON.stringify({
                    event: "broadcast",
                    from,
                    to,
                    eventType: player.eventType,
                })
            );
        }
    });
}

function sendFullData(roomId: string) {
    if (!lobby[roomId]) return;

    Object.entries(lobby[roomId].players).forEach(([name, player]) => {
        if (player.user.readyState == WebSocket.OPEN) {
            player.user.send(
                JSON.stringify({
                    event: "sendAll",
                    roomId: roomId,
                    roomData: lobby[roomId]
                })
            )
        }
    });
}

function changeEvent(roomId: string) {
    if (!lobby[roomId]) return;

    const room = lobby[roomId].players as any; 
    const players = Object.keys(room);

    if (players.length === 0) return;

    let currentIndex = players.findIndex(name => room[name].eventType === "broadcast");

    if (currentIndex !== -1) { 
        room[(players[currentIndex]!)].eventType = "join"; 
    }
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % players.length;

    room[(players[nextIndex]!)].eventType = "broadcast";
    sendTurn(roomId, players[nextIndex] as string)

    console.log("TURN SWITCHED:", players[nextIndex]);

    sendFullData(roomId);
}

function createChat(username: string, roomId: string, genWord: string) {
    console.log(generatedWord);

    if (!(username || roomId || genWord)) {
        console.error("chat parameters missing");
        return;
    }

    if (!lobby[roomId]) return;

    if (!roomChat[roomId]) {
        roomChat[roomId] = {};
    }

    const correct = genWord == lobby[roomId].generatedWord;

    roomChat[roomId][username] = {
        username,
        word: genWord,
        correct,
    };

    console.log(roomChat[roomId][username]?.correct);

    Object.entries(lobby[roomId].players).forEach(([name, player]) => {
        if (player.user.readyState === WebSocket.OPEN) {
            player.user.send(
                JSON.stringify({
                    event: "createChat",
                    username,
                    word: genWord,
                    correct,
                })
            );
        }
    });
}
// **********************************************************************
function sendTurn(roomId: string, username: string) {
    const player = lobby[roomId]?.players[username];

    if (!player) return;

    if (player.user.readyState === WebSocket.OPEN) {
        player.user.send(
            JSON.stringify({
                event: "yourTurn",
                username: username,
            })
        );
    }
}

function sendGenWord(ws: WebSocket) {
    let word = word_generator();

    ws.send(
        JSON.stringify({
            event: "generatedData",
            words: word,
        })
    );
}

server.listen(3000);
console.log("listening on 3000");