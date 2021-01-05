const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
var users = {};

function roomies(gamename) {
	return Object.values(users).filter(u => u.vm.gamename == gamename)
}
app.use(express.static("public", {}));
/*
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
*/
io.on("connection", (socket) => {
	let { id } = socket;

	function leave() {
		let myself = users[id];
		if (myself) {
			var roomname = myself.vm && myself.vm.gamename;
			delete users[id];
			members(roomname);
		}
	}

	function members(roomname) {
		io.to(roomname).emit("members", { gamename: roomname, members: roomies(roomname) });
	}

	console.log(id, "connected");
	socket.on("join game", (data) => {
		console.log(id, data);
		users[id] = data;
		socket.join(data.vm.gamename);
		members(data.vm.gamename);
	});
	socket.on("chat message", (data) => {
		io.to(data.gamename).emit("chat message", { data, id });
	});
	socket.on("update vm", (data) => {
		console.log(`Update VM for ${data.id} by ${data.from}`, data);
		users[data.id].vm = data.vm;
		io.to(data.gamename).emit("update vm", data);
	});
	socket.on("leave game", (data) => {
		leave();
	});
	socket.on("disconnect", () => {
		leave();
		console.log(id, "disconnected");
	});
});

http.listen(80, function () {});
