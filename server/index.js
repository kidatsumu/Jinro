
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let rooms = {};

function createRoles(numPlayers) {
  let roles = ["werewolf", "seer"];
  while (roles.length < numPlayers) roles.push("villager");
  return roles.sort(() => Math.random() - 0.5);
}

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId, name }) => {
    if (!rooms[roomId]) rooms[roomId] = { players: [], gamePhase: "waiting" };
    const player = { id: socket.id, name, role: null, alive: true };
    rooms[roomId].players.push(player);
    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("startGame", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.players.length < 4) return;
    const roles = createRoles(room.players.length);
    room.players.forEach((p, i) => p.role = roles[i]);
    room.gamePhase = "night";
    room.votes = {};
    io.to(roomId).emit("gameStarted", room);
  });

  socket.on("vote", ({ roomId, targetId }) => {
    const room = rooms[roomId];
    if (!room || room.gamePhase !== "day") return;
    room.votes[socket.id] = targetId;
    if (Object.keys(room.votes).length === room.players.filter(p => p.alive).length) {
      const tally = {};
      Object.values(room.votes).forEach(id => tally[id] = (tally[id] || 0) + 1);
      const [killedId] = Object.entries(tally).sort((a,b) => b[1]-a[1])[0];
      const killed = room.players.find(p => p.id === killedId);
      if (killed) killed.alive = false;
      room.gamePhase = "night";
      room.votes = {};
      io.to(roomId).emit("phaseChange", room);
    }
  });

  socket.on("nightAction", ({ roomId, targetId }) => {
    const room = rooms[roomId];
    const player = room.players.find(p => p.id === socket.id);
    if (room.gamePhase !== "night" || !player || !player.alive) return;
    if (player.role === "werewolf") {
      const target = room.players.find(p => p.id === targetId);
      if (target) target.alive = false;
      room.gamePhase = "day";
      io.to(roomId).emit("phaseChange", room);
    }
  });

  socket.on("disconnect", () => {
    for (let roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      io.to(roomId).emit("roomUpdate", rooms[roomId]);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
