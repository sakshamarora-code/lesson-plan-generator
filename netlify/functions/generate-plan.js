// This is your new, secure backend function.
// File Path: /netlify/functions/generate-plan.js

exports.handler = async (event) => {
  // 1. Get the API key from Netlify's secure environment variables
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Get the prompts that your index.html sent in the request
  const { systemPrompt, userPrompt } = JSON.parse(event.body);

  // 3. Basic validation
  if (!systemPrompt || !userPrompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing prompt data.' }),
    };
  }
  
  // 4. This is the payload to send to the Google API
  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
  };

  // 5. This is the Google API URL. The key is safely used here on the server.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    // 6. Call the Google API *from the server*
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If Google returns an error, send it back to the user
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // 7. Get the successful result from Google
    const result = await response.json();

    // 8. Send the successful result back to your index.html page
    return {
      statusCode: 200,
      body: JSON.stringify(result), // Pass Google's response through
    };

  } catch (error) {
    // 9. Handle any errors that happened during the fetch
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
