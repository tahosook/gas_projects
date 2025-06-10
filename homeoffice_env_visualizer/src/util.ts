/**
 * Utility functions for the Home Office Environment Visualizer.
 */

// Returns the yesterday date in "yyyy-MM-dd" format.
export function getYesterday(){
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
