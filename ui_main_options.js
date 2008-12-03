// Copyright 2008 Google Inc.  All Rights Reserved.

/**
 * @fileoverview Options part of the main calendar class.
 */

CalendarGadget.prototype.showOptions = function() {
  plugin.showOptionsDialog();
};

/**
 * Show options dialog to the user.
 * @param {IGoogleDesktopDisplayWindow} wnd Window for the dialog.
 */
CalendarGadget.prototype.showOptionsDlg = function(wnd) {
  var ctl;

  wnd.AddControl(gddWndCtrlClassLabel, 0, "", strings.OPTION_VIEWS,
      10, 10, 220, 20);
  var views = [];
  views.push(strings.CALENDAR_VIEW);
  views.push(strings.DAY_VIEW);
  views.push(strings.AGENDA_VIEW);
  ctl = wnd.AddControl(gddWndCtrlClassList, gddWndCtrlTypeListDrop,
      "optionView", views, 10, 25, 220, 25);
  switch (options.getValue(OPTIONS.VIEW)) {
    case OPTIONS.CALENDARVIEW:
        ctl.value = strings.CALENDAR_VIEW;
        break;
    case OPTIONS.DAYVIEW:
        ctl.value = strings.DAY_VIEW;
        break;
    case OPTIONS.AGENDAVIEW:
        ctl.value = strings.AGENDA_VIEW;
        break;
  }

  ctl = wnd.AddControl(gddWndCtrlClassButton, gddWndCtrlTypeButtonCheck,
      "optionTime", strings.OPTION_TIME, 10, 55, 220, 20);
  ctl.value = options.getValue(OPTIONS.HOUR24);

  wnd.AddControl(gddWndCtrlClassLabel, 0, "", strings.OPTION_WEEKSTART,
      10, 80, 220, 20);
  var weekStart = [];
  weekStart.push(strings.DAY_SAT);
  weekStart.push(strings.DAY_SUN);
  weekStart.push(strings.DAY_MON);
  ctl = wnd.AddControl(gddWndCtrlClassList, gddWndCtrlTypeListDrop,
      "optionWeekStart", weekStart, 10, 95, 220, 25);
  switch (options.getValue(OPTIONS.WEEKSTART)) {
    case START_SATURDAY:
        ctl.value = strings.DAY_SAT;
        break;
    case START_SUNDAY:
        ctl.value = strings.DAY_SUN;
        break;
    case START_MONDAY:
        ctl.value = strings.DAY_MON;
        break;
  }

  wnd.AddControl(gddWndCtrlClassLabel, 0, "", strings.OPTIONS_CHOOSE,
      10, 120, 220, 20);

  var ownCalendars = [];
  var otherCalendars = [];
  for (var i = 0; i < g_cache.getCalendarCount(); ++i) {
    var cal = g_cache.getCalendar(i);
    if (!cal.isVisible()) continue;
    if (cal.accessLevel == 'owner') {
      ownCalendars.push(cal);
    } else {
      otherCalendars.push(cal);
    }
  }
  ownCalendars.sort(this.sortCalendars);
  otherCalendars.sort(this.sortCalendars);

  ctl = wnd.AddControl(gddWndCtrlClassLabel, 0, "", strings.MY_CALENDARS,
      20, 140, 220, 20);

  var calX = 40;
  var calY = 155;
  var calCount = 1;

  for (var i = 0; i < ownCalendars.length; ++i) {
    var cal = ownCalendars[i];
    ctl = wnd.AddControl(gddWndCtrlClassButton, gddWndCtrlTypeButtonCheck,
      'own' + i, cal.getTitle(), calX, calY, 180, 20);
    ctl.value = cal.isSelected();

    calCount++;
    calY += 20;
    if (calCount == 20) {
      calCount = 0;
      calY = 140;
      calX += 180;
    }
  }

  ctl = wnd.AddControl(gddWndCtrlClassLabel, 0, "", strings.OTHER_CALENDARS,
      20, calY, 180, 20);

  calCount++;
  calY += 20;
  if (calCount == 20) {
    calCount = 0;
    calY = 140;
    calX += 180;
  }

  for (var i = 0; i < otherCalendars.length; ++i) {
    var cal = otherCalendars[i];
    ctl = wnd.AddControl(gddWndCtrlClassButton, gddWndCtrlTypeButtonCheck,
      'other' + i, cal.getTitle(), calX, calY, 180, 20);
    ctl.value = cal.isSelected();

    calCount++;
    calY += 20;
    if (calCount == 20) {
      calCount = 0;
      calY = 140;
      calX += 180;
    }

  }

  wnd.onClose = Utils.bind(this.optionsSaveClose, this);
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
CalendarGadget.prototype.optionsSaveClose = function(wnd, code) {
  if (code != gddIdOK) {
    return;
  }
  
  var ctl;
  ctl = wnd.GetControl("optionView");
  switch (ctl.value) {
    case strings.CALENDAR_VIEW:
        options.putValue(OPTIONS.VIEW, OPTIONS.CALENDARVIEW);
        break;
    case strings.DAY_VIEW:
        debug.trace('Day View');
        options.putValue(OPTIONS.VIEW, OPTIONS.DAYVIEW);
        break;
    case strings.AGENDA_VIEW:
        options.putValue(OPTIONS.VIEW, OPTIONS.AGENDAVIEW);
        break;
  }

  ctl = wnd.GetControl("optionTime");
  options.putValue(OPTIONS.HOUR24, ctl.value);

  ctl = wnd.GetControl("optionWeekStart");
  switch (ctl.value) {
    case strings.DAY_SAT:
        options.putValue(OPTIONS.WEEKSTART, START_SATURDAY);
        break;
    case strings.DAY_SUN:
        options.putValue(OPTIONS.WEEKSTART, START_SUNDAY);
        break;
    case strings.DAY_MON:
        options.putValue(OPTIONS.WEEKSTART, START_MONDAY);
        break;
  }

  var ownCalendars = [];
  var otherCalendars = [];
  for (var i = 0; i < g_cache.getCalendarCount(); ++i) {
    var cal = g_cache.getCalendar(i);
    if (!cal.isVisible()) continue;
    if (cal.accessLevel == 'owner') {
      ownCalendars.push(cal);
    } else {
      otherCalendars.push(cal);
    }
  }
  ownCalendars.sort(this.sortCalendars);
  otherCalendars.sort(this.sortCalendars);
  for (var i = 0; i < ownCalendars.length; ++i) {
    var cal = ownCalendars[i];
    ctl = wnd.GetControl('own' + i);
    options.putValue(OPTIONS.SHOW + cal.id, ctl.value);
  }
  for (var i = 0; i < otherCalendars.length; ++i) {
    var cal = otherCalendars[i];
    ctl = wnd.GetControl('other' + i);
    options.putValue(OPTIONS.SHOW + cal.id, ctl.value);

  }

  this.resize();
};
