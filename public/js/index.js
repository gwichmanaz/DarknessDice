/*global io */
import { Connector } from "./Connector.js";
import { Player } from "./Player.js";

export class WoDiceRoller {
	constructor() {
		this.socket = io();
		console.log("**SOCKET***", this.socket.id);
		this.player = new Player(this.socket.id, true);
		this.connector = new Connector(this.socket, this.player);
	}
}
