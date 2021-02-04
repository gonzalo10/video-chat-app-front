import { useState, useEffect } from 'react'
import styled from 'styled-components'

const ChatContainer = styled.div`
	border-radius: 10px;
	height: 100%;
	width: 100%;
	border-radius: 50px;
	margin-top: 1em;
`

const Chatata = styled.div`
	display: flex;
	flex-direction: column;
	height: 85%;
	overflow-y: auto;
`

const MessageContainer = styled.div`
	display: flex;
	align-items: center;
	padding: 0px 1em;
	justify-content: ${({ sender }) => (sender ? 'flex-end' : 'start')};
`

const MessageWrapper = styled.div`
	position: relative;
	padding: 11px;
	border-radius: 50px;
	margin: 0.5em;
	background-color: ${({ sender }) => (sender ? '#faaf4c' : '#4ea8e1')};
	width: fit-content;
`

const MessageSender = styled.div`
	position: absolute;
	bottom: -20px;
	left: ${({ sender }) => (sender ? '' : '0')};
	right: ${({ sender }) => (sender ? '0' : '')};
	font-size: 12px;
	color: gray;
`

const InputWrapper = styled.div`
	border-radius: 25px;
	box-shadow: inset 8px 8px 8px #cbced1, inset -8px -8px 8px #ffffff;
	width: 92%;
`

const ChatInputWrapper = styled.form`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	bottom: 2em;
	width: 93%;

	input {
		border: none;
		outline: none;
		background: none;
		font-size: 18px;
		color: #555;
		padding: 10px 10px 10px 20px;
		width: 100%;
	}
	button {
		font-size: 16px;
		margin-left: 10px;
		height: 100%;
		border-radius: 6px;
		padding: 9px 14px;
		background: #42bfdd;
		font-weight: 700;
		border: 0px;
		outline: none;
		cursor: pointer;
		color: #fff;
		text-align: center;
		box-shadow: 3px 3px 8px #b1b1b1, -3px -3px 8px #ffffff;
	}
`

const Chat = ({ chats, sendMessage, userName }) => {
	const [messageText, setMessageText] = useState()
	const handleSendMessage = (e) => {
		e.preventDefault()
		sendMessage(messageText)
	}
	const hanldeInput = (e) => {
		setMessageText(e.target.value)
	}

	useEffect(() => {
		var messageBody = document.querySelector('#scrollingContainer')
		messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight
	}, [chats])
	console.log({ chats })
	return (
		<ChatContainer>
			<Chatata id='scrollingContainer'>
				{chats.map((chat, index) => {
					let newDate = new Date()
					let date = newDate.getDate()
					let month = newDate.getMonth() + 1
					let year = newDate.getFullYear()
					return (
						<MessageContainer key={index} sender={chat.sender === userName}>
							<MessageWrapper sender={chat.sender === userName}>
								<span>{chat.data}</span>
								<MessageSender sender={chat.sender === userName}>
									<span>
										{date}/{month}/{year}
									</span>
								</MessageSender>
							</MessageWrapper>
						</MessageContainer>
					)
				})}
			</Chatata>

			<ChatInputWrapper onSubmit={handleSendMessage}>
				<InputWrapper>
					<input onChange={hanldeInput} placeholder='Enter your message here' />
				</InputWrapper>
				<button>Send</button>
			</ChatInputWrapper>
		</ChatContainer>
	)
}

export default Chat
