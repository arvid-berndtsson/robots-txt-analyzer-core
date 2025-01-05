interface RobotRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
  sitemaps: string[];
}

interface Recommendation {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'potential';
  details?: string;
}

interface RobotsAnalysis {
  summary: {
    totalRules: number;
    hasGlobalRule: boolean;
    totalSitemaps: number;
    score: number;
    status: '✅ All Good' | '⚠️ Some Issues' | '❌ Major Issues' | '❓ Potential Issues';
  };
  rules: Array<{
    userAgent: string;
    isGlobal: boolean;
    disallowedPaths: string[];
    allowedPaths: string[];
    crawlDelay?: number;
  }>;
  sitemaps: {
    urls: string[];
    issues: string[];
  };
  recommendations: Recommendation[];
  urls: {
    allowed: string[];
    blocked: string[];
  };
}

function makeUrlAbsolute(path: string, baseUrl: string): string {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

export function parseRobotsTxt(content: string): RobotRule[] {
  const lines = content.split('\n').map(line => line.trim());
  const ruleMap = new Map<string, RobotRule>();
  let currentRule: RobotRule | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const directive = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    switch (directive) {
      case 'user-agent':
        const userAgent = value.toLowerCase();
        // If we already have a rule for this user agent, use it
        if (ruleMap.has(userAgent)) {
          currentRule = ruleMap.get(userAgent)!;
        } else {
          currentRule = { userAgent, disallow: [], allow: [], sitemaps: [] };
          ruleMap.set(userAgent, currentRule);
        }
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
        if (currentRule) {
          currentRule.sitemaps.push(value);
        } else {
          // If no current rule, add sitemap to global rule or create one
          const globalRule = ruleMap.get('*') || { userAgent: '*', disallow: [], allow: [], sitemaps: [] };
          globalRule.sitemaps.push(value);
          ruleMap.set('*', globalRule);
        }
        break;
    }
  }

  // Convert map to array, putting global rule first if it exists
  const rules = Array.from(ruleMap.values());
  const globalRuleIndex = rules.findIndex(rule => rule.userAgent === '*');
  if (globalRuleIndex !== -1) {
    const globalRule = rules.splice(globalRuleIndex, 1)[0];
    rules.unshift(globalRule);
  }

  return rules;
}

interface WebAppSignature {
  name: string;
  confidence: number;
  patterns: string[];
}

const SENSITIVE_PATHS = {
  admin: [
    '/wp-admin', '/administrator', '/admin', '/backend', '/manage',
    '/dashboard', '/control', '/cpanel', '/moderator', '/webadmin',
    '/adminpanel', '/admin-panel', '/wp/wp-admin', '/cms', '/console'
  ],
  auth: [
    '/login', '/signin', '/signup', '/register', '/auth',
    '/password-reset', '/forgot-password', '/reset-password',
    '/change-password', '/logout', '/signout'
  ],
  user: [
    '/user', '/users', '/profile', '/account', '/accounts',
    '/members', '/member', '/settings', '/preferences',
    '/my-account', '/dashboard', '/portal'
  ],
  ecommerce: [
    '/cart', '/checkout', '/basket', '/order', '/orders',
    '/payment', '/transactions', '/billing', '/shipping',
    '/shop/cart', '/shop/checkout', '/store/cart'
  ],
  api: [
    '/api', '/api/v1', '/api/v2', '/api/v3', '/rest',
    '/graphql', '/gql', '/swagger', '/docs/api', '/api-docs',
    '/api/docs', '/api/swagger', '/api/graphql', '/api/rest'
  ],
  sensitive: [
    '/backup', '/backups', '/db', '/database', '/logs',
    '/log', '/private', '/config', '/settings', '/setup',
    '/install', '/tmp', '/temp', '/test', '/phpinfo.php',
    '/.env', '/wp-config.php', '/config.php', '/.git',
    '/server-status', '/nginx_status'
  ],
  media: [
    '/uploads', '/media', '/files', '/download', '/downloads',
    '/assets/uploads', '/wp-content/uploads', '/attachments',
    '/documents', '/images/private'
  ]
};

const WEB_APP_SIGNATURES: WebAppSignature[] = [
  {
    name: 'WordPress',
    confidence: 0,
    patterns: ['/wp-admin', '/wp-content', '/wp-includes', '/wp-json']
  },
  {
    name: 'Drupal',
    confidence: 0,
    patterns: ['/node', '/sites/default', '/admin/content', '/user/login']
  },
  {
    name: 'Joomla',
    confidence: 0,
    patterns: ['/administrator', '/components', '/modules', '/templates']
  },
  {
    name: 'Magento',
    confidence: 0,
    patterns: ['/admin_', '/checkout', '/customer', '/catalogsearch', '/sales']
  },
  {
    name: 'Shopify',
    confidence: 0,
    patterns: ['/collections', '/products', '/cart', '/checkout', '/admin']
  },
  {
    name: 'Ghost',
    confidence: 0,
    patterns: ['/ghost', '/content/images', '/assets', '/blog']
  },
  {
    name: 'Laravel',
    confidence: 0,
    patterns: ['/api', '/storage', '/public/storage', '/resources']
  },
  {
    name: 'Django',
    confidence: 0,
    patterns: ['/admin', '/media', '/static', '/accounts']
  },
  {
    name: 'Rails',
    confidence: 0,
    patterns: ['/assets', '/admin', '/rails', '/users']
  }
];

