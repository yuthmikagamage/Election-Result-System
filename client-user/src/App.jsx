import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  useEffect(() => {
    if (socket.current) {
      return;
    }
    socket.current = new WebSocket("ws://localhost:3002");
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: "EndUser-Connection" }));
    };
    socket.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
    });
  }, []);
  return (
    <>
      <p>Client User</p>
    </>
  );
}

export default App;
