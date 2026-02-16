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
            eventType:"create"|"join"|"broadcast",
            joinId?:number
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
            broadcast(message.roomId, message.username,message.from,message.to)
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

function joinRoom(ws: WebSocket, roomId: string, username: string, from: {x:number,y:number} , to: {x:number,y:number} ) {
    if (lobby[roomId]) {
        lobby[roomId][username] = {
            user: ws,
            from,
            to,
            eventType:"join",
            
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


function broadcast(roomId: string, username: string,from:string,to:string) {
    if (!lobby[roomId]) return;

    Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (name === username) return;

        if (player.user.readyState === WebSocket.OPEN) {


            player.user.send(
                JSON.stringify({
                    event: "broadcast",
                    from,
                    to,
                })
            );
        }
    });
}

function changeEvent(roomId: string, username: string,from:string,to:string){
    // check player type(current or queued)
    // check
        if (!lobby[roomId]) return;
        const roomLen = Object.keys(lobby[roomId]).length

    
   Object.entries(lobby[roomId]).forEach(([name, player]) => {
        if (name === username) {
            player.eventType="join"
        }

        else if (player.user.readyState === WebSocket.OPEN) {
                    if(player.eventType!=="join" && name!==username){
                        const random = Math.random()*roomLen-1
                    }

            player.user.send(
                JSON.stringify({
                    event: "broadcast",
                    from,
                    to,
                })
            );
        }
    });
}


// function updateCoordinates(roomId:string,username:string,x:string,y:string){
// const room = lobby[roomId][username]
// lobby = {...room,x,y}

// }

server.listen(3000)
console.log("listening on 3000")
