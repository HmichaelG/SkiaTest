// Worker code - This file exists but cannot be loaded directly via file:// protocol
// The content will be loaded inline using Blob URLs in app.js

// Listen for messages from the main thread
self.addEventListener('message', function(e) {
    const command = e.data.command;
    
    if (command === 'start') {
        // Simulate some computational work
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
            result += Math.sqrt(i);
        }
        
        // Send result back to main thread
        self.postMessage({
            status: 'completed',
            result: result,
            message: 'Worker completed computation successfully!'
        });
    } else if (command === 'stop') {
        self.postMessage({
            status: 'stopped',
            message: 'Worker stopped.'
        });
        self.close();
    }
});

// Send ready message when worker is initialized
self.postMessage({
    status: 'ready',
    message: 'Worker is ready!'
});
