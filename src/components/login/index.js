import { useState } from 'react'
import styled from 'styled-components'

import BgShapes from './bg-shapes'

const LoginContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: 100%;
	overflow: hidden;
	padding-top: 27vh;
`

const LoginCard = styled.div`
	width: 400px;
	height: 300px;
	padding: 60px 35px 35px 35px;
	border-radius: 40px;
	background: #ecf0f3;
	box-shadow: 13px 13px 20px #cbced1, -13px -13px 20px #ffffff;
`

const Title = styled.h1`
	margin: 0;
	color: #faaf4c;
	letter-spacing: 0.2rem;
	font-size: 40px;
	word-spacing: 0.7rem;
	text-transform: uppercase;
	padding-bottom: 32px;
	font-family: 'Roboto', sans-serif;
	text-align: center;
`
const SubTitle = styled.h2`
	margin: 0;
	font-size: 24px;
	padding-bottom: 3em;
	color: #598ae4;
	text-align: center;
`

const LoginForm = styled.form`
	display: flex;
	justify-content: space-evenly;
	align-items: center;
	padding-bottom: 2em;
	height: 100px;
`

const InputWrapper = styled.div`
	border-radius: 25px;
	box-shadow: inset 8px 8px 8px #cbced1, inset -8px -8px 8px #ffffff;
`

const LoginInput = styled.input`
	border: none;
	outline: none;
	background: none;
	font-size: 18px;
	color: #555;
	padding: 20px 10px 20px 20px; ;
`

const LoginButton = styled.button`
	outline: none;
	border: none;
	cursor: pointer;
	width: 120px;
	height: 60px;
	border-radius: 30px;
	font-size: 20px;
	font-weight: 700;
	font-family: 'Lato', sans-serif;
	color: #fff;
	text-align: center;
	background: #5796e3;
	box-shadow: 3px 3px 8px #b1b1b1, -3px -3px 8px #ffffff;
	transition: 0.5s;
`

const Login = ({ setRoomName, error }) => {
	const [userInput, setUserInput] = useState('')
	const submitLogin = (e) => {
		console.log('submitLogin')
		e?.preventDefault()
		if (userInput.length > 0) {
			console.log('submitLogin')
			setRoomName(userInput)
			localStorage.setItem('username', userInput)
		}
	}
	const handleUserName = (e) => {
		setUserInput(e.target.value)
	}
	return (
		<LoginContainer>
			<BgShapes />
			<LoginCard>
				<Title>Talarian Chat</Title>
				<SubTitle>Anonymous Chat App</SubTitle>
				<LoginForm onSubmit={submitLogin}>
					<InputWrapper>
						<LoginInput placeholder='Room name' onChange={handleUserName} />
					</InputWrapper>
					<LoginButton type='submit'>Join!</LoginButton>
				</LoginForm>
				{error && error}
			</LoginCard>
		</LoginContainer>
	)
}

export default Login
