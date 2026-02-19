// app.js - Fixed version using Blob URL to avoid SecurityError

let worker = null;

// Get the worker code as a string
// This is the fix: instead of loading from a file, we embed the code and create a Blob URL
function getWorkerCode() {
    return `
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
    `;
}

// Create a worker using Blob URL - This works with file:// protocol
function createWorker() {
    try {
        const workerCode = getWorkerCode();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        // This is line 49 in the original error message
        // OLD (causes error): worker = new Worker('worker.js');
        // NEW (works with file://): worker = new Worker(workerUrl);
        worker = new Worker(workerUrl);
        
        // Listen for messages from the worker
        worker.addEventListener('message', function(e) {
            const data = e.data;
            const resultDiv = document.getElementById('result');
            
            if (data.status === 'ready') {
                resultDiv.innerHTML = `<p style="color: green;"><strong>✓ ${data.message}</strong></p>`;
            } else if (data.status === 'completed') {
                resultDiv.innerHTML = `
                    <p style="color: green;"><strong>✓ ${data.message}</strong></p>
                    <p>Computation result: ${data.result.toFixed(2)}</p>
                `;
            } else if (data.status === 'stopped') {
                resultDiv.innerHTML = `<p style="color: orange;"><strong>${data.message}</strong></p>`;
            }
        });
        
        // Handle worker errors
        worker.addEventListener('error', function(e) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `<p style="color: red;"><strong>✗ Worker Error:</strong> ${e.message}</p>`;
        });
        
        console.log('Worker created successfully using Blob URL!');
        
    } catch (error) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <p style="color: red;"><strong>✗ Error creating worker:</strong></p>
            <p>${error.message}</p>
        `;
        console.error('Error creating worker:', error);
    }
}

// Start the worker computation
function startWork() {
    if (!worker) {
        createWorker();
        // Give it a moment to initialize
        setTimeout(() => {
            if (worker) {
                worker.postMessage({ command: 'start' });
            }
        }, 100);
    } else {
        worker.postMessage({ command: 'start' });
    }
}

// Stop the worker
function stopWork() {
    if (worker) {
        worker.postMessage({ command: 'stop' });
        worker = null;
    }
}

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startWork').addEventListener('click', startWork);
    document.getElementById('stopWork').addEventListener('click', stopWork);
    
    // Create the worker on page load
    createWorker();
});
