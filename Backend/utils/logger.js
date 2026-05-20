export const logger = {
  logs: [],
  
  log(agent, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent,
      message,
      data
    };
    this.logs.push(logEntry);
    console.log(`[${agent}] ${message}`, data ? JSON.stringify(data) : '');
    return logEntry;
  },

  getLogs() {
    return this.logs;
  },

  clearLogs() {
    this.logs = [];
  }
};
