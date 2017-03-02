const Model = require('../../model.js');

class Quiz extends Model {
	constructor(object) {
		super();
		this.extend(object);
		this.questions = object.questions.map(
			(d, i) => new Question(d, i)
		);
	}

	reorder(arr) {
		// Sanity check
		if (arr.filter(
			(e) => this.questions.indexOf(e) === -1
		).length > 0) {
			throw new Error("Must reorder with a permutation.");
		}
		this.questions = arr;
		this.normalize();
	}

	addQuestion() {
		let qs = new Question({}, this.questions.length);
		this.questions.push(qs);
		return qs;
	}

	deleteQuestion(qs) {
		this.questions = this.questions.filter(
			(q) => q !== qs
		);
		this.normalize();
	}

	setTitle(txt) {
		this.title = txt;
	}

	normalize() {
		this.questions.forEach(
			(qs, i) => { qs.index = i; }
		);
	}

	serialize() {
		return {
			id: this.id,
			title: this.title,
			subtitle: this.subtitle,
			text: this.text,
			email: this.email,
			questions: this.questions.map(q => q.serialize())
		}
	}
}

class Question extends Model {
	constructor(object, index) {
		super();
		this.id = object.id;
		this.text = object.text || "";
		this.explanation = object.explanation;
		this.index = index;
		this.choices = Object.keys(object.choices || [])
			.sort()
			.map((index, n) => {
				// index is a letter like A, B, C, D
				const qc = new QuestionChoice(object.choices[index], n);
				if (index === object.correct) {
					this.correct = qc;
				}
				return qc;
			});
	}

	addChoice(text) {
		this.choices.push(
			new QuestionChoice(text, this.choices.length)
		);
		this.normalize();
	}

	setCorrectChoice(qc) {
		if(this.choices.indexOf(qc) > -1 ) {
			this.correct = qc;
		} else {
			throw new Error("Correct choice must be an element of choices.");
		}
	}

	letterForChoice(qc) {
		return Question.CHOICE_ALPHABET[this.choices.indexOf(qc)];
	}

	deleteChoice(qc) {
		this.choices = this.choices.filter((c) => c !== qc);
		this.normalize();
	}

	setExplanation(txt) {
		this.explanation = txt;
	}

	reorder(arr) {
		// Sanity check
		if (arr.filter(
			(e) => this.choices.indexOf(e) === -1
		).length > 0) {
			throw new Error("Must reorder with a permutation.");
		}
		this.choices = arr;
		this.normalize();
	}

	normalize() {
		// Keep the invariants alive!
		this.choices.forEach(
			(qc, i) => { qc.index = i; }
		);
		if (!this.correct || this.choices.indexOf(this.correct) === -1) {
			this.correct = this.choices[0];
		}
	}

	serialize() {
		const choices = {};
		this.choices.forEach((c) => {
			choices[this.letterForChoice(c)] = c.text;
		});
		return {
			id: this.id,
			index: this.index,
			text: this.text,
			explanation: this.explanation,
			correct: this.letterForChoice(this.correct),
			choices: choices,
		};
	}

	validate() {
		return (
			this.text && this.text.length &&
			this.choices.length > 1
		);
	}

	validationText() {
		return "Requires text and at least two choices."
	}
}

Question.CHOICE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

class QuestionChoice extends Model {
	constructor(text, index) {
		super();
		this.text = text;
		this.index = index;
	}
}

module.exports = {Quiz, Question};