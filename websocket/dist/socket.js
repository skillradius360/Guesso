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
            "event": "CREATE",
            "msg": "room exists"
        }));
    }
}
function joinRoom(ws, roomId, username, from, to) {
    if (lobby[roomId]) {
        lobby[roomId][username] = {
            user: ws,
            from,
            to
        };
        console.log(lobby);
    }
    else {
        ws.send(JSON.stringify({
            "event": "JOIN",
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
// function updateCoordinates(roomId:string,username:string,x:string,y:string){
// const room = lobby[roomId][username]
// lobby = {...room,x,y}
// }
server.listen(3000);
console.log("listening on 3000");
//# sourceMappingURL=socket.js.map