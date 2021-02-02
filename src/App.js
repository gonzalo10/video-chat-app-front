import './App.css'
import { io } from 'socket.io-client'

import { useEffect, useState } from 'react'

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

function App() {
	const [hasRemoteVideo, setHasRemoteVideo] = useState(false)
	const [hasLocalVideo, setHasLocalVideo] = useState(false)
	const [iceServers, setIceServers] = useState(null)
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
			setHasLocalVideo(true)
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
		remoteVideoComponent.srcObject = event.streams[0]
		remoteStream = event.streams[0]
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

	async function startCall() {
		rtcPeerConnection = new RTCPeerConnection(iceServers)
		addLocalTracks(rtcPeerConnection)
		rtcPeerConnection.ontrack = setRemoteStream
		rtcPeerConnection.onicecandidate = sendIceCandidate
		setHasRemoteVideo(true)
		await createOffer(rtcPeerConnection)
	}
	async function createRoom(event) {
		rtcPeerConnection = new RTCPeerConnection(iceServers)
		addLocalTracks(rtcPeerConnection)
		rtcPeerConnection.ontrack = setRemoteStream
		rtcPeerConnection.onicecandidate = sendIceCandidate
		rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
		await createAnswer(rtcPeerConnection)
	}
	useEffect(() => {
		if (!iceServers) return
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

		socket.on('start_call', () => {
			console.log('Socket event callback: start_call')
			if (isRoomCreator) {
				startCall()
			}
		})

		socket.on('stop_video', () => {
			console.log('Socket event callback: stop_video')
			// startCall()
			setHasRemoteVideo(false)
		})

		socket.on('webrtc_offer', async (event) => {
			console.log('Socket event callback: webrtc_offer')
			if (!isRoomCreator) {
				createRoom(event)
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
	}, [iceServers])

	useEffect(() => {
		fetch('/api/iceServer')
			.then((value) => value.json())
			.then((value) => {
				setIceServers({ ...value.iceServers })
			})
	}, [])

	const handleStop = () => {
		if (hasLocalVideo) {
			socket.emit('stop_video', roomId)
			if (localStream) localStream.getVideoTracks()[0].enabled = false
			// localStream?.getVideoTracks()?.[0]?.stop()
			setHasLocalVideo(false)
		} else {
			if (localStream) localStream.getVideoTracks()[0].enabled = true
			socket.emit('start_call', roomId)
			// setLocalStream(mediaConstraints)
			// startCall()
			setHasLocalVideo(true)
		}
	}

	return (
		<div>
			<button onClick={() => joinRoom()}>Join Room</button>
			<button onClick={handleStop}>
				{hasLocalVideo ? 'Stop' : 'Start'} video
			</button>
			<div className='App'>
				<video id='local-video' autoPlay='autoplay' muted='muted'></video>
				<video id='remote-video' autoPlay='autoplay'></video>
			</div>
		</div>
	)
}

export default App
