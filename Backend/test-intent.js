import { IntentAgent } from './agents/intentAgent.js';

async function test() {
  try {
    const res = await IntentAgent.extractIntent('I need a plumber', 'User: Hello');
    console.log('Result:', res);
  } catch (err) {
    console.error('Test Error:', err);
  }
}
test();
