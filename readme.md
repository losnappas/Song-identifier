# Song Identifier

A firefox web extension https://addons.mozilla.org/en-US/firefox/addon/song-identifier/


## installation

`npm install`

then get yourself keys


#### the keys

I've hidden away my keys from github... Get your own from www.acrcloud.com

then make a secret.js file like

```javascript

var secret = {
	host: "yourhost",
	key: "yourkey",
	secret: "yoursecret"
}

module.exports = secret
```

#### browserify

`node_modules/.bin/browserify background/inject.js > background/compiledInject.js `


#### the css

I manually moved the css file from node_modules/top-bar.css/top-bar.css to attention_bar/styles. You need not do a thing.


then go to about:debugging and load the manifest.json

##### A kind of rundown...

Press button -> create iframe with unique name for each playing media -> iframe sends message to bg -> store frameId

Then record 5sec -> send blob to bg -> send blob-to-buffer to acrcloud -> send result to first iframe in queue -> display result

On remove: hide element just in case -> send msg to bg to remove this iframe from list -> send msg to content to remove this iframe from dom


