import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
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

  async function uploadFiles() {
    if (selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      try {
        const fileContent = await readFileAsText(file);
        const parsedData = JSON.parse(fileContent);
        const reference = parsedData.reference;

        socket.current.send(
          JSON.stringify({
            type: "new-result",
            jsonFile: fileContent,
            reference: reference,
          })
        );

        if (i < selectedFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    setSelectedFiles([]);
    fileInputRef.current.value = null;
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  return (
    <div className="admin">
      <h1>Presidential Election Results - Admin</h1>
      <div className="userinput">
        <input
          type="file"
          accept="application/json"
          multiple
          ref={fileInputRef}
          onChange={(event) => setSelectedFiles(Array.from(event.target.files))}
          onClick={() => setServerMessage(null)}
        />
        <button onClick={uploadFiles} disabled={selectedFiles.length === 0}>
          Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
        </button>
      </div>
      {serverMessage && <h4 className="serverMessage">{serverMessage}</h4>}
    </div>
  );
}

export default App;
