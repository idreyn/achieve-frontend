const Model = require('../../model.js');

const DeployStatus = {
	UNDEPLOYED: 0,
	STARTED: 1,
	PARTIAL: 2,
	SUCCESS: 3,
	SUCCESS_TEST: 4,
};

class Deploy extends Model {
	constructor(status, emailSuccess, emailTotal) {
		super();
		this.status = status || DeployStatus.UNDEPLOYED;
		this.email_success = emailSuccess || 0;
		this.email_total = emailTotal || 0;
	}
}

module.exports = {Deploy, DeployStatus};