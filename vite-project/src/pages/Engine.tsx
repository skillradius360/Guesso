import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { word_generator } from '../utils/generator'


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
    const [fullData, setFullData] = useState<RoomSchema>({})
    const [guess,setGuess] = useState<string>("")
    
    const [chat,setChat] = useState<Array<{ username: string, roomId:string , word: string, isTrue: boolean }>>([])



    const drawing = useRef<boolean>(false)
    const startPoint = useRef<coord>(null)
    const endPoint = useRef<coord>(null)
    const [searchParams] = useSearchParams(); // get url parsed data  froM  here


    function changeTurn(roomId: string, username: string) {

        // get random word from server --> draw it -->check chat --->add point
        currSocket.current?.send(JSON.stringify({
            "event": "switch",
            "username": username,
            roomId: roomId
        }))
    }


    function generateWord(roomId: string) {
        const generatedWord = word_generator()
        currSocket.current?.send(JSON.stringify({
            "event": "generateWord",
            "roomId": roomId,
            "word": generatedWord


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
    }, [drawing, searchParams])


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
                "username": searchParams.get("username")

            }))

            console.log("connection established")
        }

        const xx = setInterval(() => {
            socket.send(JSON.stringify({
                "event": "sendAll",
                "roomId": searchParams.get("roomId")
            }))

            changeTurn(searchParams.get("roomId") as string, searchParams.get("username") as string)
            generateWord(searchParams.get("roomId") as string)
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
            if (!rId) return

            // Object.entries(data?.roomData[rId]).forEach(([name, player]) => {
            if (data.event == "broadcast" && data.eventType != "broadcast") {
                tracker(data.from, data.to)
            }

          if (data.event == "createChat") {
    setChat(prev => [
        ...prev,
        {
            username: data.username!,
            word: data.word,
            roomId:data.roomId,
            isTrue:data.correct
        }
    ])
}
          

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

        const myStatus = fullData?.[rId]?.[user]?.eventType

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

//  create a chat ---> sends to backend--- > gets broadcasted
    function createChats(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

            currSocket.current?.send(JSON.stringify({
                event: "createChat",
                roomId: searchParams.get("roomId" ) as string,
                username: searchParams.get("username" ) as string,
                word: guess
                
            }))
        



    }
    return (
        <div>

            <div className='bg-amber-950 h-screen flex justify-between' >
                <canvas ref={canRef}
                    height={"200px"}
                    width={"200px"}
                    className='border-2 border-solid border-black bg-amber-500 h-40 w-40'
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                >


                </canvas>
                <form className=' formClass h-full bg-white w-80' onSubmit={e => createChats(e)}>
                    <input type="text" name="" id="" className='h-10 w-1/2 border-2 border-solid border-pink-600 ' onChange={e=>setGuess(e.target.value)}/>
                    <button type='submit' id="" className='h-10 w-20 border-2 border-solid border-red-600 '>submit</button>
                    
                </form>

                {chat.map((data,index)=>(
                    <TextBox
                    key={index}
                    username={data.username}
                    word={data.word}
                    isTrue={data.isTrue}
                    />
                ))}
            </div>

        </div>
    )
}

function TextBox({username,word,isTrue}:{username:string,word:string,isTrue:boolean}){
    console.log(isTrue)
    return (
        <>
        <div className='flex'>
            {`${username}: ${word} `}{isTrue?`has guessed it right`:""}
        </div>
        </>
    )
}