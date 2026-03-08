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
    const currSocket = useRef<WebSocket | null>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    
    const [err, setErr] = useState(false)
    const [fullData, setFullData] = useState<RoomSchema>({})
    const [guess, setGuess] = useState<string>("")
    const [chat, setChat] = useState<Array<{ username: string, roomId: string, word: string, isTrue: boolean }>>([])

    const drawing = useRef<boolean>(false)
    const startPoint = useRef<coord | null>(null)
    const [searchParams] = useSearchParams()

    const roomId = searchParams.get("roomId") || ""
    const username = searchParams.get("username") || ""

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chat])

    function changeTurn(rId: string, uName: string) {
        currSocket.current?.send(JSON.stringify({
            "event": "switch",
            "username": uName,
            roomId: rId
        }))
    }

    function generateWord(rId: string) {
        const generatedWord = word_generator()
        currSocket.current?.send(JSON.stringify({
            "event": "generateWord",
            "roomId": rId,
            "word": generatedWord
        }))
    }

    const tracker = useCallback((from: coord, to: coord, cast?: boolean) => {
        const canvas = canRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = "#1e293b" // Slate-800
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.closePath()

        if (cast && currSocket.current?.readyState === WebSocket.OPEN) {
            currSocket.current.send(JSON.stringify({
                "event": "broadcast",
                "roomId": roomId,
                "from": from,
                "to": to
            }))
        }
    }, [roomId])

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:3000")
        currSocket.current = socket

        socket.onopen = () => {
            socket.send(JSON.stringify({
                "event": "join",
                "roomId": roomId,
                "username": username
            }))
        }

        const interval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    "event": "sendAll",
                    "roomId": roomId
                }))
                changeTurn(roomId, username)
                generateWord(roomId)
            }
        }, 10000)

        socket.onmessage = (message) => {
            const data = JSON.parse(message.data || "")
            if (data.event === "error") setErr(true)
            if (data.event === "sendAll") setFullData(data.roomData)
            
            if (data.event === "broadcast" && data.eventType !== "broadcast") {
                tracker(data.from, data.to)
            }

            if (data.event === "createChat") {
                setChat(prev => [...prev, {
                    username: data.username!,
                    word: data.word,
                    roomId: data.roomId,
                    isTrue: data.correct
                }])
            }
        }

        return () => {
            socket.close()
            clearInterval(interval)
        }
    }, [roomId, username, tracker])

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        const rId = searchParams.get("roomId")
        const user = searchParams.get("username")
        if (!rId || !user) return

        // Only allow drawing if user has "broadcast" status
        const myStatus = fullData?.[rId]?.[user]?.eventType
        if (myStatus !== "broadcast") return

        drawing.current = true
        const rect = e.currentTarget.getBoundingClientRect()
        startPoint.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!drawing.current || !startPoint.current) return

        const rect = e.currentTarget.getBoundingClientRect()
        const newPoints = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }

        tracker(startPoint.current, newPoints, true)
        startPoint.current = newPoints
    }

    function handleMouseUp() {
        drawing.current = false
        startPoint.current = null
    }

    function createChats(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!guess.trim()) return

        currSocket.current?.send(JSON.stringify({
            event: "createChat",
            roomId: roomId,
            username: username,
            word: guess
        }))
        setGuess("") // Clear input after sending
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            {/* Top Navigation */}
            <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg font-black italic">G</div>
                    <div>
                        <h1 className="text-sm font-bold leading-none">GEMINI DRAW</h1>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Room: {roomId}</span>
                    </div>
                </div>
                
                <div className="text-2xl font-mono tracking-[0.4em] font-black text-yellow-400">
                    _ _ _ _ _
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-1/2"></div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Scoreboard */}
                <aside className="w-56 bg-slate-900 border border-slate-800 rounded-2xl p-4 hidden md:flex flex-col">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-4">Leaderboard</h2>
                    <div className="space-y-2 overflow-y-auto flex-1">
                        {fullData[roomId] && Object.entries(fullData[roomId]).map(([name, player]) => (
                            <div key={name} className={`flex justify-between items-center p-2 rounded-lg border ${name === username ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-800 border-slate-700'}`}>
                                <span className="text-sm font-medium truncate w-24">{name}</span>
                                <span className="text-xs font-bold text-yellow-500">{player.score || 0}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 bg-white rounded-2xl shadow-inner border-4 border-slate-900 relative overflow-hidden">
                    <canvas 
                        ref={canRef}
                        width={1000} // High resolution internal
                        height={800}
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </main>

                {/* Chat Area */}
                <aside className="w-80 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                    <div className="p-3 border-b border-slate-800 font-bold text-xs text-slate-500 uppercase">Live Chat</div>
                    
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                        {chat.map((data, index) => (
                            <TextBox key={index} {...data} />
                        ))}
                    </div>

                    <form className="p-4 bg-slate-950/50" onSubmit={createChats}>
                        <input 
                            type="text" 
                            placeholder="Type your guess..."
                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-indigo-500 transition-all text-sm"
                            onChange={e => setGuess(e.target.value)}
                            value={guess}
                        />
                    </form>
                </aside>
            </div>
            {err && <div className="fixed bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">Connection Error!</div>}
        </div>
    )
}

function TextBox({ username, word, isTrue }: { username: string, word: string, isTrue: boolean }) {
    if (isTrue) {
        return (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-2 rounded-lg text-center animate-pulse">
                <p className="text-xs font-bold text-emerald-400 underline decoration-2 underline-offset-4">
                    {username} GUESSED IT!
                </p>
            </div>
        )
    }

    return (
        <div className="text-sm">
            <span className="font-bold text-indigo-400">{username}: </span>
            <span className="text-slate-300">{word}</span>
        </div>
    )
}

function SelectWordBox(){
    
    return (
        <>
        </>
    )
}