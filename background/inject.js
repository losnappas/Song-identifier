'use strict'

var http = require('http');
var crypto = require('crypto');
// var fs = require("fs");
var qs = require('querystring');
// require('buffer')
var toBuffer = require('blob-to-buffer')
var secret = require('../secret')

// A queue of attention bar ID's. Used to send messages straight to them.
const attentionBars = []

browser.browserAction.onClicked.addListener( () => {
	// Basically injects into the attention-bar iframes too.
	// Guess this is not great, but it's not life-threatening either..
	browser.tabs.executeScript({
		file: "/content_scripts/content2.js",
		allFrames: true
	})

	browser.tabs.insertCSS({
		file: "/content_scripts/styles/style.css",
		allFrames: true
	})

})


// Gets 2 kinds of messages.
// - Messages from attention bar iframes to save their frameID.
// - The audio data from content script.
browser.runtime.onMessage.addListener((message, sender, sendResponse)=>{
	// message is from an attention bar iframe
	if (message.iframe) {
		// make a list of attention bars
		//console.log(message)
		attentionBars.push({
			frameId: sender.frameId,
			tabId: sender.tab.id,
		})
		// Tab url so the attention bar can send a message to the host page.
		let gettingRecLen = browser.storage.sync.get('len')
		gettingRecLen.then(saved => {
			let len = isNaN(saved.len) ? 8 : saved.len
		//	let len = 8
			sendResponse({
				tabURL: sender.tab.url,
				len: len
			})
		})
		return true
	}

	let gettingCreds

	if (message.ok) {
		gettingCreds = browser.storage.sync.get()
	} else {
		// only handling security error...

		let send = () => {
			let targetFrame = attentionBars.shift()
			let data = {}
			data.status = {
				code: message.guide,
				msg: message.msg
			}
			// id, msg, {frameid}
			// Send result to attention bar along with current tab url.
			browser.tabs.sendMessage(targetFrame.tabId, {
				data: data
			}, {frameId: targetFrame.frameId})
		}

		// Sometimes it takes a pretty long time for the attentionbar to appear and give us a message.
		// Hope 550ms is enough to not rly care about this.
		if (attentionBars.length === 0) {
			setTimeout(send, 550)
		} else {
			send()
		}
		return
	}


	// message has audio data --- 


	function create_sign(data, secret_key) {
	    return crypto.createHmac('sha1', secret_key).update(data).digest().toString('base64');
	}

	function recogize(host, access_key, secret_key, query_data, query_type) {
	    var http_method = "POST"
	    var http_uri = "/v1/identify"
	    var data_type = query_type
	    var signature_version = "1" 
//	    var audio_format = 'webm'
//	    var sample_rate = 48000
	    var current_data = new Date();
	    var minutes = current_data.getTimezoneOffset();
	    var timestamp = parseInt(current_data.getTime()/1000) + minutes*60 + '';
	    var sample_bytes = query_data.length + '';

	    var options = {
		hostname: host,
		port: 80,
		path: http_uri,
		method: http_method,
		headers: {
		    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		}
	    };

	    var string_to_sign = http_method+"\n"+http_uri+"\n"+access_key+"\n"+data_type+"\n"+signature_version+"\n"+timestamp;
	    var sign = create_sign(string_to_sign, secret_key);
	    var post_data = {
		'access_key':access_key, 
		'sample_bytes':sample_bytes, 
		'sample':query_data.toString('base64'),
		'timestamp':timestamp, 
		'signature':sign, 
		'data_type':data_type, 
		'signature_version':signature_version,
//		'audio_format':audio_format,
//		'sample_rate':sample_rate
	    };

	    var content = qs.stringify(post_data); 

	    var req = http.request(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			
			chunk = JSON.parse(chunk)
			//console.log(chunk)
			send(chunk)
		});
	    });

	    // not sure about that e...
	    req.on('error', function (e) {
		console.log('Song Identifier, problem with request: ' + e.message);
		//just hoping..
		send(e)
	    });

	    function send(data) {
		let targetFrame = attentionBars.shift()
		//console.log("tf", targetFrame)
		// id, msg, {frameid}
		// Send result to attention bar
		browser.tabs.sendMessage(targetFrame.tabId, {
			data: data
		}, {frameId: targetFrame.frameId})
	    }


	    req.write(content);
	    req.end();
	}

	gettingCreds
	.then( saved => {
		// Replace "###...###" below with your project's host, access_key, access_scret
		var host = saved.host || secret.host//"identify-eu-west-1.acrcloud.com";
		var your_access_key = saved.key || secret.key//"afc5252587a817f0e06cfd9a3aa74f63";
		var your_access_secret = saved.secret || secret.secret//"bWjN9kvc86ASSCCDrn5klCxaN2lxSiumqh1MU9VK";

		var data_type = 'audio';
		toBuffer(message.data, (err, bitmap) => {
			if (err){
				throw err
			}
			recogize(host, your_access_key, your_access_secret, new Buffer(bitmap), data_type);
		})
	})


})









