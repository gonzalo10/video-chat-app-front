import './App.css'
import { io } from 'socket.io-client'

import { useEffect } from 'react'

// DOM elements.

let localStream
let remoteStream
let isRoomCreator
let rtcPeerConnection // Connection between the local device and the remote peer.
let roomId

let localVideoComponent, remoteVideoComponent, socket

const mediaConstraints = {
	audio: true,
	video: { width: 1280, height: 720 }
}

// Free public STUN servers provided by Google.
const iceServers = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' }
	]
}

function App() {
	function joinRoom(room) {
		if (roomId === '') {
			alert('Please type a room ID')
		} else {
			console.log('joining Room: ', roomId)
			socket.emit('join', roomId)
		}
	}

	async function setLocalStream(mediaConstraints) {
		let stream
		try {
			stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
		} catch (error) {
			console.error('Could not get user media', error)
		}

		localStream = stream
		localVideoComponent.srcObject = stream
	}

	function addLocalTracks(rtcPeerConnection) {
		localStream.getTracks().forEach((track) => {
			rtcPeerConnection.addTrack(track, localStream)
		})
	}

	async function createOffer(rtcPeerConnection) {
		let sessionDescription
		try {
			sessionDescription = await rtcPeerConnection.createOffer()
			rtcPeerConnection.setLocalDescription(sessionDescription)
		} catch (error) {
			console.error(error)
		}

		socket.emit('webrtc_offer', {
			type: 'webrtc_offer',
			sdp: sessionDescription,
			roomId
		})
	}

	async function createAnswer(rtcPeerConnection) {
		let sessionDescription
		try {
			sessionDescription = await rtcPeerConnection.createAnswer()
			rtcPeerConnection.setLocalDescription(sessionDescription)
		} catch (error) {
			console.error(error)
		}

		socket.emit('webrtc_answer', {
			type: 'webrtc_answer',
			sdp: sessionDescription,
			roomId
		})
	}

	function setRemoteStream(event) {
		console.log('setRemoteStream', event)
		remoteVideoComponent.srcObject = event.streams[0]
		remoteStream = event.stream
	}

	function sendIceCandidate(event) {
		if (event.candidate) {
			socket.emit('webrtc_ice_candidate', {
				roomId,
				label: event.candidate.sdpMLineIndex,
				candidate: event.candidate.candidate
			})
		}
	}
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location?.search)
		roomId = urlParams?.get('roomId')
		const isDev = process.env.NODE_ENV === 'development'
		const urlBackend = isDev
			? 'http://localhost:5000'
			: 'https://videopegasus.herokuapp.com'

		console.log(urlBackend)
		console.log('urlBackend', urlBackend)
		socket = io.connect(urlBackend)
		socket.on('room_created', async () => {
			console.log('Socket event callback: room_created')

			await setLocalStream(mediaConstraints)
			isRoomCreator = true
		})

		socket.on('room_joined', async () => {
			console.log('Socket event callback: room_joined')

			await setLocalStream(mediaConstraints)
			socket.emit('start_call', roomId)
		})

		socket.on('full_room', () => {
			console.log('Socket event callback: full_room')

			alert('The room is full, please try another one')
		})

		socket.on('start_call', async () => {
			console.log('Socket event callback: start_call')

			if (isRoomCreator) {
				rtcPeerConnection = new RTCPeerConnection(iceServers)
				addLocalTracks(rtcPeerConnection)
				rtcPeerConnection.ontrack = setRemoteStream
				rtcPeerConnection.onicecandidate = sendIceCandidate
				await createOffer(rtcPeerConnection)
			}
		})

		socket.on('webrtc_offer', async (event) => {
			console.log('Socket event callback: webrtc_offer')
			console.log(event)
			if (!isRoomCreator) {
				rtcPeerConnection = new RTCPeerConnection(iceServers)
				addLocalTracks(rtcPeerConnection)
				rtcPeerConnection.ontrack = setRemoteStream
				rtcPeerConnection.onicecandidate = sendIceCandidate
				rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
				await createAnswer(rtcPeerConnection)
			}
		})

		socket.on('webrtc_answer', (event) => {
			console.log('Socket event callback: webrtc_answer')

			rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
		})

		socket.on('webrtc_ice_candidate', (event) => {
			// ICE candidate configuration.
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: event.label,
				candidate: event.candidate
			})
			rtcPeerConnection.addIceCandidate(candidate)
		})

		localVideoComponent = document.getElementById('local-video')
		remoteVideoComponent = document.getElementById('remote-video')
	}, [])
	return (
		<div>
			<button onClick={() => joinRoom()}>Join Room</button>
			<div className='App'>
				<video id='local-video' autoPlay='autoplay' muted='muted'></video>
				<video id='remote-video' autoPlay='autoplay' muted='muted'></video>
			</div>
		</div>
	)
}

export default App
