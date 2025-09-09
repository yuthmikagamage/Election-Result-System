const ws = require("ws")
const server = new ws.Server({port:3002})

server.on("connection", client=>{
    client.on("message", messsage=>{
        const data = JSON.parse(messsage)
        if(data.type === "connection"){
            client.name = data.name
            console.log(client.name + " Connected")
        }
       
    })
})