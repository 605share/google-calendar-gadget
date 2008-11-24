// Copyright 2008 Google Inc.  All Rights Reserved.

/**
 * @fileoverview Options part of the main calendar class.
 */

/**
 * Show options dialog to the user.
 */
CalendarGadget.prototype.showOptions = function() {
  optionsListDiv.visible = !optionsListDiv.visible;

  if (!optionsListDiv.visible) {
    return;
  }

  optionsListDiv.width = 104;
  optionsListDiv.height = 84;
  optionsListDiv.x = mainDiv.width - optionsListDiv.width;
  optionsListDiv.y = mainDiv.height - footerDiv.height - optionsListDiv.height + 1;
  optionsList.width = 100;
  optionsList.height = 80;
  optionsList.itemHeight = 16;
  optionsList.itemWidth = 100;
  optionsList.background = 'images/optionsMenuBG.jpg';
  optionsList.itemOverColor = '';
  optionsList.itemSelectedColor = '';

  // Set menu Strings
  optCalendar.bold = false;
  optDay.bold = false;
  optAgenda.bold = false;
  var currentView = options.getValue(OPTIONS.VIEW);
  switch (currentView) {
    case OPTIONS.CALENDARVIEW:
        optCalendar.bold = true;
        break;
    case OPTIONS.DAYVIEW:
        optDay.bold = true;
        break;
    case OPTIONS.AGENDAVIEW:
        optAgenda.bold = true;
        break;
  }
  optCalendar.innerText = '     ' + strings.CALENDAR_VIEW;
  optDay.innerText = '     ' + strings.DAY_VIEW;
  optAgenda.innerText = '     ' + strings.AGENDA_VIEW;
};

CalendarGadget.prototype.optionsViewCalendar = function() {
  this.setView(strings.CALENDAR_VIEW);
  this.showOptions();
};

CalendarGadget.prototype.optionsViewDay = function() {
  this.setView(strings.DAY_VIEW);
  this.showOptions();
};

CalendarGadget.prototype.optionsViewAgenda = function() {
  this.setView(strings.AGENDA_VIEW);
  this.showOptions();
};

CalendarGadget.prototype.optionsWeekStart = function(start) {
  options.putValue(OPTIONS.WEEKSTART, start);
  this.resize();
  this.showOptions();
};

CalendarGadget.prototype.chooseCalendars = function() {
  //miniCalendarDiv.visible = false;
  //agendaDiv.visible = false;
  //footerDiv.visible = false;
  dialogDiv.visible = true;
  loginDiv.visible = false;
  optionsDiv.visible = true;
  this.showOptions();
  this.resizeOptions();
};

CalendarGadget.prototype.optionsAddCalendar = function(cal) {
  var item = calendarList.appendElement('<item />');
  var bgDiv = item.appendElement('<div />');
  bgDiv.x = bgDiv.y = 0;
  bgDiv.width = bgDiv.height = '100%';
  bgDiv.background = cal.color;
  var checkbox = item.appendElement('<checkbox />');
  checkbox.cursor = 'hand';
  checkbox.x = checkbox.y = 0;
  checkbox.height = checkbox.width = '100%';
  checkbox.font = 'arial';
  checkbox.size = 9;
  checkbox.trimming = 'word-ellipsis';
  checkbox.downImage = 'images/checkbox_default.png';
  checkbox.image = 'images/checkbox_default.png';
  checkbox.overImage = 'images/checkbox_default.png';
  checkbox.checkedDownImage = 'images/checkbox_checked.png';
  checkbox.checkedImage = 'images/checkbox_checked.png';
  checkbox.checkedOverImage = 'images/checkbox_checked.png';
  checkbox.value = cal.isSelected();
  checkbox.caption = cal.getTitle();
  checkbox.tooltip = cal.getTitle();
  checkbox.onchange = Utils.bind(this.checkCalendar, this, cal);
  checkbox.color = '#FFFFFF';
};

CalendarGadget.prototype.addOptionText = function(text) {
  var item = calendarList.appendElement('<item />');
  var label = item.appendElement('<label />');
  label.x = label.y = 0;
  label.width = label.height = '100%';
  label.bold = true;
  label.font = 'arial';
  label.innerText = text;
  label.valign = 'middle';
};

CalendarGadget.prototype.checkCalendar = function(cal) {
  options.putValue(OPTIONS.SHOW + cal.id, event.srcElement.value);
};

CalendarGadget.prototype.scrollCalendars = function() {
  calendarList.y = -calendar_sb.value;
};

/**
 * Sort function to sort events by date. All day events always come first.
 * @param {Calendar} a Event a
 * @param {Calendar} b Event b
 * @return {integer} sorting order
 */
CalendarGadget.prototype.sortCalendars = function(a, b) {
  return b.title.toLowerCase() > a.title.toLowerCase() ? -1 : 1;
};

/**
 * Close options dialog
 */
CalendarGadget.prototype.optionsSaveClose = function() {
  // Restore visibility of visual elements
  dialogDiv.visible = false;
  optionsDiv.visible = false;

  // Redraw calendar, dayview and agenda to apply changes.
  g_uiCal.draw();
  g_uiDayView.draw();
  g_uiAgenda.draw();
};
