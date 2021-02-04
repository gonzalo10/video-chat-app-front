import { useState, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
	border-radius: 10px;
	height: 100%;
	width: 100%;
	border-radius: 50px;
	background: linear-gradient(145deg, #dbdde2, #ffffff);
	box-shadow: 35px 35px 70px #cfd1d5, -35px -35px 70px #ffffff;
	margin-top: 1em;
`;

const Chatata = styled.div`
	display: flex;
	flex-direction: column;
	height: 85%;
	overflow-y: auto;
`;

const MessageContainer = styled.div`
	display: flex;
	align-items: center;
	padding: 0px 1em;
	justify-content: ${({ sender }) => (sender ? 'flex-end' : 'start')};
`;

const MessageWrapper = styled.div`
	position: relative;
	padding: 11px;
	border-radius: 50px;
	margin: 0.5em;
	background-color: ${({ sender }) => (sender ? '#faaf4c' : '#4ea8e1')};
	width: fit-content;
`;

const MessageSender = styled.div`
	position: absolute;
	bottom: -20px;
	left: ${({ sender }) => (sender ? '' : '0')};
	right: ${({ sender }) => (sender ? '0' : '')};
	font-size: 12px;
	color: gray;
`;

const ChatInputWrapper = styled.form`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	bottom: 1em;
	width: 80%;
	left: 10%;
	background-color: white;
	padding: 0.5em;
	border-radius: 10px;
	/* box-shadow: 0 6px 12px -2px rgba(50, 50, 93, 0.25),
		0 3px 7px -3px rgba(0, 0, 0, 0.3); */

	input {
		width: 100%;
		font-size: 16px;
		border-radius: 6px;
		border: 1px solid #9c9c9c;
		padding: 8px;
		padding-left: 12px;
		outline: none;
		border-radius: 50px;
		background: #f3f6fb;
		box-shadow: inset 29px 29px 57px #d3d6da, inset -29px -29px 57px #ffffff;
		&:focus {
			border: 1px solid #e8e8e8;
			box-shadow: 0 0 3pt 2pt #faaf4c;
		}
	}
	button {
		font-size: 16px;
		margin-left: 10px;
		height: 100%;
		border-radius: 6px;
		padding: 9px 14px;
		background: #42bfdd;
		color: white;
		font-weight: 700;
		border: 0px;
	}
`;

const Chat = ({ chats, sendMessage, userName }) => {
	const [messageText, setMessageText] = useState();
	const handleSendMessage = (e) => {
		e.preventDefault();
		sendMessage(messageText);
	};
	const hanldeInput = (e) => {
		setMessageText(e.target.value);
	};

	useEffect(() => {
		var messageBody = document.querySelector('#scrollingContainer');
		messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
	}, [chats]);

	return (
		<ChatContainer>
			<Chatata id='scrollingContainer'>
				{chats.map((chat, index) => {
					let newDate = new Date();
					let date = newDate.getDate();
					let month = newDate.getMonth() + 1;
					let year = newDate.getFullYear();
					return (
						<MessageContainer key={index} sender={chat.sender === userName}>
							<MessageWrapper sender={chat.sender === userName}>
								<span>{chat.message}</span>
								<MessageSender sender={chat.sender === userName}>
									<span>
										{date}/{month}/{year}
									</span>
								</MessageSender>
							</MessageWrapper>
						</MessageContainer>
					);
				})}
			</Chatata>

			<ChatInputWrapper onSubmit={handleSendMessage}>
				<input onChange={hanldeInput} placeholder='Enter your message here' />
				<button>Send</button>
			</ChatInputWrapper>
		</ChatContainer>
	);
};

export default Chat;
