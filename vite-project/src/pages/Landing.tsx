import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sockets } from "../utils/sockets";

function Landing() {
    const [join, setJoin] = useState<boolean>(false);
    const [create, setCreate] = useState<boolean>(false);
  

    const dataSoc = Sockets()
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col text-slate-100 p-4 relative overflow-hidden">
            
            <style>
                {`
                    @keyframes floatUp {
                        0% { transform: translateY(0) translateX(0); opacity: 0; }
                        10% { opacity: 0.8; }
                        50% { opacity: 0.3; } /* Twinkle effect */
                        90% { opacity: 0.8; }
                        100% { transform: translateY(-110vh) translateX(var(--drift)); opacity: 0; }
                    }
                    .animate-star {
                        animation: floatUp var(--duration) infinite linear;
                        animation-delay: var(--delay);
                    }
                `}
            </style>
            
            <div className="absolute inset-0 pointer-events-none">
                {/* Quantity increased to 50 for a dense starfield effect */}
                {[...Array(50)].map((_, i) => {
                    const size = Math.random() * 4 + 2; // Smaller, sharper dots
                    return (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white opacity-0 animate-star"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${Math.random() * 100}%`,
                                bottom: `-10px`,
                                // @ts-ignore
                                '--duration': `${Math.random() * 5 + 5}s`, // Faster frequency (5-10s)
                                '--delay': `${Math.random() * 10}s`,
                                '--drift': `${Math.random() * 100 - 50}px`, // Randomized sideways drift
                                filter: size > 4 ? 'blur(1px)' : 'none', // Larger dots get a slight glow
                            }}
                        />
                    );
                })}
            </div>

            {/* Logo Section */}
            <div className="text-center mb-16 animate-in fade-in zoom-in duration-700 relative z-10">
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter italic">
                    <span className="text-indigo-500 drop-shadow-[4px_4px_0px_#1e1b4b]">Gue</span>
                    <span className="text-yellow-400 drop-shadow-[4px_4px_0px_#713f12]">S</span>
                    <span className="text-purple-500 drop-shadow-[4px_4px_0px_#4c1d95]">So</span>
                </h1>
                <p className="text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Multiplayer Sketch & Guess</p>
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-8 relative z-10">
                {/* Main Action Buttons */}
                <div className="flex gap-4 w-full">
                    <button 
                        className={`flex-1 h-16 rounded-xl font-black text-xl transition-all active:translate-y-1 active:shadow-none
                            ${join ? 'bg-indigo-600 shadow-none' : 'bg-emerald-500 shadow-[0_8px_0_rgb(5,150,105)] hover:-translate-y-1'}`} 
                        onClick={() => { setJoin(true); setCreate(false); }}
                    >
                        JOIN
                    </button>
                    <button 
                        className={`flex-1 h-16 rounded-xl font-black text-xl transition-all active:translate-y-1 active:shadow-none
                            ${create ? 'bg-indigo-600 shadow-none' : 'bg-amber-500 shadow-[0_8px_0_rgb(180,83,9)] hover:-translate-y-1'}`} 
                        onClick={() => { setCreate(true); setJoin(false); }}
                    >
                        CREATE
                    </button>
                </div>

                {/* Dynamic Forms Area */}
                <div className="w-full bg-slate-900/90 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl min-h-[320px] flex flex-col justify-center backdrop-blur-xl">
                    {!join && !create && (
                        <div className="text-center text-slate-500 italic animate-pulse">
                            Ready to draw? Select an option above.
                        </div>
                    )}
                    <JoinForm isActive={join} />
                    <CreateForm isActive={create} />
                </div>
            </div>
        </div>
    );
}


function JoinForm({ isActive }: { isActive: boolean }) {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    if (!isActive) return null;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (roomId && username) navigate(`/join?roomId=${roomId}&username=${username}`);
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-indigo-400 font-bold uppercase text-xs tracking-widest text-center mb-2">Join a Room</h2>
            <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="h-14 bg-slate-800 border-2 border-slate-700 rounded-xl px-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
            />
            <input
                type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
                className="h-14 bg-slate-800 border-2 border-slate-700 rounded-xl px-4 text-white font-bold focus:border-indigo-500 outline-none transition-all"
            />
            <button type="submit" className="h-14 bg-indigo-600 rounded-xl font-bold shadow-[0_4px_0_#1e1b4b] hover:bg-indigo-500 active:shadow-none active:translate-y-1 transition-all">
                Enter Game
            </button>
        </form>
    );
}

function CreateForm({ isActive }: { isActive: boolean }) {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();


    if (!isActive) return null;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId && username) navigate(`/join?roomId=${roomId}&username=${username}`);
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-amber-400 font-bold uppercase text-xs tracking-widest text-center mb-2">Host New Game</h2>
            <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="h-14 bg-slate-800 border-2 border-slate-700 rounded-xl px-4 text-white font-bold focus:border-amber-500 outline-none transition-all"
            />
            <input
                type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)}
                placeholder="Set Room ID"
                className="h-14 bg-slate-800 border-2 border-slate-700 rounded-xl px-4 text-white font-bold focus:border-amber-500 outline-none transition-all"
            />
            <button type="submit" className="h-14 bg-amber-600 rounded-xl font-bold shadow-[0_4px_0_#78350f] hover:bg-amber-500 active:shadow-none active:translate-y-1 transition-all">
                Create Room
            </button>
        </form>
    );
}

export default Landing;