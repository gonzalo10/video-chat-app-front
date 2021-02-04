import styled from 'styled-components';
import Chat from './chat';
import Logo from '../../assets/logo.png';

const ChatRoomContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 90%;
	width: 35%;
	position: relative;
	padding-left: 2em;
	padding-right: 1em;
`;

const AppTitleWrapper = styled.div`
	height: 100px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const AppTitle = styled.h3``;

const ChatRoom = ({ userName, submitChat, chats }) => {
	return (
		<ChatRoomContainer>
			<AppTitleWrapper>
				<img src={Logo} style={{ width: '280px' }} alt='logo' />
			</AppTitleWrapper>
			<Chat sendMessage={submitChat} chats={chats} userName={userName} />
		</ChatRoomContainer>
	);
};

export default ChatRoom;
