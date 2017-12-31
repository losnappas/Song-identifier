function save(e) {
	// uhh whatever
	let v = len.value
	v = v > 15 ? 15 : v
	// local vs sync probs no big deal in performance - hoping it is cached somewhere.
	browser.storage.sync.set({
		len: v,
		host: host.value,
		key: key.value,
		secret: secret.value
	})
}


function restore() {
	browser.storage.sync.get()
	.then(values => {
		len.value = values.len || ''
		host.value = values.host || ''
		key.value = values.key || ''
		secret.value = values.secret || ''
	})
}


len.addEventListener('change', save)
host.addEventListener('change', save)
key.addEventListener('change', save)
secret.addEventListener('change', save)
document.addEventListener('DOMContentLoaded', restore)

