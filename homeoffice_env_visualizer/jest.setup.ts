// mock Utilities and UrlFetchApp for testing
(globalThis as any).Utilities = {
  formatDate: (date: Date, timeZone: string, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

(globalThis as any).UrlFetchApp = {
  fetch: (url: string): { getResponseCode: () => number; getContentText: () => string } => {
    // Mock response for testing
    if (url.includes("ambidata.io")) {
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ data: "mocked data" })
      };
    }
    throw new Error(`Mocked fetch failed for URL: ${url}`);
  }
};