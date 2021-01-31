import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'
const { RTCPeerConnection, RTCSessionDescription } = window

const iceServers = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' }
	]
}

let socket, peerConnection

let isAlreadyCalling = false
let getCalled = false
function App() {
	const [users, setUsers] = useState([])

	async function callUser(socketId) {
		console.log('calling user', socketId)
		const offer = await peerConnection.createOffer()
		await peerConnection.setLocalDescription(new RTCSessionDescription(offer))

		socket.emit('call-user', {
			offer,
			to: socketId
		})
	}

	useEffect(() => {
		peerConnection = new RTCPeerConnection(iceServers)

		socket = io.connect('https://videopegasus.herokuapp.com')
	}, [])

	useEffect(() => {
		socket.on('update-user-list', ({ users }) => {
			console.log('serUsers', users)
			setUsers(users)
		})
		socket.on('remove-user', ({ socketId }) => {
			const elToRemove = document.getElementById(socketId)

			if (elToRemove) {
				elToRemove.remove()
			}
		})

		socket.on('call-made', async (data) => {
			if (getCalled) {
				const confirmed = window.confirm(
					`User "Socket: ${data.socket}" wants to call you. Do accept this call?`
				)

				if (!confirmed) {
					socket.emit('reject-call', {
						from: data.socket
					})

					return
				}
			}

			await peerConnection.setRemoteDescription(
				new RTCSessionDescription(data.offer)
			)
			const answer = await peerConnection.createAnswer()
			await peerConnection.setLocalDescription(
				new RTCSessionDescription(answer)
			)

			socket.emit('make-answer', {
				answer,
				to: data.socket
			})
			getCalled = true
		})

		socket.on('answer-made', async (data) => {
			await peerConnection.setRemoteDescription(
				new RTCSessionDescription(data.answer)
			)

			if (!isAlreadyCalling) {
				callUser(data.socket)
				isAlreadyCalling = true
			}
		})

		socket.on('call-rejected', (data) => {
			alert(`User: "Socket: ${data.socket}" rejected your call.`)
			// unselectUsersFromList()
		})

		peerConnection.ontrack = function ({ streams: [stream] }) {
			const remoteVideo = document.getElementById('remote-video')
			if (remoteVideo) {
				remoteVideo.srcObject = stream
			}
		}

		navigator.getUserMedia(
			{ video: true, audio: true },
			(stream) => {
				const localVideo = document.getElementById('local-video')
				if (localVideo) {
					localVideo.srcObject = stream
				}

				stream
					.getTracks()
					.forEach((track) => peerConnection.addTrack(track, stream))
			},
			(error) => {
				console.warn(error.message)
			}
		)
	}, [])

	const handleClick = (e) => callUser(e.target.name)

	console.log(users)

	return (
		<div className='App'>
			<div>
				<button name={users[0]} onClick={handleClick}>
					Call user {users[0]}
				</button>
				<ul>
					{/* {users?.map((user) => (
						<li key={user} id={user} onClick={handleClick}>
							{user}
						</li>
					))} */}
				</ul>
			</div>
			<div>
				<video autoPlay className='remote-video' id='remote-video'></video>
				<video autoPlay muted className='local-video' id='local-video'></video>
			</div>
		</div>
	)
}

export default App
