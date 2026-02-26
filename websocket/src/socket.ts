import { WebSocket, WebSocketServer } from "ws";
import { createServer, Server, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url';
import { v4 as uuid } from 'uuid';



const server: Server = createServer()

type RoomSchema = {
    [roomName: string]: Record<
        string,
        {
            user: WebSocket
            from: { x: number, y: number },
            to: { x: number, y: number },
            eventType: "create" | "join" | "broadcast",
            joinId?: number,
            score: number | 0
        }
    >
}

let lobby: RoomSchema =
{
    // "room1": {
    //     "user123": { user: "ws", x: 10, y: 20 },
    //     "user999": { user: "ws", x: 5, y: 15 }
    // }
}

// lobby["room1"]["user777"] = {
//   user: "ws",
//   x: 0,
//   y: 0
// };
// 1:{ram:{Ws,{x,y}}}



const wss = new WebSocketServer({ server });




wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data: string) {
        const message = JSON.parse(data)

        if (message.event == "create") {
            createRoom(ws, message.roomId)
        }
        else if (message.event == "join") {
            joinRoom(ws, message.roomId, message.username, message.x, message.y)
        }
        else if (message.event == "broadcast") {
            broadcast(message.roomId, message.username, message.from, message.to,)
        }
        else if (message.event == "switch") {
            changeEvent(message.roomId,)
            // changeEvent(message.roomId, message.username)
        }
        else if (message.event == "sendAll") {
            sendFullData(message.roomId)
        }
    });

    // ws.send('something');
});

// {
//     event:"create",
//     roomId:"1",

// }

console.log(lobby);


function createRoom(ws: WebSocket, roomId: string) {
    if (!lobby[roomId]) {
        lobby[roomId] = {}
    }
    else {

        ws.send(JSON.stringify({
            "event": "create",
            "msg": "room exists"
        }))
    }
}

function joinRoom(ws: WebSocket, roomId: string, username: string, from: { x: number, y: number }, to: { x: number, y: number }) {
    if (lobby[roomId]) {
        const roomLen = Object.keys(lobby[roomId]).length || 5
        const random = Math.floor(Math.random() * roomLen)

        lobby[roomId][username] = {
            user: ws,
            from,
            to,
            eventType: "join",
            joinId: random, score: 0

        }
        console.log(lobby)
    }
    else {

        ws.send(JSON.stringify({
            "event": "join",
            "msg": "room does not exists"
        }))
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


function broadcast(roomId: string, username: string, from: string, to: string) {
    if (!lobby[roomId]) return;

    Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (name === username) return;

        if (player.user.readyState === WebSocket.OPEN) {


            player.user.send(
                JSON.stringify({
                    event: "broadcast",
                    from,
                    to,
                    eventType:player.eventType
                
                })
            );
        }
    });
}





function changeEvent(roomId: string) {
    if (!lobby[roomId]) return;

    const room = lobby[roomId] as any;

    const players = Object.keys(room);
    if (players.length === 0) return;

    // Find current broadcaster
    let currentIndex = players.findIndex(
        name => room[name].eventType === "broadcast"
    );

    // Remove broadcast from current
    if (currentIndex !== -1) {
        room[(players[currentIndex]!)].eventType = "join";
    }

    // Pick next player (circular)
    const nextIndex =
        currentIndex === -1
            ? 0
            : (currentIndex + 1) % players.length;

    room[(players[nextIndex]!)].eventType = "broadcast";

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


function sendFullData(roomId: string) {
    if (!lobby[roomId]) return

    Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (player.user.readyState == WebSocket.OPEN) {
            player.user.send(JSON.stringify({
                "event": "sendAll",
                "roomId": roomId,
                "roomData": lobby
            }))
        }
    })
}


// function updateCoordinates(roomId:string,username:string,x:string,y:string){
// const room = lobby[roomId][username]
// lobby = {...room,x,y}

// }

server.listen(3000)
console.log("listening on 3000")
