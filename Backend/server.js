import app from './app.js';

// Local development entry point.
// On Vercel the app is served as a serverless function via api/index.js.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
