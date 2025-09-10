const ws = require("ws");
const server = new ws.Server({ port: 3002 });

const AllResults = [];
const endUsers = new Set();

server.on("connection", (client) => {
  client.on("message", (messsage) => {
    const data = JSON.parse(messsage);
    if (data.type === "Admin-Connection") {
      console.log(data.type);
    } else if (data.type === "EndUser-Connection") {
      console.log(data.type);
      endUsers.add(client);
      client.send(
        JSON.stringify({
          type: "all-results",
          results: AllResults,
        })
      );
    }
    if (data.type === "new-result") {
      const newResult = data.jsonFile;
      console.log("Recieved JSON file");
      AllResults.push(newResult);
      endUsers.forEach((clientUser) => {
        clientUser.send(
          JSON.stringify({
            type: "new-result",
            result: newResult,
          })
        );
      });
    }
  });
});
