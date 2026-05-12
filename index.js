 const {Camunda8} =  require('@camunda8/sdk');
 const axios = require("axios");
// 1. Initialize the SDK
const c8 = new Camunda8();

// 2. Get the Zeebe client
// It will automatically use environment variables for credentials
// or default to http://localhost:26500 for local development
const zeebe = c8.getZeebeGrpcApiClient();

console.log('Starting Worker...');
const workerKYC = zeebe.createWorker({
  taskType: "kyc-api-call", // This matches the "Type" in Modeler
  taskHandler: async (job) => {
    const { aadharNumber } = job.variables;

    try {
      const response = await axios.get("http://localhost:3000/students/kyc-data/"+aadharNumber);
      return job.complete({ apiStatus: response.data.status});
    } catch (err) {
      console.log("e");

      return job.fail(err.message);
    }
  }
});
const workerUpdateKYC = zeebe.createWorker({
  taskType: "kyc-update-call", // This matches the "Type" in Modeler
  taskHandler: async (job) => {
    const { kycStatus,aadharNumber } = job.variables;

    try {
      const data = { status: kycStatus };
      const response = await axios.patch("http://localhost:3000/students/kyc-update-data/"+aadharNumber,data);
      return job.complete({ apiStatus: response.data.status});
    } catch (err) {
      console.log("e");

      return job.fail(err.message);
    }
  }
});
// const worker0 = zeebe.createWorker({
//   taskType: "process-api-call", // This matches the "Type" in Modeler
//   taskHandler: async (job) => {
//     try {
//       const response = await axios.get("http://localhost:3000/students/");
//       return job.complete({ apiStatus: response.data.status,apiData:response.data.data });
//     } catch (err) {
//       console.log("e");

//       return job.fail(err.message);
//     }
//   }
// });
// // 3. Create the worker
// const worker = zeebe.createWorker({
//   taskType: 'payment-service', // Must match the "Task definition type" in BPMN
//   taskHandler: async (job) => {
//     const { orderId, amount } = job.variables;

//     try {
//       console.log(`[Worker] Processing payment of $${amount} for order ${orderId}`);

//       // Simulate business logic (e.g., calling a payment gateway)
//       if (amount <= 0) {
//         // Report a Business Error back to the process
//         return job.error('INVALID_AMOUNT', 'Amount must be greater than zero');
//       }

//       // 4. Complete the job and optionally pass new variables back
//       return job.complete({
//         paymentStatus: 'success',
//         transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9)
//       });

//     } catch (err) {
//       // 5. Fail the job if a technical error occurs (triggering retries)
//       console.error('Payment failed:', err.message);
//       return job.fail(`Connection error: ${err.message}`);
//     }
//   }
// });
// const worker2 = zeebe.createWorker({
// taskType:'hello-worker',
// taskHandler:async(job)=>{
//  console.log(`Processing job ${job.key} with variables:`, job.variables);
//  let name = job.variables.name || 'Guest';
//   const responseData = {
//       greeting: `Hello from Node.js, ${name}!`,
//       status: name=="Admin"?'Success':'Failed'
//     };

//     console.log('Sending response back to BPMN:', responseData);
//     return job.complete(responseData);
// }
// });