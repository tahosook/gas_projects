// mock Utilities and UrlFetchApp for testing
(globalThis as any).Utilities = {
  formatDate: (date: Date, timeZone: string, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

(globalThis as any).Charts = {
  ChartType: {
    LINE: 'LINE'
  }
};

(globalThis as any).SpreadsheetApp = {
  openById: (id: string) => {
    return {
      getSheets: () => {
        return [{
          getName: () => "Sheet1",
          getDataRange: () => {
            return {
              getValues: () => {
                return [["header1", "header2"], ["value1", "value2"]];
              }
            };
          },
          getLastRow: () => {
            return 2;
          },
          appendRow: (row: any[]) => { },
          deleteSheet: () => {}
        }];
      },
      getSheetByName: (name: string) => {
        return null;
      },
      insertSheet: (sheetName: string) => {
        return {
          setName: (name: string) => { },
          getDataRange: () => {
            return {
              getValues: () => {
                return [["header1", "header2"], ["value1", "value2"]];
              },
              setValues: (values: any[][]) => { }
            };
          },
          appendRow: (row: any[]) => { },
          getLastRow: () => {
            return 2;
          },
          getRange: (row: number, column: number, numRows: number, numColumns: number) => {
            return {
              setValues: (values: any[][]) => { },
              getValue: () => 0, // Mock value for average/min calculations
            };
          },
          newChart: () => {
            return {
              addRange: function (range: any) { return this; },
              setPosition: function (row: number, column: number, offsetX: number, offsetY: number) { return this; },
              setChartType: function (type: string) { return this; },
              setOption: function (option: string, value: any) { return this; },
              build: () => ({})
            };
          },
          insertChart: (chart: any) => { },
          insertRowAfter: (row: number) => { }
        };
      },

    };
  }
};

(globalThis as any).UrlFetchApp = {
  fetch: (url: string): { getResponseCode: () => number; getContentText: () => string } => {
    // Mock response for testing
    if (url.includes("ambidata.io")) {
      const fs = require('fs');
      const data = fs.readFileSync('tests/ambidata_response.test.json', 'utf8');
      return {
        getResponseCode: () => 200,
        getContentText: () => data
      };
    }
    throw new Error(`Mocked fetch failed for URL: ${url}`);
  }
};
