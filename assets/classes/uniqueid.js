function s4() {
	return Math.floor((Math.random()) * 100000000).toString();
};

function uniqID() {
	return s4() + s4() + s4() + s4() + s4() + s4() + s4();
}