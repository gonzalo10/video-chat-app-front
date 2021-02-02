const fetch = require('node-fetch')

async function getIceServer(req, res) {
	try {
		const iceServers = await googleServerCall()
		const value = await iceServers.json()
		res.setHeader('Content-Type', 'application/json')
		res.status = iceServers.status
		res.end(JSON.stringify(value))
	} catch (err) {
		console.log('error', err)
	}
}

function googleServerCall() {
	return fetch(
		'https://networktraversal.googleapis.com/v1alpha/iceconfig?key=AIzaSyDX4ctY_VWUm7lDdO6i_-bx7J-CDkxS16I',
		{
			headers: {
				accept: '*/*',
				'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
				origin: 'https://test.webrtc.org/',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site',
				'x-client-data':
					'CKe1yQEIhrbJAQiitskBCMG2yQEIqZ3KAQj4x8oBCKTNygEI3NXKAQiUmssBCNabywEIqZ3LAQjencsB'
			},
			referrer: 'https://test.webrtc.org/',
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: null,
			method: 'POST',
			mode: 'cors',
			credentials: 'omit'
		}
	)
}

module.exports = (req, res) => {
	getIceServer(req, res)
}
