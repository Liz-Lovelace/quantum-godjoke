import express from 'express';

/**
 * Sends a report to pager duty
 *
 * @description Best practice is:
 *  - pass message-only if it's not an error
 *  - pass error or error+message if it's an error
 *  - pass userMessage or userMessage+message if it's a user-generated message
 * 
 * You can also pass the error directly or do `.catch(report)` for promises
 *
 * @param {Error|Object} [options]
 * @param {Error|string} [options.error]
 * @param {string} [options.message]
 * @param {string} [options.userMessage]
 */
export function report(options) {
  try {
    if (options.stack) {
      options = { error: options}
    }
    let {message, error, userMessage} = options

    let reportString = '';
    let reportType = 'info'

    if (message) {
      reportString += `${message}\n\n`;
    }

    if (error) {
      if (typeof error === 'string') {
        reportString += error;
      } else if (error.stack && error.stack.includes(error.message)) {
        reportString += error.stack;
      } else {
        reportString += `${error.toString()}\n${error.stack}`;
      }
      reportType = 'runtimeError';
    }

    if (userMessage) {
      reportString += userMessage;
      reportType = 'userMessage';
    }

    console.error(reportString);

    fetch(`https://report.liz-lovelace.com/submit?channel=135`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportString, reportType })
    });
  } catch (err) {
    console.error('ERROR WHILE SUBMITTING ERROR:', err);
  }
}

const app = express();
const port = 3921;

app.use(express.static('public'));

// we have to do this on the backend because the browser throws a CORS error if it tries to access this API
app.get('/qrng', async (req, res) => {
  try {
    const response = await fetch('http://lfdr.de/qrng_api/qrng?length=1&format=HEX');
    const data = await response.json();
    res.json(data);
  } catch (e) {
    report(e)
    console.error('error', e)
    res.status(500).send(e.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
