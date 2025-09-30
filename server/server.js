const ws = require("ws");
const server = new ws.Server({ port: 3002 });
const AllResults = [];
const resultsReferences = [];

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
      if (resultsReferences.includes(data.reference)) {
        console.log("Repetitive Result! This Currently Available on System");
        client.send(
          JSON.stringify({
            type: "server-message",
            msg: "This Result is Currently Available on System",
          })
        );
      } else {
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
        resultsReferences.push(data.reference);
        client.send(
          JSON.stringify({
            type: "server-message",
            msg: "Result added to the system successfully!",
          })
        );
      }
    }
  });
});

console.log("Server running on port 3002");
