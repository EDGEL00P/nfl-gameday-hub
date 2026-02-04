import type { VercelRequest, VercelResponse } from '@vercel/node';

// ESPN unofficial API - free, no key required
const ESPN_NFL_NEWS = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news';

// Map ESPN categories to our filter categories
function mapToFilterCategory(headline: string, description: string, espnCategories: string[]): string[] {
  const text = `${headline} ${description}`.toLowerCase();
  const categories: string[] = [];
  
  // Game Recap
  if (text.includes('recap') || text.includes('victory') || text.includes('defeat') || 
      text.includes('win') || text.includes('beat') || text.includes('score')) {
    categories.push('Game Recap');
  }
  
  // Injuries
  if (text.includes('injury') || text.includes('injured') || text.includes('out for') || 
      text.includes('questionable') || text.includes('doubtful') || text.includes('ir')) {
    categories.push('Injuries');
  }
  
  // Trade Rumors
  if (text.includes('trade') || text.includes('deal') || text.includes('acquire') || 
      text.includes('sign') || text.includes('free agent') || text.includes('contract')) {
    categories.push('Trade Rumors');
  }
  
  // Playoffs
  if (text.includes('playoff') || text.includes('super bowl') || text.includes('postseason') || 
      text.includes('wild card') || text.includes('divisional') || text.includes('championship')) {
    categories.push('Playoffs');
  }
  
  // Analysis
  if (text.includes('analysis') || text.includes('preview') || text.includes('breakdown') || 
      text.includes('outlook') || text.includes('predict') || text.includes('ranking')) {
    categories.push('Analysis');
  }
  
  // Rookies
  if (text.includes('rookie') || text.includes('draft') || text.includes('first-year') || 
      text.includes('prospect') || text.includes('combine')) {
    categories.push('Rookies');
  }
  
  // Add ESPN categories as well
  espnCategories.forEach(cat => {
    if (!categories.includes(cat)) {
      categories.push(cat);
    }
  });
  
  // Default to NFL if no categories matched
  if (categories.length === 0) {
    categories.push('NFL');
  }
  
  return categories;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const { limit = '50' } = req.query;
    const response = await fetch(`${ESPN_NFL_NEWS}?limit=${limit}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'ESPN API error' });
    }
    
    const data = await response.json();
    
    // Transform ESPN news to our schema
    const news = (data.articles || []).map((article: any) => {
      const espnCats = article.categories?.map((c: any) => c.description).filter(Boolean) || [];
      const mappedCategories = mapToFilterCategory(
        article.headline || '',
        article.description || '',
        espnCats
      );
      
      return {
        id: String(article.dataSourceIdentifier || article.id || Math.random().toString(36)),
        headline: article.headline || '',
        description: article.description || '',
        story: article.story || '',
        published: article.published || new Date().toISOString(),
        author: article.byline || 'ESPN',
        source: 'ESPN',
        imageUrl: article.images?.[0]?.url || null,
        videoUrl: article.video?.source || null,
        categories: mappedCategories,
        teams: article.categories?.filter((c: any) => c.type === 'team').map((c: any) => c.description) || [],
        premium: article.premium || false,
        sentiment: 'neutral' as const,
      };
    });
    
    res.json(news);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
