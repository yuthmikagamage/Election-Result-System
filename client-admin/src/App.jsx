import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    if (socket.current) {
      return;
    }
    socket.current = new WebSocket("ws://localhost:3002");
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: "Admin-Connection" }));
    };
  }, []);

  function uploadFile() {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result;
      socket.current.send(
        JSON.stringify({
          type: "new-result",
          jsonFile: fileContent,
        })
      );
      setNewFile(null);
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
          onChange={(event) => setNewFile(event.target.files[0])}
        ></input>
        <button onClick={uploadFile} disabled={!newFile}>
          Upload
        </button>
      </div>
      {newFile && console.log(newFile)}
    </div>
  );
}

export default App;
