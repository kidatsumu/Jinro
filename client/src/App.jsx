// client/src/App.jsx
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://jinro-qu96.onrender.com");

export default function App() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState(null);
  const [myRole, setMyRole] = useState("");

  useEffect(() => {
    socket.on("roomUpdate", setRoom);
    socket.on("gameStarted", setRoom);
    socket.on("phaseChange", setRoom);
  }, []);

  useEffect(() => {
    if (room && room.players) {
      const me = room.players.find(p => p.id === socket.id);
      if (me) setMyRole(me.role);
    }
  }, [room]);

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
      <h3>現在のフェーズ: {room.gamePhase === "waiting" ? "🕒 待機中" : room.gamePhase === "day" ? "☀️ 昼" : "🌙 夜"}</h3>

      {myRole && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          あなたの役職: {myRole === 'werewolf' ? '🐺 人狼' : myRole === 'seer' ? '🔮 占い師' : '👤 村人'}
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {room.players.map(p => (
          <li key={p.id} style={{
            padding: '4px 0',
            color: p.alive ? 'black' : 'gray',
            fontWeight: p.id === socket.id ? 'bold' : 'normal'
          }}>
            {p.alive ? '🟢' : '⚫️'} {p.name} {p.id === socket.id ? '(あなた)' : ''}
            {room.gamePhase === "day" && p.alive && <button onClick={() => vote(p.id)}>投票</button>}
            {room.gamePhase === "night" && p.alive && <button onClick={() => nightAction(p.id)}>夜の行動</button>}
          </li>
        ))}
      </ul>

      {room.gamePhase === "waiting" && <button onClick={startGame}>ゲーム開始</button>}
    </div>
  );
}
