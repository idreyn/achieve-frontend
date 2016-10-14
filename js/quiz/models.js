const Model = require('../model.js');

let QuestionState = {
	NOT_ANSWERED: 0,
	WAITING: 1,
	INCORRECT: 2,
	CORRECT: 3
};

class Progress extends Model {
	constructor(quizzes, name) {
		super();
		this.quizzes = quizzes;
		this.name = name;
	}
}

Progress.fromResponse = function(resp, progress) {
	progress = progress || new Progress();
	progress.name = resp.name;
	progress.milestones = resp.milestones;
	progress.quizzes = resp.quizzes.map(
		(quiz) => ({
			title: quiz.title,
			key: quiz.key,
			totalQuestions: quiz.total_questions,
			completedQuestions: quiz.completed_questions
		})
	);
	console.log(progress);
	return progress;
}

class Quiz extends Model {
	constructor(id, title, subtitle, text, questions) {
		super();
		this.id = id;
		this.title = title;
		this.subtitle = subtitle;
		this.text = text;
		this.questions = questions || [];
	}
}

Quiz.fromResponse = function(resp) {
	let quiz = new Quiz();
	quiz.extend(resp);
	quiz.questions = resp.questions.map((q,i) => new Question(
		q.id,
		q.text,
		q.choices,
		i + 1,
		q.state,
		q.response,
		q.correct,
		q.explanation
	));
	return quiz;
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
				this.correct === this.response? 
					QuestionState.CORRECT : 
					QuestionState.INCORRECT
			) : QuestionState.NOT_ANSWERED;
		}
	}

	hasResponse() {
		return this.state > 1;
	}
}

module.exports = {
	Quiz: Quiz,
	Question: Question,
	QuestionState: QuestionState,
	Progress: Progress,
}