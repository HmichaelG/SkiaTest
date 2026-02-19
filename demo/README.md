# Web Worker SecurityError Fix Demo

## Problem

When trying to use Web Workers with the file:// protocol, you encounter this error:

```
Uncaught SecurityError: Failed to construct 'Worker': Script at 'file:///D:/test/worker.js' cannot be accessed from origin 'null'. app.js:49
```

This happens because browsers enforce CORS (Cross-Origin Resource Sharing) policies that prevent loading worker scripts from `file://` URLs due to security restrictions.

## Solution

The solution is to use **Blob URLs** to create inline workers instead of loading external JavaScript files. This approach:

1. Embeds the worker code as a string in the main JavaScript file
2. Creates a Blob object with the worker code
3. Generates a blob:// URL using `URL.createObjectURL()`
4. Instantiates the Worker using the blob URL

This method works with both file:// and http:// protocols.

## How It Works

### Before (Causes SecurityError):
```javascript
// Line 49 - This fails with file:// protocol
worker = new Worker('worker.js');
```

### After (Works with file:// protocol):
```javascript
// Embed worker code as a string
const workerCode = `
    // Worker code here
    self.addEventListener('message', function(e) {
        // Handle messages
    });
`;

// Create Blob URL
const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);

// Create worker with blob URL - Works with file:// protocol!
worker = new Worker(workerUrl);
```

## Files in this Demo

- **index.html**: Main HTML page with UI
- **app.js**: Fixed JavaScript code using Blob URLs for workers
- **worker.js**: Reference worker code (not loaded directly, embedded in app.js instead)
- **README.md**: This file

## How to Test

1. Open `index.html` directly in your browser using file:// protocol:
   - On Windows: Double-click the file or drag to browser
   - On Mac/Linux: Open from Finder/File Manager or use: `open index.html`
   
2. The page should load without any SecurityError in the console

3. Click "Start Worker Computation" button to see the worker in action

4. Check the browser console (F12) - you should see:
   ```
   Worker created successfully using Blob URL!
   ```

## Alternative Solutions

If you prefer not to inline the worker code, you can:

1. **Use a local web server**: 
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with http-server package)
   npx http-server
   ```
   Then access via `http://localhost:8000`

2. **Use browser extensions**: Some browsers allow disabling security for local development (not recommended for production)

3. **Deploy to a web server**: Host files on any web server with proper CORS headers

## Benefits of Blob URL Approach

- ✅ Works with file:// protocol
- ✅ No need for a web server during development
- ✅ No CORS issues
- ✅ Self-contained solution
- ✅ Easy to deploy

## References

- [MDN Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [MDN URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
- [MDN Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
