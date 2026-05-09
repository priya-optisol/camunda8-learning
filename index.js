 const {Camunda8} =  require('@camunda8/sdk');

// 1. Initialize the SDK
const c8 = new Camunda8();

// 2. Get the Zeebe client
// It will automatically use environment variables for credentials
// or default to http://localhost:26500 for local development
const zeebe = c8.getZeebeGrpcApiClient();

console.log('Starting Payment Service Worker...');

// 3. Create the worker
const worker = zeebe.createWorker({
  taskType: 'payment-service', // Must match the "Task definition type" in BPMN
  taskHandler: async (job) => {
    const { orderId, amount } = job.variables;

    try {
      console.log(`[Worker] Processing payment of $${amount} for order ${orderId}`);

      // Simulate business logic (e.g., calling a payment gateway)
      if (amount <= 0) {
        // Report a Business Error back to the process
        return job.error('INVALID_AMOUNT', 'Amount must be greater than zero');
      }

      // 4. Complete the job and optionally pass new variables back
      return job.complete({
        paymentStatus: 'success',
        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9)
      });

    } catch (err) {
      // 5. Fail the job if a technical error occurs (triggering retries)
      console.error('Payment failed:', err.message);
      return job.fail(`Connection error: ${err.message}`);
    }
  }
});