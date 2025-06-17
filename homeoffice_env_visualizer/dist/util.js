/**
 * Utility functions for the Home Office Environment Visualizer.
 */
// Returns the yesterday date in "yyyy-MM-dd" format.
export function getYesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var date = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy-MM-dd');
    return date;
}
// Fetches JSON data from ambidata.io for a given channel and date.
export function getAmbidataJson(channelId, readKey, date) {
    const url = `https://ambidata.io/api/v1/channel/${channelId}/data?read_key=${readKey}&date=${date}`;
    const response = UrlFetchApp.fetch(url);
    if (response.getResponseCode() !== 200) {
        throw new Error(`Failed to fetch data from ambidata.io: ${response.getContentText()}`);
    }
    return JSON.parse(response.getContentText());
}
