function getErrorMessage(error) {
  if (error) {
    let response = JSON.parse(error.responseText);
    let errorMessage = '';
    if (response) {
      if (response.badRequest) {
        errorMessage = response.badRequest.message;
      } else if (response.conflictingRequest) {
        errorMessage = response.conflictingRequest.message;
      } else if (response.NeutronError) {
        errorMessage = response.NeutronError.message;
      } else if (response.overLimit) {
        errorMessage = response.overLimit.message;
      } else if (response.msg) {
        errorMessage = response.msg;
      } else if (response.error) {
        if(response.error.message) {
          errorMessage = response.error.message;
        } else {
          errorMessage = response.error;
        }
      } else {
        let reg = new RegExp('"message":"(.*)","');
        let msg = reg.exec(error.response);
        if (msg && msg[1]) {
          errorMessage = msg[1];
        } else {
          errorMessage = 'There is an error occured!';
        }
      }
      return errorMessage;
    }
  }
  return null;
}

module.exports = getErrorMessage;
