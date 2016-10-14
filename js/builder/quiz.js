const Model = require('../model.js');

class Quiz extends Model {
	
}

const CHOICE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

class Question extends Model {
	setup(object) {
		this.extend(object);
	}

	updateAnswer(key, value) {
		console.log('updateAnswer!');
		this.choices[key] = value;
	}

	renderChoices() {
		return Object.keys(this.choices).sort().map((index, num) => {
			return {
				num: num,
				index: index,
				value: this.choices[index],
				correct: index === this.correct,
			};
		});
	}

	buildChoices(arr) {
		const choices = {};
		arr.forEach((item, i) => {
			const value = item.value;
			const oldIndex = item.index;
			const newIndex = CHOICE_ALPHABET[i];
			choices[newIndex] = value;
			if (oldIndex === this.correct) {
				this.correct = newIndex;
			}
		});
		this.choices = choices;
	}
}

module.exports = {Quiz, Question};