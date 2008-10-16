// Copyright 2008 Google Inc.  All Rights Reserved.

/**
 * @fileoverview Authenticate user for use of Google Calendar
 */

/**
 * Class for authenticating the user. Login information is provided
 * by the options.
 * @constructor
 */
function Auth() {
  this.authToken_ = options.getValue(OPTIONS.AUTH);
  if (this.authToken_.length == 0) {
    this.authToken_ = null;
  }
  this.lsid_ = options.getValue(OPTIONS.LSID);
  this.sid_ = options.getValue(OPTIONS.SID);

  this.retries = 0;
}

/**
 * Response data from login. Used by caller to determine next step if
 * login fails
 */
Auth.prototype.authResponse = null;

/**
 * Constants for the authentication.
 */
Auth.prototype.LOGIN_PAGE = 'https://www.google.com/accounts/ClientLogin';
Auth.prototype.CAPTCHA_PAGE = 'https://www.google.com/accounts/';

/**
 * Error Constants for authentication class
 */
Auth.prototype.OFFLINE = 'Offline';
Auth.prototype.NO_CREDENTIALS = 'NoCredentials';
Auth.prototype.BAD_AUTHENTICATION = 'BadAuthentication';
Auth.prototype.NOT_VERIFIED = 'NotVerified';
Auth.prototype.TERMS_NOT_AGREED = 'TermsNotAgreed';
Auth.prototype.CAPTCHA_REQUIRED = 'CaptchaRequired';
Auth.prototype.UNKNOWN = 'Unknown';
Auth.prototype.ACCOUNT_DELETED = 'AccountDeleted';
Auth.prototype.ACCOUNT_DISABLED = 'AccountDisabled';
Auth.prototype.SERVICE_DISABLED = 'ServiceDisabled';
Auth.prototype.SERVICE_UNAVAILABLE = 'ServiceUnavailable';

/**
 * Callback functions for authentication class.
 */
Auth.prototype.onLoginFailure = null;
Auth.prototype.onLoginSuccess = null;

/**
 * Read authentication token from class.
 * @return {string} AuthToken
 */
Auth.prototype.getAuthToken = function() {
  return this.authToken_;
};

/**
 * Delete current auth token.
 */
Auth.prototype.clearAuthToken = function() {
  this.authToken_ = null;
};

/**
 * Create postdata string for authentication request.
 * @param {string} opt_captchaToken Token of the captcha image.
 * @param {string} opt_captchaText User input text for this captcha.
 * @return {string} post data
 */
Auth.prototype.createPostData = function(opt_captchaToken, opt_captchaText) {
  var postData = {};
  postData.accountType = 'HOSTED_OR_GOOGLE';
  var email = options.getValue(OPTIONS.MAIL);
  if (email.indexOf('@') == -1) {
    email += '@gmail.com';
  }
  postData.Email = email;
  postData.Passwd = options.getValue(OPTIONS.PASSWORD);
  postData.service = 'cl';
  postData.source = GOOGLE_CLIENT;
  if (opt_captchaToken != null) {
    postData.logintoken = opt_captchaToken;
  }
  if (opt_captchaText != null) {
    postData.logincaptcha = opt_captchaText;
  }

  var params = [];
  for (param in postData) {
    params.push(param + '=' + encodeURIComponent(postData[param]));
  }
  return params.join('&');
};

/**
 * Return specific error to calling application if onLoginFailure is set
 * @param {string} errorData Error data for authResponse. Should be one of the
 *     defined error constants in this class
 */
Auth.prototype.returnError = function(errorData) {
  if (typeof(this.onLoginFailure) == 'function') {
    this.authResponse = {'Error': errorData};
    this.onLoginFailure(this);
  }
};

/**
 * Login to user account.
 * @param {string} opt_captchaToken Token of the captcha image.
 * @param {string} opt_captchaText User input text for this captcha.
 */
Auth.prototype.login = function(opt_captchaToken, opt_captchaText) {
  if (!Utils.isOnline()) {
    this.returnError(this.OFFLINE);
    return;
  }

  if (!this.authToken_ &&
      options.getValue(OPTIONS.MAIL) == '' ||
      options.getValue(OPTIONS.PASSWORD) == '') {
    this.returnError(this.NO_CREDENTIALS);
    return;
  }

  var postString = this.createPostData(opt_captchaToken, opt_captchaText);
  //debug.trace('PostString: ' +
  //   postString.replace(options.getValue(OPTIONS.PASSWORD), '****'));
  //debug.trace('Login URL: ' + this.LOGIN_PAGE);

  var req = Utils.createXhr();
  req.open('POST', this.LOGIN_PAGE, true);
  req.onReadyStateChange = Utils.bind(this.onLoginDone, this, req);
  req.setRequestHeader('Content-type',
      'application/x-www-form-urlencoded');
  req.send(postString);
};

/**
 * Callback function for the XMLHttpRequest object.
 * @param {XMLHttpRequest} req XMLHttpRequest object which calls this function.
 */
Auth.prototype.onLoginDone = function(req) {
  if (!req || req.readyState != 4) {  // completed OK?
    return;
  }

  // Convert response into easy to use data structure.
  var responseLines = req.responseText.split('\n');
  var responseData = {};
  for (var i = 0; i < responseLines.length; ++i) {
    var split = responseLines[i].indexOf('=');
    var key = responseLines[i].substr(0, split);
    var value = responseLines[i].substr(split + 1);
    responseData[key] = value;
  }
  this.authResponse = responseData;

  if (req.status == 200) {
    debug.trace('User successfully verified.');
    // Store authentication data
    this.authToken_ = responseData.Auth;
    this.lsid_ = responseData.LSID;
    this.sid_ = responseData.SID;

    if (typeof(this.onLoginSuccess) == 'function') {
      this.onLoginSuccess(this);
    }

    if (!options.getValue(OPTIONS.REMEMBER)) {
      options.putValue(OPTIONS.PASSWORD, '');
    } else {
      options.encryptValue(OPTIONS.AUTH);
      options.encryptValue(OPTIONS.LSID);
      options.encryptValue(OPTIONS.SID);
      options.putValue(OPTIONS.AUTH, this.authToken_);
      options.putValue(OPTIONS.LSID, this.lsid_);
      options.putValue(OPTIONS.SID, this.sid_);
    }
  } else if (req.status == 403) {
    if (this.authResponse.Error != this.CAPTCHA_REQUIRED) {
      options.putValue(OPTIONS.PASSWORD, '');
    }

    if (typeof(this.onLoginFailure) == 'function') {
      this.onLoginFailure(this);
    }
  } else {
    if (typeof(this.onLoginFailure) == 'function') {
      this.onLoginFailure(this);
    }
  }
};

/**
 * Retrieve super token for a redirect if user is not logged in or
 * currently logged in with a differen account.
 * @return {String} Authentication token
 */
Auth.prototype.getSuperToken = function() {
  if (!this.authToken_) {
    return null;
  }
  var req = Utils.createXhr();
  req.open('POST', 'https://www.google.com/accounts/IssueAuthToken', false);
  req.setRequestHeader('Content-type',
      'application/x-www-form-urlencoded; charset=UTF-8');
  req.setRequestHeader('User-agent', 'Google Calendar Gadget');

  var postData = 'SID=' + this.sid_ +
      '&LSID=' + this.lsid_ +
      '&service=gaia' +
      '&Session=false';

  req.send(postData);

  if (req.status != 200) {
    return null;
  } else {
    return req.responseText;
  }
};
