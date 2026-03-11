   import { useRef,useEffect } from "react"
   

   export function  Sockets(){

       const currSocket = useRef<WebSocket | null>(null)
        
        useEffect(()=>{
            const socket = new WebSocket("ws://localhost:3000")
            currSocket.current = socket
        })
        return currSocket
        
   }