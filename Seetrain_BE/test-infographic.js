const { generateTrainingContent } = require("./src/services/contentPlanner");
const { generateInfographic } = require("./src/services/infographicService");

async function test() {
  const extractedText = `
Cybersecurity Basics: How to Stay Safe Online

Password Security:
Use strong and unique passwords for every account.
Avoid using personal information in passwords.
A password manager can help store complex passwords safely.

Phishing Attacks:
Phishing is a type of attack where criminals use fake emails,
messages or websites to steal sensitive information.
Never click suspicious links or provide passwords through untrusted websites.

Safe Browsing:
Check website addresses before entering personal information.
Look for HTTPS and avoid downloading files from unknown sources.
`;

  const trainingContent = await generateTrainingContent(extractedText);

  const outputPath = await generateInfographic(
    trainingContent,
    "test-infographic",
  );

  console.log("Output:", outputPath);
}

test().catch(console.error);
