const DID_API_URL = "https://api.d-id.com";

function getHeaders() {
  const apiKey = process.env.DID_API_KEY;

  if (!apiKey) {
    throw new Error("Missing DID_API_KEY");
  }

  return {
    Authorization: `Basic ${apiKey}`,
    Accept: "application/json",
  };
}

// testing
async function testDidConnection() {
  const response = await fetch(`${DID_API_URL}/agents`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    const detail = data.description || data.message || JSON.stringify(data);
    if (response.status === 402) {
      const error = new Error(
        `D-ID API error: HTTP 402 - D-ID account has insufficient credits or balance`,
      );
      error.status = 402;
      error.details = data;
      throw error;
    }
    throw new Error(
      `D-ID API error (${response.status}): ${detail}`,
    );
  }

  return data;
}

// get avt
async function getPresenters(limit = 20) {
  const response = await fetch(
    `${DID_API_URL}/clips/presenters?limit=${limit}`,
    {
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const detail = data.description || data.message || JSON.stringify(data);
    if (response.status === 402) {
      const error = new Error(
        `D-ID API error: HTTP 402 - D-ID account has insufficient credits or balance`,
      );
      error.status = 402;
      error.details = data;
      throw error;
    }
    throw new Error(
      `D-ID API error (${response.status}): ${detail}`,
    );
  }

  return data;
}

module.exports = {
  testDidConnection,
  getPresenters,
};
