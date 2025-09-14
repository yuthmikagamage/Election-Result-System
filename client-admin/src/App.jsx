import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [newFile, setNewFile] = useState(null);
  const [serverMessage, setServerMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (socket.current) {
      return;
    }
    socket.current = new WebSocket("ws://localhost:3002");
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: "Admin-Connection" }));
    };
    socket.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "server-message") {
        const serverMessage = data.msg;
        setServerMessage(serverMessage);
      }
    });
  }, []);

  function uploadFile() {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result;
      const prasedData = JSON.parse(fileContent);
      const reference = prasedData.reference;
      socket.current.send(
        JSON.stringify({
          type: "new-result",
          jsonFile: fileContent,
          reference: reference,
        })
      );
      setNewFile(null);
      fileInputRef.current.value = null;
    };
    if (newFile) {
      reader.readAsText(newFile);
    }
  }

  return (
    <div className="admin">
      <h1>Presidential Election Results - Admin</h1>
      <div className="userinput">
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          onChange={(event) => setNewFile(event.target.files[0])}
          onClick={() => setServerMessage(null)}
        ></input>
        <button onClick={uploadFile} disabled={!newFile}>
          Upload
        </button>
      </div>
      {serverMessage && <h4 className="serverMessage">{serverMessage}</h4>}
    </div>
  );
}

export default App;
