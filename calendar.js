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
  for (var node = elem.firstChild; node != null; node = node.nextSibling) {
    if (node.nodeName == 'id') {
      this.id = node.firstChild ? node.firstChild.nodeValue : MSG_NO_TITLE;
    } else if (node.nodeName == 'title') {
      this.title = node.firstChild ? node.firstChild.nodeValue : MSG_NO_TITLE;
    } else if (node.nodeName == 'author') {
      for (var i = 0; i < node.childNodes.length; ++i) {
        if (node.childNodes[i].nodeName == 'email') {
          this.email = node.childNodes[1].firstChild.nodeValue;
        }
      }
    } else if (node.nodeName == 'link' &&
               node.getAttribute('rel') == 'alternate') {
      var url = node.getAttribute('href');
      url = Utils.forceHttpsUrl(url);
      this.url = url;
    } else if (node.nodeName == 'gCal:color') {
      this.color = node.getAttribute('value');
    } else if (node.nodeName == 'gCal:accesslevel') {
      this.accessLevel = node.getAttribute('value');
      if (this.accessLevel != 'owner') {
        options.putDefaultValue(OPTIONS.SHOW + this.id, false);
      }
    } else if (node.nodeName == 'gCal:selected') {
      this.selected = (node.getAttribute('value') != 'false');
    } else if (node.nodeName == 'gCal:timezone') {
      this.timezone = node.getAttribute('value');
    } else if (node.nodeName == 'gCal:hidden') {
      this.hidden = (node.getAttribute('value') != 'false');
    } else if (node.nodeName == 'updated' && node.firstChild) {
      this.updated = Utils.rfc3339StringToDate(node.firstChild.nodeValue);
    } else if (node.nodeName == 'gCal:overridename') {
      this.overrideName = node.getAttribute('value');
    }
  }
};
