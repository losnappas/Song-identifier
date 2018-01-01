// AB means attention bar :^)

const YOUTUBE = query => `https://www.youtube.com/results?search_query=${query}`
const SOUNDCLOUD = query => `https://soundcloud.com/search?q=${query}`
const GOOGLE = query => `https://www.google.com/search?q=${query}`

browser.runtime.onMessage.addListener(message => {

	//console.log("helo there")

	if (message.tabURL) {
		window.parentURL = message.tabURL
		return
	}

	let artistText
	let titleText

	message = message.data
	if (message.status.code !== 0) {
		// No result - try again button
		if (message.status.code === 1001) { 
			again.classList.remove('close')
		}
		artistText = message.status.code
		titleText = message.status.msg
	}
	else {
		let res = message.metadata.music[0]
		titleText = res.title
		artistText = res.artists[0].name
	}
	//console.log(artistText, titleText)
	// the absolute state of javascript
	let dash = document.createTextNode('-')
	separator.appendChild(dash)

	// the " " there is to make it copy-paste friendly!
	let artistTextNode = document.createTextNode(" "+artistText)
	let titleTextNode = document.createTextNode(titleText)
	song.appendChild(titleTextNode)
	artist.appendChild(artistTextNode)

	if(message.status.code===0) {
		let combo = titleText + " " + artistText
		youtube.href = YOUTUBE(combo)
		soundcloud.href = SOUNDCLOUD(combo)
		google.href = GOOGLE(combo)

		google.classList.remove('close')
		youtube.classList.remove('close')
		soundcloud.classList.remove('close')
	}
	timer.classList.add('close')
})



// wiring up buttons

closer.addEventListener('click', () => {
	// just in case this doesn't work and the iframe still hangs around
	document.body.classList.add('close')
	window.parent.postMessage({
		id: window.name
	}, window.parentURL)

	// let bg script know this frame is no longer available.
	browser.runtime.sendMessage({
		iframe: true,
		closed: true
	})
})


// this close procedure is slighty different..
// handles the "go again with more time"
again.addEventListener('click', e => {
	//?
	e.preventDefault()
	browser.runtime.sendMessage({
		iframe: true,
		closed: true
	}).then( () => {
		window.parent.postMessage({
			id: window.name,
			len: window.len
		}, window.parentURL)
	})
	
})





