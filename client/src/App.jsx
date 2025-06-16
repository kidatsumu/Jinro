
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("/");

export default function App() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.on("roomUpdate", setRoom);
    socket.on("gameStarted", setRoom);
    socket.on("phaseChange", setRoom);
  }, []);

  const join = () => {
    socket.emit("joinRoom", { roomId, name });
    setJoined(true);
  };

  const startGame = () => socket.emit("startGame", roomId);
  const vote = (id) => socket.emit("vote", { roomId, targetId: id });
  const nightAction = (id) => socket.emit("nightAction", { roomId, targetId: id });

  if (!joined) return (
    <div>
      <input placeholder="Room ID" onChange={e => setRoomId(e.target.value)} />
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <button onClick={join}>Join</button>
    </div>
  );

  if (!room) return <div>Loading...</div>;

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <h3>Phase: {room.gamePhase}</h3>
      <ul>
        {room.players.map(p => (
          <li key={p.id}>
            {p.name} ({p.alive ? "Alive" : "Dead"})
            {room.gamePhase === "day" && p.alive && <button onClick={() => vote(p.id)}>Vote</button>}
            {room.gamePhase === "night" && p.alive && <button onClick={() => nightAction(p.id)}>Night Act</button>}
          </li>
        ))}
      </ul>
      {room.gamePhase === "waiting" && <button onClick={startGame}>Start Game</button>}
    </div>
  );
}
