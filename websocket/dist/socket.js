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
// lobby["room1"]["user777"] = {
//   user: "ws",
//   x: 0,
//   y: 0
// };
// 1:{ram:{Ws,{x,y}}}
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
            }));
        }
    });
}
// function changeEvent(roomId: string, username: string) {
//     // check player type(current or queued)
//     // change the event as the index of the player
//     //  count the score 
//     // send to client
//     if (!lobby[roomId]) return;
//     Object.entries(lobby[roomId]).forEach(([name, player]) => {
//         let restrictedNum = 0
//             console.log(username)
//         // if(player.eventType!=="bro")
//         if (name === username && player.eventType == "broadcast") {
//             let room = lobby[roomId]!;
//             (room[username]!).eventType = "join"
//             restrictedNum = player.joinId!
//         }
//         if (player.user.readyState === WebSocket.OPEN) {
//             if (player.eventType !== "join" && name !== username) {
//                 const random = Math.floor(Math.random() * 5)
//                 if (random != restrictedNum && player.joinId == random) {
//                     const room = lobby[roomId]!;
//                     (room[username]!).eventType = "broadcast"
//                 }
//             }
// console.log(lobby)
//             // player.user.send(
//             //     JSON.stringify({
//             //         event: "broadcast",
//             //     })
//             // );
//         }
//     })
// }
function changeEvent(roomId) {
    if (!lobby[roomId])
        return;
    const room = lobby[roomId];
    const players = Object.keys(room);
    if (players.length === 0)
        return;
    // Find current broadcaster
    let currentIndex = players.findIndex(name => room[name].eventType === "broadcast");
    // Remove broadcast from current
    if (currentIndex !== -1) {
        room[(players[currentIndex])].eventType = "join";
    }
    // Pick next player (circular)
    const nextIndex = currentIndex === -1
        ? 0
        : (currentIndex + 1) % players.length;
    room[(players[nextIndex])].eventType = "broadcast";
    console.log("TURN SWITCHED:", players[nextIndex]);
    sendFullData(roomId);
}
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
// function updateCoordinates(roomId:string,username:string,x:string,y:string){
// const room = lobby[roomId][username]
// lobby = {...room,x,y}
// }
server.listen(3000);
console.log("listening on 3000");
//# sourceMappingURL=socket.js.map