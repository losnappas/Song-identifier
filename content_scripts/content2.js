
(function(){
'use strict'

if (window.songIdInjected) {
	scan()
	return
}
window.songIdInjected = {}
window.songIdInjected.count = 1



function scan(againRecLength) {
	let recLength = againRecLength * 1000 || 5000
	//let getLength = browser.storage.sync.get('len')
	let medias = document.querySelectorAll('audio, video')
	///*const*/let lengthInMs = 5000;
	let media
	for (media of medias) {
		if (media.paused){
			continue
		}
		
		if (!media.currentSrc.includes(window.location.origin)) {
			createTopBar()
			browser.runtime.sendMessage({
				ok: false,
				msg: "Security error.",
				guide: "Open the video in its own tab and make sure you're on HTTPS."
			})

			continue
		}

		let stream
		if (media.captureStream) {
			stream = media.captureStream()
		} else {
			stream = media.mozCaptureStream()
		}

		// to keep the audio playing.. just terrible quality though. terrible.
		let audioCtx = window.songIdInjected.context || new AudioContext()
		if (!window.songIdInjected.context) {
			let source = audioCtx.createMediaStreamSource(stream)
			source.connect(audioCtx.destination)
		}

		window.songIdInjected.context = audioCtx
		// EDIT HERE
		  let pureAudioStream = stream//new MediaStream(stream.getAudioTracks())

		   let recorder = new MediaRecorder(pureAudioStream);

		   let data = [];

		   recorder.ondataavailable = event => data.push(event.data)
		   
		   let stopped = new Promise((resolve, reject) => {
		     recorder.onstop = resolve;
		     recorder.onerror = event => reject('MediaRecorder');
		   });

		let started

		   if (media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && 
	//		media.currentTime > 0 && //?
			! media.paused){
				createTopBar(againRecLength)

				started = new Promise((resolve, reject) => {
					try {
					      recorder.start()
						resolve()
					} catch(e){
						reject('MediaRecorder')
					}
				})
		    }
		   // else{
		   //   console.error('no data or something.. content.js recorder.start()')
		   // }

		   
		  function wait(delayInMS) {
			 return new Promise(resolve => setTimeout(resolve, delayInMS));
		  }

		   let recorded = /*getLength.then(saved => {
			return +saved.len * 1000 || 5000
  		   }).then(*/wait(recLength).then(
		     () => recorder.state == "recording" && recorder.stop() 
		   );

			// TODO: might work this into a Promise.race with onpause as resolve
			// would have to recorder.stop() here and it's just 5secs per recording so whatever..
		   Promise.all([
		     started,
		     stopped,
		     recorded
		   ])
		   .then(() => {

			   let blob = new Blob(data)
			    
			   browser.runtime.sendMessage({
				ok: true,
				data: blob
			   })

		})
		.catch(err => {
			//console.log("Song Identifier error in ", err)

			if (err === "MediaRecorder") {
				browser.runtime.sendMessage({
					ok: false,
					msg: "Security error.",
					guide: "Open the video in its own tab and make sure you're on HTTPS."
				})
			} else {
				browser.runtime.sendMessage({
					ok: false,
					msg: err.name,
					guide: err.message
				})
			}
		})
	
	}
}

function createTopBar(again) {
	// an attention bar in iframe form added to the document.
	let frame = document.createElement('iframe')
	frame.className = 'song-id'
	frame.src = browser.extension.getURL('/attention_bar/topbar.html')
	let id = "songIdFrame-" + window.songIdInjected.count
	frame.id = again ? id+"-again" : id
	frame.name = again ? id+"-again" : id
	window.songIdInjected.count += 1
	let container = document.getElementById('song-id-container')
	container.insertBefore(frame, container.firstChild)
}

// called on first inject
function createContainer() {
	let div = document.createElement('div')
	div.className = 'song-id'
	div.id = 'song-id-container'
	document.body.insertBefore(div, document.body.firstChild)
}

browser.runtime.onMessage.addListener(scan)

// close button on an attention bar sends message
window.addEventListener('message', e => {
	// stayin' safe
	if (e.origin+'/' !== browser.extension.getURL("")) {
		return
	}

	//remove this attention bar
	let frameToRemove = document.getElementById(e.data.id)

	frameToRemove.remove()
	
	// Go again?
	if (e.data.len) {
		scan(e.data.len)
	}
})

createContainer()
scan()


})()


