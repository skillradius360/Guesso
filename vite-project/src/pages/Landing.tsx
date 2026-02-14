import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

function Landing() {
    const [join, setJoin] = useState<boolean>(false)
    const [create, setCreate] = useState<boolean>(false)

    return (
        <>
            <div className=" w-screen h-screen flex items-center justify-center flex-col text-white gap-16 ">
                <h1 className="text-9xl  font-display">
                    <span className="text-blue-600 ">Gue</span><span className="text-yellow-400">S</span><span className="text-purple-600">So</span>
                </h1>
                <div className="h-20 ">


                    <button className="h-14 w-20 shadow-[6px_6px_0px_blue] rounded-sm font-bold text-lg bg-green-500 m-4" onClick={e => {setJoin(prev => !prev)
                        setCreate(false)
                    }}>JOIN</button>
                    <button className="h-14  w-36 shadow-[6px_6px_0px_blue] rounded-sm font-bold text-lg mb-10 bg-green-500 m-4" onClick={e => {setCreate(prev => !prev)
                        setJoin(false)
                    }}>Create Game</button>

                    <Join join={join} />
                    <Create create={create} />

                </div>

            </div>
        </>
    );
}


function Join({ join }) {
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate()

    function handleJoinSubmit(e: React.FormEvent) {
        e.preventDefault();
        navigate(`/join/${roomId}`)
    }
    return (
        <>
            <form onSubmit={handleJoinSubmit} className={`flex-col gap-6 ${join == false ? "hidden" : ""} flex flex-col items-center`} >
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room id"
                    className="h-16 w-80 border-2 border-solid text-black border-black flex flex-col shadow-[4px_4px_0px_#3b82f6]rounded-xl text-bold text-2xl p-4 outline-none"
                />

                <button type="submit" className="h-10 w-30 rounded-sm   shadow-[6px_6px_0px_blue]  bg-yellow-600">Join</button>
            </form>
        </>
    )
}

function Create({ create }) {
    const [roomId, setRoomId] = useState<string>();
    const [users, setUsers] = useState<string>();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("Room ID:", roomId);
    }
    return (
        <>
            <form onSubmit={handleSubmit} className={`flex-col gap-10 ${create == false ? "hidden" : ""} gap-10`} >
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room id"
                    className="h-16 w-80 border-2 border-solid text-black border-black flex flex-col rounded-xl text-bold text-2xl p-4 outline-none"
                />
                <input
                    type="number"
                    value={roomId}
                    onChange={(e) => setUsers(e.target.value)}
                    placeholder="players"
                    className="h-16 w-80 border-2 border-solid mt-5 text-black border-black flex flex-col rounded-xl text-bold text-2xl p-4 outline-none"
                />

                <button type="submit" className="h-10 w-30 rounded-sm   shadow-[6px_6px_0px_blue]  bg-yellow-600 mt-4">Create</button>
            </form>
        </>
    )
}
export default Landing;
