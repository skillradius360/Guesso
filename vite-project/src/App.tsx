import React, { useCallback, useEffect,  useRef, useState } from 'react'

type coord = {
  x:number,
  y:number
}
function App() {
const canRef = useRef<HTMLCanvasElement>(null)
const currSocket = useRef<WebSocket>(null)
const [err,setErr] = useState(false)


const drawing = useRef<boolean>(false)
const startPoint = useRef<coord>(null)
const endPoint = useRef<coord>(null)


function changeTurn(word:string){
// get random word from server --> draw it -->check chat --->add point
} 


// CANVAS HANDLER
  const tracker = useCallback((from:coord,to:coord,cast?:boolean)=>{
    const canvas = canRef.current
    if(!canvas) return 
  const  ctx = canvas.getContext("2d")
  if(!ctx) return

  ctx.beginPath()
  ctx.moveTo(from.x,from.y )
  ctx.lineTo(to.x,to.y)

  ctx.strokeStyle= "black"
  ctx.lineWidth = 5
  ctx.lineCap='round'

  ctx.stroke()
  ctx.closePath()

  if(cast && currSocket.current?.readyState==WebSocket.OPEN){
    currSocket.current.send(JSON.stringify({
      "event":"broadcast",
      "roomId":"1",
      "from":from,
      "to":to
    }))
  }
  },[drawing])


  // message handler
  useEffect(()=>{
      const socket = new WebSocket("ws://localhost:3000")
      if(!socket) return
      currSocket.current= socket

      socket.onopen = ()=>{
          socket.send(JSON.stringify({
            "event":"join",
            "roomId":"1",

          }))

          console.log("connection established")
      }
      socket.onmessage = (message)=>{
        const data = JSON.parse(message.data || "") 
        if(data.event=="error"){
          setErr(true)
        }
        else if(data.event=="changeTurn"){
          changeTurn(message.data) //*********************
        }
        // else if(data.event=="draw"){
        // }
        tracker(data.from,data.to)

      }

      return ()=>socket.close()

  },[])
  

function handleMouseDown(e:React.MouseEvent<HTMLCanvasElement>){

  drawing.current=true

  const dimensions = e.currentTarget.getBoundingClientRect()
  startPoint.current = {
    x:e.clientX - dimensions.x,
    y:e.clientY - dimensions.y
  }
}

function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
  
  const dimensions= e.currentTarget.getBoundingClientRect()

  const newPoints=  {
    x:e.clientX - dimensions.x,
    y:e.clientY - dimensions.y
  }
    
    tracker(startPoint.current ! ,newPoints,true)
    
    startPoint.current= newPoints

}


function handleMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
  startPoint.current=null
  drawing.current=false
}

  return (
    <div>

      <div className='bg-amber-950 h-screen '>
        <canvas ref={canRef}
        height={"200px" }
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

export default App