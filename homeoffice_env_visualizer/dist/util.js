"use strict";
/**
 * Utility functions for the Home Office Environment Visualizer.
 */
// Returns the yesterday date in "yyyy-MM-dd" format.
function getYesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var date = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), "yyyy-MM-dd");
    return date;
}
