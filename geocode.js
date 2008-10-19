// Copyright 2008 Google Inc.  All Rights Reserved.

/**
 * @fileoverview Wrapper around GeoCode Maps API.
 */

/**
 * GeoCode class for easy retrieval of geo code information.
 * @constructor
 */
function GeoCode() {
  this.query_ = '';
  this.apiKey_ = this.MAPS_API_KEY;
  this.geoData = null;
}

GeoCode.prototype.GEO_URL = 'http://maps.google.com/maps/geo';

GeoCode.prototype.MAPS_API_DOMAIN = 'http://desktop.google.com/calendargadget/';
GeoCode.prototype.MAPS_API_KEY =
  'ABQIAAAA-BThq0Se9iDYxL4IEQuZfRRoa0gNjNWA-tdr0RH5jGWnfHFRPRS6toF5v5xx_YIZBiH6JTsux9lBCQ';
GeoCode.prototype.MAPS_CLIENT = GOOGLE_CLIENT;

/**
 * Callback function which is triggered when the Google Maps API
 * returns the geo information since all requests are async.
 * @type {function}
 */
GeoCode.prototype.onGeoDataAvailable = null;

/**
 * Lookup geo data for query.
 * @param {string} query Location to lookup geo coordinates for.
 * @return {boolean} true if query is valid and executed
 */
GeoCode.prototype.getGeoData = function(query) {
  // Check for valid input.
  if (query == null || query.length == 0) {
    debug.error('No query received!');
    return false;
  }

  this.query_ = query;

  // Build request URL for Google Maps geocode script.
  var url = this.GEO_URL + '?q=' +
      encodeURIComponent(this.query_) +
      '&output=json' +
      '&client=' + this.MAPS_CLIENT +
      '&key=' + encodeURIComponent(this.apiKey_);

  var req = Utils.createXhr();
  req.open('GET', url, true);
  req.onReadyStateChange = Utils.bind(this.onReadyStateChange, this, req);

  req.send();
  return true;
};

/**
 * Callback function for the XMLHttpRequest object.
 * @param {XMLHttpRequest} req XMLHttpRequest object which calls this function.
 */
GeoCode.prototype.onReadyStateChange = function(req) {
  if (req.readyState != 4) return;

  if (req.status == 200) {
    // Read JSON data into geoData attribute.
    try {
      var text = req.responseText;
      // Check for vald json input.
      // Code for check from http://www.json.org/json2.js
      if (/^[\],:{}\s]*$/.
        test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        this.geoData = eval('(' + text + ')');
      } else {
        debug.error('Corrupt JSON data.');
      }
    } catch (e) {
      debug.error('Invalid data in JSON structure. eval failed');
      this.geoData = null;
      return;
    }

    // Call callback function if any assigned.
    try {
      if (typeof(this.onGeoDataAvailable) == 'function') {
        this.onGeoDataAvailable();
      }
    } catch (e) {
      debug.error('Could not call callback function.');
      return;
    }
  }
};

/**
 * Create the url for the static maps picture based on the parameters
 * for width, height and zoom and the internal data for the coordinates.
 * @param {int} width Width of the image
 * @param {int} height Height of the image
 * @param {int} zoom Zoom level
 * @return {string} URL for the static image
 */
GeoCode.prototype.getStaticImgUrl = function(width, height, zoom) {
  var coordinates = this.geoData.Placemark[0].Point.coordinates;
  var staticUrl = 'http://maps.google.com/staticmap' +
      '?center=' + coordinates[1] + ',' + coordinates[0] +
      '&markers=' + coordinates[1] + ',' + coordinates[0] + ',smallwhite' +
      '&zoom=' + encodeURIComponent(zoom) +
      '&size=' + encodeURIComponent(width) + 'x' + encodeURIComponent(height) +
      '&maptype=mobile' +
      '&key=' + encodeURIComponent(this.MAPS_API_KEY) +
      '&client=' + this.MAPS_CLIENT;

  debug.info('Geo Static URL: \n' + staticUrl);
  return staticUrl;
};
