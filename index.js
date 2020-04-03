var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  origins: "*:*",
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});
var cors = require("cors");

const {
  ALERT_CHOOSE_ROOM,
  ALERT_NEW_MESSAGE,
  ALERT_NEW_USER,
  ALERT_USERNAME_TAKEN,
  INPUT_CHOOSE_ROOM,
  INPUT_NEW_MESSAGE,
  INPUT_GAME_START,
} = require("./constants");

const port = 3001;
let rooms = [];
let users = [];

app.get("/", function (req, res) {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", function (socket) {
  console.log("a user connected");
  socket.broadcast.emit(ALERT_CHOOSE_ROOM);
  // Room Channel
  socket.on(INPUT_CHOOSE_ROOM, ({ roomId, username }) => {
    const roomConnection = io.of(`/${roomId}`);
    socket.join(roomId, (_) => {
      console.log("roomChange");
      console.log("sending welcome message");
      if (users.indexOf(username) > -1) {
        socket.emit(ALERT_USERNAME_TAKEN);
        socket.leave();
        return;
      }
      users.push(username);
      socket.emit(ALERT_NEW_USER, users);
      socket.emit(ALERT_NEW_MESSAGE, {
        message: `Welcome to the room: ${username}`,
      });
    });
    socket.on(INPUT_NEW_MESSAGE, function (msg) {
      // @TODO: verify room and username
      io.emit(ALERT_NEW_MESSAGE, { ...msg, username });
    });

    socket.on(INPUT_GAME_START, () => {});
  });
});

http.listen(3001, function () {
  console.log("listening on *: " + port + "🚀");
});
