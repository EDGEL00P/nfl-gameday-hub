import type { VercelRequest, VercelResponse } from '@vercel/node';

// ESPN unofficial API - free, no key required
const ESPN_NFL_NEWS = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const response = await fetch(ESPN_NFL_NEWS);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'ESPN API error' });
    }
    
    const data = await response.json();
    
    // Transform ESPN news to our schema
    const news = (data.articles || []).map((article: any) => ({
      id: String(article.dataSourceIdentifier || article.id || Math.random()),
      headline: article.headline || '',
      description: article.description || '',
      story: article.story || '',
      published: article.published || new Date().toISOString(),
      author: article.byline || 'ESPN',
      source: 'ESPN',
      imageUrl: article.images?.[0]?.url || null,
      videoUrl: article.video?.source || null,
      categories: article.categories?.map((c: any) => c.description) || ['NFL'],
      teams: article.categories?.filter((c: any) => c.type === 'team').map((c: any) => c.description) || [],
      premium: article.premium || false,
      sentiment: 'neutral',
    }));
    
    res.json(news);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
