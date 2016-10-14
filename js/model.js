/*
A general model base class. This looks okay now but will grow into a big
hairball eventually, just you wait.
*/

class Model {
	extend(obj) {
		for(let prop in obj) {
			this[prop] = obj[prop];
		}
	}
}

module.exports = Model;