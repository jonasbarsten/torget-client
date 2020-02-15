import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketIOFileUpload from 'socketio-file-upload';
import { CardDeck, Button, Row, Col, Container } from 'reactstrap';

const socket = io('http://localhost');

export default class Dashboard extends Component {

	state = {
		socketData: null
	}

	componentDidMount() {
	  socket.on("FromAPI", data => this.setState({ socketData: data }));
	  var uploader = new SocketIOFileUpload(socket);
		uploader.listenOnInput(document.getElementById("siofu_input"));
	}

	render () {

		const { socketData } = this.state;

		// if (!socketData) {
		//   return (
		//     <div><h1>No connection to server ...</h1></div>
		//   );
		// }

		return (
			<div>
				<input type="file" id="siofu_input" />
			</div>
		);
	}
}