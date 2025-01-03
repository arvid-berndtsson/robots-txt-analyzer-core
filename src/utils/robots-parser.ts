interface RobotRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
  sitemaps: string[];
}

export function parseRobotsTxt(content: string): RobotRule[] {
  const lines = content.split('\n').map(line => line.trim());
  const rules: RobotRule[] = [];
  let currentRule: RobotRule | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const [directive, value] = line.split(':', 2).map(s => s.trim().toLowerCase());

    switch (directive) {
      case 'user-agent':
        if (currentRule) rules.push(currentRule);
        currentRule = { userAgent: value, disallow: [], allow: [], sitemaps: [] };
        break;
      case 'disallow':
        if (currentRule) currentRule.disallow.push(value);
        break;
      case 'allow':
        if (currentRule) currentRule.allow.push(value);
        break;
      case 'crawl-delay':
        if (currentRule) currentRule.crawlDelay = parseFloat(value);
        break;
      case 'sitemap':
        if (currentRule) currentRule.sitemaps.push(value);
        else if (rules.length > 0) rules[rules.length - 1].sitemaps.push(value);
        else rules.push({ userAgent: '*', disallow: [], allow: [], sitemaps: [value] });
        break;
    }
  }

  if (currentRule) rules.push(currentRule);
  return rules;
}

export function analyzeRobotsTxt(rules: RobotRule[]): string {
  let analysis = '';
  const globalRule = rules.find(rule => rule.userAgent === '*');

  analysis += "Summary:\n";
  analysis += `- Total rules: ${rules.length}\n`;
  analysis += `- Global rule present: ${globalRule ? 'Yes' : 'No'}\n\n`;

  rules.forEach((rule, index) => {
    analysis += `Rule ${index + 1} (${rule.userAgent}):\n`;
    analysis += `- This rule applies to ${rule.userAgent === '*' ? 'all crawlers' : `the ${rule.userAgent} crawler`}.\n`;
    
    if (rule.disallow.length > 0) {
      analysis += `- Disallowed paths:\n  ${rule.disallow.join('\n  ')}\n`;
    } else {
      analysis += `- No paths are explicitly disallowed.\n`;
    }

    if (rule.allow.length > 0) {
      analysis += `- Allowed paths:\n  ${rule.allow.join('\n  ')}\n`;
    }

    if (rule.crawlDelay) {
      analysis += `- Crawl delay: ${rule.crawlDelay} seconds\n`;
    }

    if (rule.sitemaps.length > 0) {
      analysis += `- Sitemaps:\n  ${rule.sitemaps.join('\n  ')}\n`;
    }

    analysis += '\n';
  });

  analysis += "Recommendations:\n";
  if (!globalRule) {
    analysis += "- Consider adding a global rule (User-agent: *) to provide default instructions for all crawlers.\n";
  }
  if (rules.every(rule => rule.disallow.length === 0)) {
    analysis += "- Your robots.txt doesn't disallow any paths. Make sure this is intentional.\n";
  }
  if (rules.every(rule => rule.sitemaps.length === 0)) {
    analysis += "- Consider adding a Sitemap directive to help search engines discover your content more efficiently.\n";
  }

  return analysis;
}
