// Copyright 2008 Google Inc.  All Rights Reserved.

/**
 * @fileoverview this object holds all information about a single calendar
 * of the user.
 */

/**
 * Object for calendar data.
 * @constructor
 */
function Calendar() {
  this.title = strings.NEW_CALENDAR_TITLE;
  this.id = '';
  this.url = '';
  this.email = '';
  this.color = '';
  this.accessLevel = '';
  this.selected = false;
  this.timezone = '';
  this.hidden = false;
  this.updated = false;
  this.lastUpdate = new Date(0);
  this.lastUpdateLocal = new Date(0);
  this.overrideName = '';
  this.calendarMinutes = -1;
}

/**
 * Check visibility of a calendar.
 * @return {boolean} True, if calendar is visible
 */
Calendar.prototype.isVisible = function() {
  return !this.hidden;
};

/**
 * Check if calendar is selected.
 * @return {boolean} True, if calendar is visible
 */
Calendar.prototype.isSelected = function() {
  if (this.hidden) return false;

  var visibleOpt = options.getValue(OPTIONS.SHOW + this.id);
  if (typeof(visibleOpt) == 'boolean') {
    return visibleOpt;
  } else {
    return this.selected;
  }
};

/**
 * Return title of the calendar. Use overrideName if set.
 * @return {string} Calendar title
 */
Calendar.prototype.getTitle = function() {
  if (this.overrideName) {
    return this.overrideName;
  } else {
    return this.title;
  }
};

/**
 * Set date and time of last update for this calendar. This is
 * local time not server time.
 */
Calendar.prototype.setUpdateDate = function() {
  this.lastUpdateLocal = new Date();
};

/**
 * Get date and time of last update for this calendar. This is
 * local time not server time.
 */
Calendar.prototype.getUpdateDate = function() {
  return this.lastUpdateLocal;
};

/**
 * Parse XMLNode into calendar data structure.
 * @param {Object} elem DOM Element
 */
Calendar.prototype.parse = function(elem) {
  this.id = elem.id.$t;
  this.title = elem.title.$t;
  this.email = elem.author[0].email;
  for (var i = 0; i < elem.link.length; ++i) {
    if (elem.link[i].rel == 'alternate') {
      var url = elem.link[i].href;
      url = Utils.forceHttpsUrl(url);
      this.url = url;
    }
  }
  this.color = elem.gCal$color.value;
  this.accessLevel = elem.gCal$accesslevel.value;
  if (this.accessLevel != 'owner') {
    options.putDefaultValue(OPTIONS.SHOW + this.id, false);
  }
  this.selected = elem.gCal$selected.value == 'true';
  this.timezone = elem.gCal$timezone.value;
  this.hidden = elem.gCal$hidden.value == 'true';
  this.updated = Utils.rfc3339StringToDate(elem.updated.$t);
  if (elem.gCal$overridename) {
    this.overrideName = elem.gCal$overridename.value;
  }
};
