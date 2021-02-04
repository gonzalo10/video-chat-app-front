import styled from 'styled-components'
import Chat from './chat'
import Logo from '../../assets/logo.png'

const ChatRoomContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 85%;
	width: 30%;
	position: relative;
	margin-left: 30px;
	padding-left: 2em;
	padding-right: 1em;
	padding: 60px 10px 25px;
	border-radius: 40px;
	background: #ecf0f3;
	box-shadow: 13px 13px 20px #cbced1, -13px -13px 20px #ffffff;
`

const AppTitleWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 20px;
`

const ChatRoom = ({ userName, submitChat, chats }) => {
	return (
		<ChatRoomContainer>
			<AppTitleWrapper>
				<img src={Logo} style={{ width: '100px' }} alt='logo' />
			</AppTitleWrapper>
			<Chat sendMessage={submitChat} chats={chats} userName={userName} />
		</ChatRoomContainer>
	)
}

export default ChatRoom
