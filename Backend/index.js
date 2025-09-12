require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { connectDB } = require("./database/db");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

const activeBattles = {};

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"]
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true
}));

const userRoute = require("./routes/users");
const teamRoute = require("./routes/teams");
const battlesRoute = require("./routes/battles");

app.use("/users", userRoute);
app.use("/teams", teamRoute);
app.use("/battles", battlesRoute);

io.on("connection", (socket) => {
    console.log("Cliente conectado: " + socket.id);

    socket.on("joinBattleRoom", (battleId) => {
        socket.join(battleId);

        if (!activeBattles[battleId]) {
            activeBattles[battleId] = {
                players: {},
                readyCheck: 0,
                gameState: {
                    turn: null,
                    turnNumber: 0,
                    log: [],
                }
            };
        }
    });

    socket.on("playerReady", ({ battleId, initialPokemonId, username }) => {
        const battle = activeBattles[battleId];
        if (!battle) return;

        battle.players[socket.id] = { username, activePokemonId: initialPokemonId };
        battle.readyCheck++;

        if (battle.readyCheck === 2) {
            const [player1SocketId, player2SocketId] = Object.keys(battle.players);
            const player1 = battle.players[player1SocketId];
            const player2 = battle.players[player2SocketId];
            
            battle.gameState.turn = player1SocketId;
            battle.gameState.turnNumber = 1;

            io.to(player1SocketId).emit("battleReady", {
                player1,
                player2,
                currentUserUsername: player1.username,
                initialTurn: battle.gameState.turn,
                myId: player1SocketId
            });
            io.to(player2SocketId).emit("battleReady", {
                player1,
                player2,
                currentUserUsername: player2.username,
                initialTurn: battle.gameState.turn,
                myId: player2SocketId
            });
        }
    });

    socket.on("playerAction", ({ battleId, action }) => {
        
        const battle = activeBattles[battleId];

        if (!battle || socket.id != battle.gameState.turn) {
            return;
        }

        const actingPlayerId = socket.id;
        const opponentPlayerId = Object.keys(battle.players).find(id => id !== actingPlayerId);
        const actingPlayer = battle.players[actingPlayerId];
        
        let logMessage = "";
        let turnResult = {};

        if (action.type === "attack") {
            const damage = Math.floor(Math.random() * 30) + 10;
            logMessage = actingPlayer.username + " usó " + action.moveName + ". ¡Hizo " + damage + " de daño!";
            turnResult = {
                type: 'attack',
                logMessage: logMessage,
                damage: damage,
                target: activeBattles[battleId].players[opponentPlayerId].username
            };

            console.log("Resultado:", turnResult);

        } else if (action.type === "switch") {
            actingPlayer.activePokemonId = action.newPokemonId;
            logMessage = actingPlayer.username + " ha cambiado a su Pokémon.";
            turnResult = {
                type: 'switch',
                logMessage: logMessage,
                playerWhoSwitched: actingPlayer.username,
                newPokemonId: action.newPokemonId
            };
        }

        battle.gameState.turn = opponentPlayerId;
        battle.gameState.turnNumber++;

        io.to(battleId).emit("turnResult", turnResult);
        io.to(battleId).emit("newTurn", { nextTurn: opponentPlayerId });
    });

    socket.on("disconnect", () => {
        console.log("Un usuario se ha desconectado: " + socket.id);
    });
});

async function startServer() {
    await connectDB();
    server.listen(process.env.PORT, () => {
        console.log("✅ Servidor escuchando en http://localhost:" + process.env.PORT);
    });
}

startServer();