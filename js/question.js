let QuestionState = {
	NOT_ANSWERED: 0,
	WAITING: 1,
	INCORRECT: 2,
	CORRECT: 3
};

class Question {
	constructor(id,text,choices,index,state,response,correct,explanation) {
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
	Question: Question,
	QuestionState: QuestionState
}