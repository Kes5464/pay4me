// Test script to check API accessibility
async function testAPI() {
  const urls = [
    'https://payme-qa79kd3xc-kestine1s-projects.vercel.app/api/health'
  ];

  for (const url of urls) {
    try {
      console.log(`Testing ${url}...`);
      const response = await fetch(url, {
        headers: {
          'x-vercel-protection-bypass': 'true'
        }
      });
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
      } else {
        const text = await response.text();
        console.log('Failed:', response.status, text);
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
}

testAPI();