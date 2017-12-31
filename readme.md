# Song Identifier

A firefox web extension [https://addons.mozilla.org/en-US/firefox/addon/song-identifier/]


## installation

`npm install`

then get yourself keys


#### the keys

I've hidden away my keys from github... Get your own from [acrcloud.com]

then make a secret.js file like

`javascript

var secret = {
	host: "yourhost",
	key: "yourkey",
	secret: "yoursecret"
}

module.exports = secret
`

#### browserify

`node_modules/.bin/browserify background/inject.js > background/compiledInject.js `



then go to about:debugging and load the manifest.json

