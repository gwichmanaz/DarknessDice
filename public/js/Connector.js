import { ViewModel } from "./ViewModel.js";
import { ConnectorView } from "./ConnectorView.js";
import { Player } from "./Player.js";

export class Connector {
	constructor(socket, player) {
		this.socket = socket;
		this.ivm = player.ivm;
		this.tvm = new ViewModel(["join", "leave", "state"]);
		this.tvm.join = 0;
		this.tvm.leave = 0;
		this.tvm.state = "left";
		this.view = new ConnectorView(this.socket, this.ivm, this.tvm);
		this.tvm.bind("join", null, this.join.bind(this));
		this.tvm.bind("leave", null, this.leave.bind(this));
		socket.on("update vm", (data) => {
			console.log("Connector: received vm update", data);
		});
		this.players = {};
		socket.on("members", data => {
			console.log("Connector: members", this.socket.id, data);
			Object.keys(this.players).forEach(id => {
				this.players[id].doomed = true;
			});
			data.members.forEach( member => {
				if (member.id == this.socket.id) {
					this.tvm.state = "joined";
				} else if (!this.players[member.id]) {
					this.players[member.id] = new Player(member.id, false, member.vm);
				} else {
					this.players[member.id].doomed = false;
				}
			});
			if (this.tvm.state == "leaving") {
				this.tvm.state = "left";
			}
			Object.keys(this.players).forEach(id => {
				if (this.tvm.state == "left" || this.players[id].doomed) {
					this.players[id].destruct();
					delete this.players[id];
				}
			});
		});
		socket.on("left", (data) => {
			console.log("Connector: left", this.socket.id, data);
			if (data.id == this.socket.id) {
				this.tvm.state = "left";
			} else {
				if (this.players[data.id]) {
					this.players[data.id].destruct();
					delete this.players[data.id];
				}
			}
		});
		this.ivm.onChange( (data) => {
			this.ivmChanged(this.socket.id, data);
		});
	}
	ivmChanged(id, data) {
		console.log("Connector: Input ViewModel Change", id, data);
		if (this.players[id] && this.players[id].__updating) {
			return;
		}
		if (this.tvm.state != "joined") {
			console.log("no connection, don't broadcast");
			return;
		}
		clearTimeout(this.utimeout);
		this.utimeout = setTimeout(() => {
			console.log("Connector: Sending IVM update");
			socket.emit("update vm", {
				from: this.socket.id,
				id: id,
				vm: data.vm._vmObject
			});
		}, 2);
	}
	join(element, value) {
		if (value) {
			console.log("Connector: JOIN CLICKED", value, this.ivm.username, this.ivm.gamename);
			this.socket.emit("join game", { id: this.socket.id, vm: this.ivm._vmObject });
			this.tvm.state = "joining";
		}
	}
	leave(element, value) {
		if (value) {
			console.log("Connector: LEAVE CLICKED", value, this.ivm.username, this.ivm.gamename);
			this.socket.emit("leave game", { id: this.socket.id, vm: this.ivm._vmObject });
			this.tvm.state = "leaving";
		}
	}
}