function detectWebApp(rules: RobotRule[]): { detected: WebAppSignature[], unprotectedPaths: { category: string; paths: string[] }[] } {
  const allPaths = rules.flatMap(rule => [...rule.allow, ...rule.disallow]);
  const signatures = WEB_APP_SIGNATURES.map(sig => ({...sig}));
  const unprotectedCategories: { [key: string]: string[] } = {};

  // Check for web app signatures
  signatures.forEach(sig => {
    sig.patterns.forEach(pattern => {
      if (allPaths.some(path => path.includes(pattern))) {
        sig.confidence += 25;
      }
    });
  });

  // Check for unprotected sensitive paths
  Object.entries(SENSITIVE_PATHS).forEach(([category, paths]) => {
    const unprotected = paths.filter(path => 
      !rules.some(rule => rule.disallow.some(disallow => 
        disallow.includes(path.toLowerCase())
      ))
    );
    if (unprotected.length > Math.ceil(paths.length * 0.3)) { // Only report if more than 30% of paths are unprotected
      unprotectedCategories[category] = unprotected;
    }
  });

  return {
    detected: signatures.filter(sig => sig.confidence >= 50),
    unprotectedPaths: Object.entries(unprotectedCategories).map(([category, paths]) => ({
      category,
      paths
    }))
  };
}

