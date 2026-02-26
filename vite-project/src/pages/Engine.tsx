import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
type coord = {
    x: number,
    y: number
}

type RoomSchema = {
    [roomName: string]: Record<
        string,
        {
            user: WebSocket
            from: { x: number, y: number } | 0,
            to: { x: number, y: number } | 0,
            eventType: "create" | "join" | "broadcast",
            joinId?: number,
            score?: number | 0
        }
    >
}
export function Engine() {
    const canRef = useRef<HTMLCanvasElement>(null)
    const currSocket = useRef<WebSocket>(null)
    const [err, setErr] = useState(false)
    const [username, setUsername] = useState<string>("")
    const [fullData, setFullData] = useState<RoomSchema>({})



    const drawing = useRef<boolean>(false)
    const startPoint = useRef<coord>(null)
    const endPoint = useRef<coord>(null)
    const [searchParams] = useSearchParams();


    function changeTurn(roomId: string, username: string) {
        // if(currSocket.current!= WebSocket.CONNECTING){
        //     return 
        // }
        // get random word from server --> draw it -->check chat --->add point
        currSocket.current?.send(JSON.stringify({
            "event": "switch",
            "username": username,
            roomId: roomId
        }))
    }
    // user joins --> server sends all data --> frontend picks username ---> changers status 

    // CANVAS HANDLER
    const tracker = useCallback((from: coord, to: coord, cast?: boolean) => {
        const canvas = canRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)

        ctx.strokeStyle = "black"
        ctx.lineWidth = 5
        ctx.lineCap = 'round'

        ctx.stroke()
        ctx.closePath()

        if (cast && currSocket.current?.readyState == WebSocket.OPEN) {
            currSocket.current.send(JSON.stringify({
                "event": "broadcast",
                "roomId": `${searchParams.get("roomId")}`,
                "from": from,
                "to": to
            }))  
        }
    }, [drawing,    searchParams])


    // message handler
    useEffect(() => {
        console.log(searchParams.get("username"))
        const socket = new WebSocket("ws://localhost:3000")
        if (!socket) return
        currSocket.current = socket

        socket.onopen = () => {
            socket.send(JSON.stringify({
                "event": "join",
                "roomId": searchParams.get("roomId"),
                "username":searchParams.get("username")

            }))

            console.log("connection established")
        }

        const xx = setInterval(() => {
            socket.send(JSON.stringify({
                "event": "sendAll",
                "roomId": searchParams.get("roomId")
            }))

            changeTurn(searchParams.get("roomId") as string, searchParams.get("username") as string)
        }, 10000)


        socket.onmessage = (message) => {
            const data = JSON.parse(message.data || "")
            if (data.event == "error") {
                setErr(true)
            }

            //    recieve sendAll data
            if (data.event == "sendAll") {
                setFullData(data.roomData) 
            }

            const rId = searchParams.get("roomId")
            if(!rId) return

            // Object.entries(data?.roomData[rId]).forEach(([name, player]) => {
                if(data.event=="broadcast"  && data.eventType!="broadcast"){
                    tracker(data.from,data.to)
                }
    // console.log("Found me:", name);
    // console.log("My status:", player);


//    if(data.eventType=="broadcast"){
//         tracker()
//     }
        }

        return () => { socket.close(); clearInterval(xx) }

    }, [searchParams])




    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {

        drawing.current = true

        const dimensions = e.currentTarget.getBoundingClientRect()
        startPoint.current = {
            x: e.clientX - dimensions.x,
            y: e.clientY - dimensions.y
        }
    }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return

    const rId = searchParams.get("roomId")
    const user = searchParams.get("username")
    if (!rId || !user) return

    const myStatus = fullData?.[rId]?.forEach((e)=>{
returne.eventType
    })
    if (myStatus !== "broadcast") return

    const dimensions = e.currentTarget.getBoundingClientRect()

    const newPoints = {
        x: e.clientX - dimensions.x,
        y: e.clientY - dimensions.y
    }

    tracker(startPoint.current!, newPoints, true)
    startPoint.current = newPoints
}


    function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
        startPoint.current = null
        drawing.current = false
    }

    return (
        <div>

            <div className='bg-amber-950 h-screen '>
                <canvas ref={canRef}
                    height={"200px"}
                    width={"200px"}
                    className='border-2 border-solid border-black bg-amber-500'
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                >


                </canvas>
            </div>
        </div>
    )
}

