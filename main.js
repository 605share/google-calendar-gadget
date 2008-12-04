// Copyright 2008 Google Inc.  All Rights Reserved.

/**
 * @fileoverview Functions for the main view of the gadget.
 */

function view_onOpen() {
  // Set global variables if not defined by the API. These were introduced in
  // 5.8 and might not be in other platforms yet.
  if (gddDetailsViewFlagNoFrame == undefined) {
    gddDetailsViewFlagNoFrame = 0;
  }
  if (gddDetailsViewFlagDisableAutoClose == undefined) {
    gddDetailsViewFlagDisableAutoClose = 0;
  }

  options.encryptValue(OPTIONS.MAIL);
  options.encryptValue(OPTIONS.PASSWORD);
  options.encryptValue(OPTIONS.AUTH);

  options.putDefaultValue(OPTIONS.MAIL, '');
  options.putDefaultValue(OPTIONS.PASSWORD, '');
  options.putDefaultValue(OPTIONS.REMEMBER, true);
  options.putDefaultValue(OPTIONS.HOUR24, false);
  options.putDefaultValue(OPTIONS.VIEW, OPTIONS.CALENDARVIEW);
  options.putDefaultValue(OPTIONS.WEEKSTART, START_SUNDAY);
  options.putDefaultValue(OPTIONS.AUTH, '');
  options.putDefaultValue(OPTIONS.USE_QUICK_ADD, false);
  options.putDefaultValue(OPTIONS.UPGRADE, strings.GADGET_VERSION);

  g_calendarGadget = new CalendarGadget();
  g_calendarGadget.run();
}
