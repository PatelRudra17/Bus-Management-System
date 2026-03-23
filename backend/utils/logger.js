const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const formatDate = () => {
  return new Date().toISOString();
};

const logToFile = (filename, level, message, data = null) => {
  const timestamp = formatDate();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  const filepath = path.join(logDir, filename);
  
  fs.appendFile(filepath, logLine, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${formatDate()}: ${message}`);
    logToFile('app.log', 'INFO', message, data);
  },
  
  error: (message, data) => {
    console.error(`[ERROR] ${formatDate()}: ${message}`);
    logToFile('error.log', 'ERROR', message, data);
    logToFile('app.log', 'ERROR', message, data);
  },
  
  warn: (message, data) => {
    console.warn(`[WARN] ${formatDate()}: ${message}`);
    logToFile('app.log', 'WARN', message, data);
  },
  
  debug: (message, data) => {
    console.debug(`[DEBUG] ${formatDate()}: ${message}`);
    logToFile('debug.log', 'DEBUG', message, data);
  }
};

module.exports = logger;
