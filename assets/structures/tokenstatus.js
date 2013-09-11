// *************************************************** //
// Error Structure
//
// This structure holds possible network and API errors.
// This might either be triggered by the network stack,
// Instagram or by the application itself.
// *************************************************** //

// data structure for errors
function TokenStatusData()
{
	// general image information and links
	this.tokenStatus = "";
	this.tokenCode = "";
	this.tokenSecret = "";
	this.tokenVerification = "";
}