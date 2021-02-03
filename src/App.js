import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

import ChatRoom from './components/chat-room'
import Login from './components/login'

import './App.css'

let localStream
let isRoomCreator
let rtcPeerConnection
let roomId
let dataChannel

let localVideoComponent, remoteVideoComponent, socket

const mediaConstraints = {
	audio: true,
	video: { width: 1280, height: 720 }
}

function App() {
	const [roomName, setRoomName] = useState()
	const [chats, setChats] = useState([])
	const [error, setError] = useState('')
	const [hasLocalVideo, setHasLocalVideo] = useState(false)
	const [iceServers, setIceServers] = useState(null)
	function joinRoom() {
		if (roomName === '') {
			alert('Please type a room ID')
		} else {
			socket.emit('join', roomName)
		}
	}

	// useEffect(() => {
	// 	setUpConnection()
	// }, [roomName])

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
		dataChannel = rtcPeerConnection.createDataChannel('channel1', {
			reliable: true
		})
		rtcPeerConnection.ondatachannel = receiveChannelCallback
		dataChannel.onmessage = onReceiveMessageCallback
		console.log('startCall', { dataChannel })
		await createOffer(rtcPeerConnection)
	}

	function onReceiveMessageCallback(event) {
		dataChannel.value = event.data
		setChats((prevEvents) => [...prevEvents, event])
	}

	function receiveChannelCallback(event) {
		dataChannel = event.channel
		dataChannel.onmessage = onReceiveMessageCallback
	}
	async function createRoom(event) {
		rtcPeerConnection = new RTCPeerConnection(iceServers)
		addLocalTracks(rtcPeerConnection)
		rtcPeerConnection.ontrack = setRemoteStream
		rtcPeerConnection.onicecandidate = sendIceCandidate
		rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
		dataChannel = rtcPeerConnection.createDataChannel('channel1', {
			reliable: true
		})
		rtcPeerConnection.ondatachannel = receiveChannelCallback
		dataChannel.onmessage = onReceiveMessageCallback
		await createAnswer(rtcPeerConnection)
	}

	async function setUpConnection() {
		console.log(iceServers)
		if (!iceServers) return
		const isDev = process.env.NODE_ENV === 'development'
		const urlBackend = isDev
			? 'http://localhost:5000'
			: 'https://videopegasus.herokuapp.com'

		socket = io.connect(urlBackend)
		socket.on('room_created', async () => {
			await setLocalStream(mediaConstraints)
			isRoomCreator = true
		})

		socket.on('room_joined', async () => {
			await setLocalStream(mediaConstraints)
			socket.emit('start_call', roomId)
		})

		socket.on('full_room', () => {
			alert('The room is full, please try another one')
		})

		socket.on('start_call', () => {
			if (isRoomCreator) {
				startCall()
			}
		})

		socket.on('webrtc_offer', async (event) => {
			if (!isRoomCreator) {
				createRoom(event)
			}
		})

		socket.on('webrtc_answer', (event) => {
			console.log('Socket event callback: webrtc_answer')
			rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
		})

		socket.on('webrtc_ice_candidate', (event) => {
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: event.label,
				candidate: event.candidate
			})
			rtcPeerConnection.addIceCandidate(candidate)
		})

		localVideoComponent = document.getElementById('local-video')
		remoteVideoComponent = document.getElementById('remote-video')
		joinRoom()
	}

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location?.search)
		roomId = urlParams?.get('roomId')
		if (roomId) setRoomName(roomId)
		fetch('/api/iceServer')
			.then((value) => value.json())
			.then((value) => setIceServers({ iceServers: value.iceServers }))
	}, [])

	const handleStop = () => {
		if (hasLocalVideo) {
			if (localStream) localStream.getVideoTracks()[0].enabled = false
			setHasLocalVideo(false)
		} else {
			if (localStream) localStream.getVideoTracks()[0].enabled = true
			setHasLocalVideo(true)
		}
	}

	const handleSendmessage = (text) => {
		dataChannel.send(text)
	}

	// function ConnectVideo() {}

	useEffect(() => {
		roomName && iceServers && setUpConnection()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomName, iceServers])

	if (roomName)
		return (
			<>
				{/* <button onClick={ConnectVideo}>Connect</button> */}
				<ChatRoom
					userName={roomName}
					peerIds={['']}
					submitChat={handleSendmessage}
					chats={chats}
				/>
				<video id='local-video' autoPlay='autoplay' muted='muted'></video>
				<video id='remote-video' autoPlay='autoplay'></video>
				<button onClick={handleStop}>
					{hasLocalVideo ? 'Stop' : 'Start'} video
				</button>
			</>
		)

	return <Login error={error} setRoomName={setRoomName} />
}

export default App
