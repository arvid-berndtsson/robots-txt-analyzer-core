import { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = ({ text }) => {
  const expiryDate = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 23, 59, 59));
  
  const content = `# Security Policy for robots-txt.arvid.tech
Contact: mailto:security@arvid.tech
Expires: ${expiryDate.toISOString()}
Preferred-Languages: en
Canonical: https://robots-txt.arvid.tech/.well-known/security.txt

# Please report security issues responsibly
# Thank you for helping keep our users safe!`;

  text(200, content);
}; 