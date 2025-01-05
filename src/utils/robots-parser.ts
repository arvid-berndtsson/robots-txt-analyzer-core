interface RobotRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
  sitemaps: string[];
}

interface RobotsAnalysis {
  summary: {
    totalRules: number;
    hasGlobalRule: boolean;
    totalSitemaps: number;
  };
  rules: Array<{
    userAgent: string;
    isGlobal: boolean;
    disallowedPaths: string[];
    allowedPaths: string[];
    crawlDelay?: number;
  }>;
  sitemaps: string[];
  recommendations: string[];
}

export function parseRobotsTxt(content: string): RobotRule[] {
  const lines = content.split('\n').map(line => line.trim());
  const rules: RobotRule[] = [];
  let currentRule: RobotRule | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const directive = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    switch (directive) {
      case 'user-agent':
        if (currentRule) rules.push(currentRule);
        currentRule = { userAgent: value.toLowerCase(), disallow: [], allow: [], sitemaps: [] };
        break;
      case 'disallow':
        if (currentRule) currentRule.disallow.push(value.toLowerCase());
        break;
      case 'allow':
        if (currentRule) currentRule.allow.push(value.toLowerCase());
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

export function analyzeRobotsTxt(rules: RobotRule[]): RobotsAnalysis {
  const globalRule = rules.find(rule => rule.userAgent === '*');
  const allSitemaps = new Set<string>();

  // Collect all sitemaps
  rules.forEach(rule => {
    rule.sitemaps.forEach(sitemap => allSitemaps.add(sitemap));
  });

  const recommendations: string[] = [];
  
  // Generate recommendations
  if (!globalRule) {
    recommendations.push("Consider adding a global rule (User-agent: *) to provide default instructions for all crawlers.");
  }
  if (rules.every(rule => rule.disallow.length === 0)) {
    recommendations.push("Your robots.txt doesn't disallow any paths. Make sure this is intentional.");
  }
  if (allSitemaps.size === 0) {
    recommendations.push("Consider adding a Sitemap directive to help search engines discover your content more efficiently.");
  }
  if (rules.some(rule => rule.crawlDelay && rule.crawlDelay > 5)) {
    recommendations.push("Some crawl delays are set quite high. This might slow down search engine indexing.");
  }
  if (rules.some(rule => rule.disallow.includes('/'))) {
    recommendations.push("You're blocking all access to some crawlers. Ensure this is intentional as it prevents indexing.");
  }
  if (rules.some(rule => rule.disallow.some(path => path.includes('*')))) {
    recommendations.push("You're using wildcards in disallow rules. Make sure these patterns aren't accidentally blocking important content.");
  }

  return {
    summary: {
      totalRules: rules.length,
      hasGlobalRule: !!globalRule,
      totalSitemaps: allSitemaps.size
    },
    rules: rules.map(rule => ({
      userAgent: rule.userAgent,
      isGlobal: rule.userAgent === '*',
      disallowedPaths: rule.disallow,
      allowedPaths: rule.allow,
      crawlDelay: rule.crawlDelay
    })),
    sitemaps: Array.from(allSitemaps),
    recommendations
  };
}
