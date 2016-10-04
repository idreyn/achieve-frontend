const Model = require('../model.js');

let QuestionState = {
	NOT_ANSWERED: 0,
	WAITING: 1,
	INCORRECT: 2,
	CORRECT: 3
};

class Quiz extends Model {
	constructor(id,title,subtitle,text,questions) {
		super();
		this.id = id;
		this.title = title;
		this.subtitle = subtitle;
		this.text = text;
		this.questions = questions || [];
	}
}

class Question extends Model {
	constructor(id,text,choices,index,state,response,correct,explanation) {
		super();
		this.id = id;
		this.text = text;
		this.choices = choices;
		this.index = index;
		this.state = state;
		this.response = response;
		this.correct = correct;
		this.explanation = explanation;
		if(!this.state) {
			this.state = this.correct ? (
				this.correct === this.response? QuestionState.CORRECT : QuestionState.INCORRECT
			) : QuestionState.NOT_ANSWERED;
		}
	}
}

module.exports = {
	Quiz: Quiz,
	Question: Question,
	QuestionState: QuestionState
}