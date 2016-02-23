function retrieveCSRFToken() {
	return document.querySelector('input[name=csrfmiddlewaretoken').value
}

module.exports = {
	retrieveCSRFToken: retrieveCSRFToken
}