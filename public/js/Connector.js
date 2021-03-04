import { ViewModel } from "./ViewModel.js";
import { ConnectorView } from "./ConnectorView.js";
import { Player } from "./Player.js";

function valuesDiffer(o1, o2) {
	return Object.keys(o1).find(k => o1[k] != o2[k]);
}

export class Connector {
	constructor(socket, player) {
		this.players = {};
		this.socket = socket;
		this.ivm = player.ivm;
		this.tvm = new ViewModel(["join", "leave", "state"]);
		this.tvm.join = 0;
		this.tvm.leave = 0;
		this.tvm.state = "left";
		this.view = new ConnectorView(this.socket, this.ivm, this.tvm);
		this.tvm.bind("join", null, this.join.bind(this));
		this.tvm.bind("leave", null, this.leave.bind(this));
		this.tvm.bind("state", null, (e, v) => player.setState(v));
		socket.on("update vm", (data) => {
			console.log("Connector: received vm update", data);
			if (data.id == this.socket.id) {
				this.updateIvm(player, data.vm);
			} else {
				if (this.players[data.id]) {
					this.players[data.id].remoteModel = Object.assign({}, data.vm);
					this.updateIvm(this.players[data.id].player, data.vm);
				}
			}
		});
		socket.on("members", data => {
			player.id = this.socket.id;
			console.log("Connector: members", this.socket.id, data);
			Object.keys(this.players).forEach(id => {
				this.players[id].doomed = true;
			});
			data.members.forEach( member => {
				if (member.id == this.socket.id) {
					this.tvm.state = "joined";
				} else if (!this.players[member.id]) {
					let newp = new Player(member.id, false, member.vm);
					this.players[member.id] = {
						player: newp,
						remoteModel: Object.assign({}, member.vm)
					}
					this.watchChanges(newp);
				} else {
					this.players[member.id].doomed = false;
				}
			});
			if (this.tvm.state == "leaving") {
				this.tvm.state = "left";
			}
			Object.keys(this.players).forEach(id => {
				if (this.tvm.state == "left" || this.players[id].doomed) {
					this.players[id].player.destruct();
					delete this.players[id];
				}
			});
		});
		socket.on("connect", data => {
			console.log("on connected", socket.id);
		});
		socket.on("disconnect", reason => {
			window.alert(`Socket Disconnected! ${reason}`);
			socket.connect();
		})
		this.watchChanges(player);
	}
	watchChanges(player) {
		player.ivm.onChange(data => {
			this.ivmChanged(player, data);
		});
	}
	ivmChanged(player, data) {
		console.log("Connector: Input ViewModel Change", player.id, data);
		if (this.tvm.state != "joined") {
			console.log("no connection, don't broadcast");
			return;
		}
		clearTimeout(this.utimeout);
		this.utimeout = setTimeout(() => {
			var r = this.players[player.id] && this.players[player.id].remoteModel;
			var d = true;
			if (r) {
				d = valuesDiffer(r, data.vm._vmObject);
			}
			console.log("Connector: Need IVM update?", this.socket.id, player.id, r, d);
			if (d) {
				this.socket.emit("update vm", {
					from: this.socket.id,
					id: player.id,
					vm: data.vm._vmObject
				});
			}
		}, 2);
	}
	updateIvm(player, vm) {
		player.__updating = true;
		console.log("Starting update IVM", player.id, JSON.stringify(player.ivm._vmObject), JSON.stringify(vm));
		Object.keys(vm).forEach(k => {
			player.ivm[k] = vm[k];
		});
		console.log("Done update IVM");
		//player.__updating = false;
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
