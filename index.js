const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
var users = [];
app.use(express.static("public", {}));
/*
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
*/
io.on("connection", (socket) => {
	let { id } = socket;
	console.log(id, "connected");
	socket.on("join room", (data) => {
		let { username, roomname } = data;
		users.push({ id, username, roomname });
		console.log(id, "joined", roomname, users.length, "total users");
		socket.emit('send data' , { id, username, roomname });
		socket.join(roomname);
	});
	socket.on("chat message", (data) => {
		io.to(data.roomname).emit("chat message", { data, id });
	});
	socket.on("disconnect", () => {
		let idx = users.findIndex(u => u.id === id);
		if (idx) {
			users.splice(idx, 1);
		}
		console.log(id, "disconnected");
	});
});

http.listen(80, function () {});