export function analyzeRobotsTxt(rules: RobotRule[], baseUrl?: string): RobotsAnalysis {
  const globalRule = rules.find(rule => rule.userAgent === '*');
  const allSitemaps = new Set<string>();
  const recommendations: Recommendation[] = [];
  let score = 100;
  
  // Collect all sitemaps and validate them
  rules.forEach(rule => {
    rule.sitemaps.forEach(sitemap => allSitemaps.add(sitemap));
  });

  // Collect all unique URLs
  const uniqueAllowedUrls = new Set<string>();
  const uniqueBlockedUrls = new Set<string>();
  rules.forEach(rule => {
    rule.allow.forEach(path => uniqueAllowedUrls.add(baseUrl ? makeUrlAbsolute(path, baseUrl) : path));
    rule.disallow.forEach(path => uniqueBlockedUrls.add(baseUrl ? makeUrlAbsolute(path, baseUrl) : path));
  });

  // Web app detection first to contextualize recommendations
  const { detected, unprotectedPaths } = detectWebApp(rules);
  
  // Basic but critical recommendations
  if (!globalRule) {
    recommendations.push({
      message: "Missing global rule (User-agent: *)",
      severity: "error",
      details: "A global rule provides default instructions for all crawlers and is considered a best practice."
    });
    score -= 20;
  }

  // Framework-specific recommendations and sensitive paths analysis only if web apps detected
  if (detected.length > 0) {
    detected.forEach(framework => {
      switch (framework.name) {
        case 'WordPress':
          // Check WordPress-specific paths
          const wpPaths = ['/wp-admin', '/wp-includes', '/wp-content/plugins', '/wp-content/themes'];
          const unprotectedWpPaths = wpPaths.filter(path => 
            !rules.some(rule => rule.disallow.some(disallow => disallow.includes(path.toLowerCase())))
          );
          if (unprotectedWpPaths.length > 0) {
            recommendations.push({
              message: "WordPress admin areas exposed",
              severity: "error",
              details: `Protect these WordPress paths: ${unprotectedWpPaths.join(', ')}. This helps prevent unauthorized access and potential security issues.`
            });
            score -= 15;
          }
          // Check for XML sitemap
          if (!Array.from(allSitemaps).some(url => url.includes('sitemap.xml') || url.includes('sitemap_index.xml'))) {
            recommendations.push({
              message: "WordPress XML sitemap not declared",
              severity: "warning",
              details: "WordPress generates XML sitemaps by default. Add sitemap_index.xml to help search engines discover your content."
            });
            score -= 5;
          }
          break;

        case 'Drupal':
          // Check Drupal-specific paths
          const drupalPaths = ['/admin', '/node/add', '/user/register', '/install.php'];
          const unprotectedDrupalPaths = drupalPaths.filter(path => 
            !rules.some(rule => rule.disallow.some(disallow => disallow.includes(path.toLowerCase())))
          );
          if (unprotectedDrupalPaths.length > 0) {
            recommendations.push({
              message: "Drupal admin areas exposed",
              severity: "error",
              details: `Protect these Drupal paths: ${unprotectedDrupalPaths.join(', ')}. These should be blocked from search engine indexing.`
            });
            score -= 15;
          }
          break;

        case 'Magento':
          // Check Magento-specific paths
          if (!rules.some(rule => rule.disallow.some(path => path.includes('/admin')))) {
            recommendations.push({
              message: "Magento admin path exposed",
              severity: "error",
              details: "Block access to your Magento admin area to prevent unauthorized access attempts."
            });
            score -= 15;
          }
          break;

        case 'Shopify':
          // Check Shopify-specific recommendations
          const shopifyPaths = ['/admin', '/cart', '/checkout', '/orders'];
          const unprotectedShopifyPaths = shopifyPaths.filter(path => 
            !rules.some(rule => rule.disallow.some(disallow => disallow.includes(path.toLowerCase())))
          );
          if (unprotectedShopifyPaths.length > 0) {
            recommendations.push({
              message: "Shopify checkout and admin areas exposed",
              severity: "warning",
              details: `Consider protecting these Shopify paths: ${unprotectedShopifyPaths.join(', ')}. While some might be protected by Shopify itself, it's good practice to block them in robots.txt.`
            });
            score -= 10;
          }
          break;
      }
    });
  }

  // Only check for sensitive paths if we detect a web application
  if (detected.length > 0) {
    unprotectedPaths.forEach(({ category, paths }) => {
      // Only show relevant categories based on detected framework
      const relevantCategory = detected.some(framework => 
        (framework.name === 'WordPress' && ['admin', 'media'].includes(category)) ||
        (framework.name === 'Magento' && ['ecommerce', 'admin'].includes(category)) ||
        (framework.name === 'Shopify' && ['ecommerce', 'admin'].includes(category)) ||
        (framework.name === 'Drupal' && ['admin', 'user'].includes(category))
      );

      if (relevantCategory) {
        recommendations.push({
          message: `Unprotected ${category} paths detected`,
          severity: "warning",
          details: `Consider protecting these ${category} paths: ${paths.join(', ')}`
        });
        score -= 5;
      }
    });
  }

  // Sitemap validation only if no CMS-specific recommendations exist
  if (detected.length === 0 && allSitemaps.size === 0) {
    recommendations.push({
      message: "No sitemaps declared",
      severity: "warning",
      details: "Consider adding a sitemap to help search engines discover your content more efficiently."
    });
    score -= 10;
  }

  // Check crawl delay only for custom implementations
  if (detected.length === 0 && rules.some(rule => rule.crawlDelay && rule.crawlDelay > 5)) {
    recommendations.push({
      message: "High crawl delay detected",
      severity: "warning",
      details: "Crawl delays over 5 seconds can significantly slow down indexing. Consider optimizing your server to handle more frequent crawls."
    });
    score -= 10;
  }

  // Only warn about wildcards if they're used in a concerning way
  const hasComplexWildcards = rules.some(rule => 
    rule.disallow.some(path => 
      (path.includes('*') && path.includes('/')) || 
      path.split('*').length > 2
    )
  );
  if (hasComplexWildcards) {
    recommendations.push({
      message: "Complex wildcard patterns detected",
      severity: "potential",
      details: "Your robots.txt uses complex wildcard patterns. This might be intentional, but verify these patterns aren't accidentally blocking important content."
    });
    score -= 3; // Lower score impact for potential issues
  }

  // Update Shopify recommendations to use 'potential' severity
  if (detected.some(f => f.name === 'Shopify')) {
    const shopifyPaths = ['/admin', '/cart', '/checkout', '/orders'];
    const unprotectedShopifyPaths = shopifyPaths.filter(path => 
      !rules.some(rule => rule.disallow.some(disallow => disallow.includes(path.toLowerCase())))
    );
    if (unprotectedShopifyPaths.length > 0) {
      recommendations.push({
        message: "Shopify paths not explicitly blocked",
        severity: "potential",
        details: `These Shopify paths are not blocked: ${unprotectedShopifyPaths.join(', ')}. While they might be protected by Shopify itself, consider blocking them in robots.txt for extra clarity.`
      });
      score -= 3;
    }
  }

  // Determine overall status with new potential category
  const hasErrors = recommendations.some(r => r.severity === 'error');
  const hasWarnings = recommendations.some(r => r.severity === 'warning');
  const hasPotentialIssues = recommendations.some(r => r.severity === 'potential');
  
  const status = hasErrors ? '❌ Major Issues' : 
                hasWarnings ? '⚠️ Some Issues' : 
                hasPotentialIssues ? '❓ Potential Issues' :
                '✅ All Good';

  return {
    summary: {
      totalRules: rules.length,
      hasGlobalRule: !!globalRule,
      totalSitemaps: allSitemaps.size,
      score: Math.max(0, score),
      status
    },
    rules: rules.map(rule => ({
      userAgent: rule.userAgent,
      isGlobal: rule.userAgent === '*',
      disallowedPaths: rule.disallow,
      allowedPaths: rule.allow,
      crawlDelay: rule.crawlDelay
    })),
    sitemaps: {
      urls: Array.from(allSitemaps),
      issues: []
    },
    recommendations,
    urls: {
      allowed: Array.from(uniqueAllowedUrls),
      blocked: Array.from(uniqueBlockedUrls)
    }
  };
}
