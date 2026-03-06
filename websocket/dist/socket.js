"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = require("http");
const server = (0, http_1.createServer)();
let lobby = {
// "room1": {
//     "user123": { user: "ws", x: 10, y: 20 },
//     "user999": { user: "ws", x: 5, y: 15 }
// }
};
let generatedWord = "";
let roomChat = {};
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        if (message.event == "create") {
            createRoom(ws, message.roomId);
        }
        else if (message.event == "join") {
            joinRoom(ws, message.roomId, message.username, message.x, message.y);
        }
        else if (message.event == "broadcast") {
            broadcast(message.roomId, message.username, message.from, message.to);
        }
        else if (message.event == "switch") {
            changeEvent(message.roomId);
            // changeEvent(message.roomId, message.username)
        }
        else if (message.event == "sendAll") {
            sendFullData(message.roomId);
        }
        else if (message.event == "generateWord") {
            getGenWord(message.word);
        }
        // ******************************************************
        else if (message.event == "createChat") {
            createChat(message.username, message.roomId, message.word); // read chat --- check word --- else pass
        }
    });
    // ws.send('something');
});
// {
//     event:"create",
//     roomId:"1",
// }
console.log(lobby);
function createRoom(ws, roomId) {
    if (!lobby[roomId]) {
        lobby[roomId] = {};
    }
    else {
        ws.send(JSON.stringify({
            "event": "create",
            "msg": "room exists"
        }));
    }
}
function joinRoom(ws, roomId, username, from, to) {
    if (lobby[roomId]) {
        const roomLen = Object.keys(lobby[roomId]).length || 5;
        const random = Math.floor(Math.random() * roomLen);
        lobby[roomId][username] = {
            user: ws,
            from,
            to,
            eventType: "join",
            joinId: random, score: 0
        };
        console.log(lobby);
    }
    else {
        ws.send(JSON.stringify({
            "event": "join",
            "msg": "room does not exists"
        }));
    }
}
// function broadcast(roomId: string, username: string, from: string, to: string) {
//     if (!lobby[roomId]) return;
//     Object.entries(lobby[roomId]).forEach(([name, player]) => {
//         if (name === username) return;
//         if (player.user.readyState === WebSocket.OPEN) {
//             player.user.send(
//                 JSON.stringify({
//                     event: "broadcast",
//                     from,
//                     to,
//                 })
//             );
//         }
//     });
// }
function broadcast(roomId, username, from, to) {
    if (!lobby[roomId])
        return;
    Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (name === username)
            return;
        if (player.user.readyState === ws_1.WebSocket.OPEN) {
            player.user.send(JSON.stringify({
                event: "broadcast",
                from,
                to,
                eventType: player.eventType
            }));
        }
    });
}
function changeEvent(roomId) {
    if (!lobby[roomId])
        return;
    const room = lobby[roomId];
    const players = Object.keys(room);
    if (players.length === 0)
        return;
    let currentIndex = players.findIndex(name => room[name].eventType === "broadcast");
    if (currentIndex !== -1) {
        room[(players[currentIndex])].eventType = "join";
    }
    // this is a circular queue like implementation to change user turns
    const nextIndex = currentIndex === -1
        ? 0
        : (currentIndex + 1) % players.length;
    room[(players[nextIndex])].eventType = "broadcast";
    console.log("TURN SWITCHED:", players[nextIndex]);
    sendFullData(roomId);
}
// function changeEvent(roomId: string) {
//     const room = lobby[roomId] as any
//     if (!room) return
//     const players = Object.keys(room)
//     if (players.length == 0) return
//     let currentIndex = players.findIndex(name => room[name]?.eventType === "broadcast");
//     if (currentIndex !== -1) {
//         const player = players[currentIndex]
//         room[players[currentIndex] as string].event = "join"
//     }
//     const nextPlayer = currentIndex == -1 ? 0 : currentIndex + 1 % players.length
//     room[(players[nextPlayer]!)].eventType = "broadcast"
//     console.log(`player switched ${players[nextPlayer]}`)
//     // send refreshed data
//     sendFullData(roomId)
// }
getGenWord("d");
function sendFullData(roomId) {
    if (!lobby[roomId])
        return;
    Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (player.user.readyState == ws_1.WebSocket.OPEN) {
            player.user.send(JSON.stringify({
                "event": "sendAll",
                "roomId": roomId,
                "roomData": lobby
            }));
        }
    });
}
function getGenWord(wordGen) {
    if (!wordGen) {
        console.error("no word generated");
        return;
    }
    generatedWord = wordGen;
    console.log(generatedWord);
}
// ************************************************************************chat part *********************************************************************
function createChat(username, roomId, genWord) {
    console.log(genWord);
    console.log(generatedWord);
    if (!(username || roomId || genWord)) {
        console.error("chat parameters missing");
        return;
    }
    if (!lobby[roomId])
        return;
    if (!roomChat[roomId]) {
        roomChat[roomId] = {};
    }
    if (generatedWord) {
        roomChat[roomId][username] = {
            username,
            word: genWord,
            correct: genWord == generatedWord ? true : false
        };
    }
    console.log(roomChat[roomId][username]?.correct);
    if (generatedWord == genWord) {
        Object.entries(lobby[roomId]).forEach(([name, player]) => {
            if (player.user.readyState === ws_1.WebSocket.OPEN) {
                player.user.send(JSON.stringify({
                    event: "createChat",
                    username,
                    word: genWord,
                    correct: genWord == generatedWord ? true : false
                }));
            }
        });
    }
    Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (player.user.readyState === ws_1.WebSocket.OPEN) {
            player.user.send(JSON.stringify({
                username,
                word: genWord,
                correct: genWord == generatedWord ? true : false,
            }));
        }
    });
    console.log("The generated word is : -->");
    console.log(generatedWord);
}
server.listen(3000);
console.log("listening on 3000");
//# sourceMappingURL=socket.js.map