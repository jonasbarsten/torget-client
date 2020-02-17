import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketIOFileUpload from 'socketio-file-upload';
import { Input, Button, Row, Col, Container, Table, Progress, Badge } from 'reactstrap';
import { FiPlay, FiTrash, FiStopCircle } from 'react-icons/fi';
import { FaStop } from 'react-icons/fa';
import { Levels } from 'react-activity';
// import Countdown from 'react-countdown';

import 'react-activity/dist/react-activity.css'

const socket = io('torgetserver.kristofferlo.no');

const countdownRenderer = ({ hours, minutes, seconds }) => {
	return <span>{hours}:{minutes}:{seconds}</span>;
};

function msToTime(s) {
  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(mins) + ':' + pad(secs);
}

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
		const res = window.confirm('Sikker på at du vil restarte PIen?');
		if (res) {
    	socket.emit('restart');
    };
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
  	socket.emit('playFile', fileName);
  }

  stopFile(fileName) {
  	socket.emit('stopFile', fileName);
  }

  stopRandomFile() {
  	socket.emit('stopRandomFile');
  }

  playRandomComposition() {
  	socket.emit('playRandomComposition', 20*60*1000);
  }

	render () {

		const { socketData } = this.state;
		console.log(socketData);
		const ready = socketData.ping ? true : false;
		const files = ready ? socketData.files : [];
		const status = ready ? '' : <h1>No connection to server ...</h1>;
		const uploading = (socketData && socketData.uploadProgress && socketData.uploadProgress < 100 && socketData.uploadProgress > 0) ? <Progress value={socketData.uploadProgress} /> : null;
		const diskAvaliable = (socketData && socketData.diskUsage) ? socketData.diskUsage.available : 0;
		const diskTotal = (socketData && socketData.diskUsage) ? socketData.diskUsage.total : 0;
		const diskUsage = ((diskTotal - diskAvaliable) / diskTotal) * 100;
		const currentlyPlaying = (socketData && socketData.currentlyPlaying) ? socketData.currentlyPlaying : [];
		const stopRandomFileButton = (currentlyPlaying.length < 2) ? null : <Button style={{marginRight: '5px'}} color="info" onClick={this.stopRandomFile}><FiStopCircle /> Stop random</Button>;
		const countDown = (socketData && socketData.stopwatch) ? <p>Composition duration: {msToTime(socketData.stopwatch)}</p> : null;
		const compositionButton = countDown ? null : <Button color="primary" onClick={this.playRandomComposition}>Play random 20 min composition</Button>;
		let ips = (socketData && socketData.network) ? socketData.network : [];
		const indexOfVPNIp = ips.indexOf('10.14.1.2');
		if (indexOfVPNIp > -1) {
		  ips.splice(indexOfVPNIp, 1);
		};

		return (
			<div>
				<Container>

					<Row>
						<Col style={{marginTop: '5px'}}>
							<Badge >OSC</Badge>

							{ips.map((ip) => {
								return <Badge color="light" style={{marginRight: '10px'}} key={ip}>{ip}:8050</Badge>
							})}
						</Col>
					</Row>

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
								    <th>Activity</th>
								  </tr>
								</thead>
								<tbody>
									{files.map((file, i) => {

										const active = (currentlyPlaying.indexOf(file) === -1) ? null : <span><Levels /></span>;

										return (
											<tr key={i}>
												<td>{file}</td>
												<td>
													<Button color="success" style={{marginRight: '5px'}} onClick={() => this.playFile(file)}><FiPlay /></Button>
													<Button color="primary" style={{marginRight: '5px'}} onClick={() => this.stopFile(file)}><FaStop /></Button>
													<Button color="danger" style={{marginRight: '5px'}} onClick={() => this.deleteFile(file)}><FiTrash /></Button>
												</td>
												<td>
													{active}
												</td>
											</tr>
										);
									})}
									<tr>
										<td>
											{compositionButton}
											{countDown}
										</td>
										<td>
											{stopRandomFileButton}
										</td>
										<td>
											<Button color="danger" onClick={this.stopAll}><FaStop /> Stop all</Button>
										</td>
									</tr>
								</tbody>
							</Table>
						</Col>
					</Row>

					<Row>
						<Col>
							<Progress style={{marginTop: '20px'}} color="success" value={diskUsage}>Disk usage</Progress>
						</Col>
					</Row>

				</Container>
			</div>
		);
	}
}