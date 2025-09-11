const ws = require("ws");
const server = new ws.Server({ port: 3002 });

const AllResults = [];

server.on("connection", (client) => {
  client.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "Admin-Connection") {
      console.log(data.type);
    } else if (data.type === "EndUser-Connection") {
      console.log(data.type);
      client.send(
        JSON.stringify({
          type: "all-results",
          results: AllResults,
        })
      );
    }
    if (data.type === "new-result") {
      let newResult = data.jsonFile;
      newResult = JSON.parse(newResult);
      console.log("Received JSON file");
      AllResults.unshift(newResult);
      server.clients.forEach((clientUser) => {
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
