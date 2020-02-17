import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketIOFileUpload from 'socketio-file-upload';
import { Input, Button, Row, Col, Container, Table, Progress } from 'reactstrap';
import { FiPlay, FiTrash } from 'react-icons/fi';

const socket = io('torgetserver.kristofferlo.no');

export default class Dashboard extends Component {

	state = {
		socketData: false
	}

	componentDidMount() {
	  socket.on("FromAPI", data => this.setState({ socketData: data }));
	  var uploader = new SocketIOFileUpload(socket);
	  uploader.chunkSize = 1024 * 1000;
		uploader.listenOnInput(document.getElementById("siofu_input"));
	}

	restartServer() {
		console.log('boom');
    socket.emit('restart');
  }

	stopAll() {
    socket.emit('stopAll');
  }

  deleteFile(fileName) {
  	const res = window.confirm(`Sikker på atr du vil slette ${fileName}?`);
  	if (res) {
  		socket.emit('deleteFile', fileName);
  	};
  }

  playFile(fileName) {
  	console.log('Playplay ' + fileName);
  	socket.emit('playFile', fileName);
  }

	render () {

		const { socketData } = this.state;
		console.log(socketData);
		const ready = socketData.ping ? true : false;
		const files = ready ? socketData.files : [];
		const status = ready ? '' : <h1>No connection to server ...</h1>;
		const uploading = (socketData && socketData.uploadProgress && socketData.uploadProgress < 100 && socketData.uploadProgress > 0) ? <Progress value={socketData.uploadProgress} /> : null

		return (
			<div>
				<Container>

					<Row style={{marginTop: '20px', marginBottom: '20px'}}>
						<Col>
							{status}
							<Input type="file" id="siofu_input" hidden={!ready}/>
						</Col>
					</Row>

					<Row>
						<Col>
							{uploading}
						</Col>
					</Row>

					<Row>
						<Col>
							<Table dark>
								<thead>
								  <tr>
								    <th>Name</th>
								    <th>Controls</th>
								  </tr>
								</thead>
								<tbody>
									{files.map((file, i) => {
										return (
											<tr key={i}>
												<td>{file}</td>
												<td>
													<Button color="primary" style={{marginRight: '5px'}} onClick={() => this.playFile(file)}><FiPlay /></Button>
													<Button color="danger" onClick={() => this.deleteFile(file)}><FiTrash /></Button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</Table>
						</Col>
					</Row>

					<Row>
						<Col>
							<Button color="danger" onClick={this.stopAll}>Stop all</Button>
						</Col>
						<Col>
							<Button color="danger" onClick={this.restartServer}>Restart PI</Button>
						</Col>
					</Row>

				</Container>
			</div>
		);
	}
}