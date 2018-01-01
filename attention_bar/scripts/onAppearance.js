// send a message so this iframe can be tracked
// then wait for the sendResponse which has the parent tab URL for window.postmessaging
browser.runtime.sendMessage({ iframe: true })
.then(e => {
	//console.log('hi from onap, heres e:', e)
	window.parentURL = e.tabURL
	
	let len = e.len || 8
	window.len = len
	if (window.name.indexOf("-again") === -1) {
		len = 5
	}
	let timerText = document.createTextNode(len)
	timer.appendChild(timerText)

	let countDown = setInterval(() => {
	timer.innerHTML = +timer.innerHTML-1
	if (timer.innerHTML==='0') {
	   clearInterval(countDown)
	   timer.innerHTML = 'fetching'
	}
	}, 1000)


})


