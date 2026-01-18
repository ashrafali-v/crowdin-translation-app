import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script to extract API content for translation files
 *
 * ⚠️  IMPORTANT: Only run this when API content has changed!
 *
 * This script will:
 * 1. Fetch articles from the RealWorld API
 * 2. Fetch comments for each article
 * 3. Generate translation keys for comments
 * 4. Create/update src/assets/i18n/en-US.json
 *
 * Usage:
 * 1. Run this script: npm run extract-api-content
 * 2. Review the generated en-US.json file
 * 3. Copy to pt-PT.json and translate, OR upload to Crowdin
 * 4. Upload to Crowdin: npm run crowdin:upload
 * 5. Translate in Crowdin dashboard
 * 6. Download translations: npm run crowdin:download
 */

interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: any;
}

interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: any;
}

// Fetch articles from API
async function fetchArticles(): Promise<Article[]> {
  console.log('📡 Fetching articles from API...');
  const response = await fetch('https://api.realworld.show/api/articles?limit=20');
  const data = (await response.json()) as { articles: Article[] };
  return data.articles || [];
}

// Fetch comments for an article
async function fetchComments(slug: string): Promise<Comment[]> {
  try {
    const response = await fetch(`https://api.realworld.show/api/articles/${slug}/comments`);
    const data = (await response.json()) as { comments: Comment[] };
    return data.comments || [];
  } catch (error) {
    console.log(`  ⚠️  No comments found for ${slug}`);
    return [];
  }
}

// Generate comment key (same as translation service)
function generateCommentKey(body: string): string {
  return body
    .substring(0, 50)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+$/, '');
}

// Create translation structure
async function createTranslationFile(articles: Article[]) {
  const translations: any = {
    api: {
      articles: {},
      tags: {},
      comments: {},
    },
    ui: {
      language: 'Language',
      selectLanguage: 'Select Language',
    },
  };

  // Extract article content
  for (const article of articles) {
    translations.api.articles[article.slug] = {
      title: article.title,
      description: article.description,
      body: article.body,
    };

    // Extract unique tags
    article.tagList?.forEach((tag: string) => {
      if (!translations.api.tags[tag]) {
        translations.api.tags[tag] = tag;
      }
    });

    // Fetch and add comments
    console.log(`💬 Fetching comments for: ${article.slug}`);
    const comments = await fetchComments(article.slug);
    if (comments.length > 0) {
      translations.api.comments[article.slug] = {};
      comments.forEach(comment => {
        const commentKey = generateCommentKey(comment.body);
        translations.api.comments[article.slug][commentKey] = comment.body;
      });
      console.log(`   ✅ Added ${comments.length} comment(s)`);
    } else {
      console.log(`   ℹ️  No comments`);
    }
  }

  return translations;
}

// Main function
async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌍 API Content Extraction for Translation');
    console.log('='.repeat(60));
    console.log('\n⚠️  WARNING: This will fetch content from the API and');
    console.log('   overwrite your existing en-US.json file!');
    console.log('\n📋 This script will:');
    console.log('   1. Fetch articles from RealWorld API');
    console.log('   2. Fetch comments for each article');
    console.log('   3. Generate translation keys');
    console.log('   4. Create/update src/assets/i18n/en-US.json');
    console.log('\n' + '='.repeat(60));
    console.log('\n🚀 Starting extraction...\n');

    // Fetch articles from API
    const articles = await fetchArticles();
    console.log(`\n✅ Fetched ${articles.length} articles\n`);

    // Create translation file with comments
    const translations = await createTranslationFile(articles);

    // Save to file
    const outputDir = path.join(__dirname, '../src/assets/i18n');
    const outputPath = path.join(outputDir, 'en-US.json');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if file exists and backup
    if (fs.existsSync(outputPath)) {
      const backupPath = path.join(outputDir, `en-US.backup.${Date.now()}.json`);
      fs.copyFileSync(outputPath, backupPath);
      console.log(`\n📦 Backed up existing file to: ${path.basename(backupPath)}`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ Translation file created successfully!');
    console.log('='.repeat(60));
    console.log(`\n📄 File: ${outputPath}`);
    console.log('\n📊 Extracted:');
    console.log(`   • ${Object.keys(translations.api.articles).length} articles`);
    console.log(`   • ${Object.keys(translations.api.tags).length} unique tags`);
    console.log(`   • ${Object.keys(translations.api.comments).length} articles with comments`);

    let totalComments = 0;
    Object.values(translations.api.comments).forEach((comments: any) => {
      totalComments += Object.keys(comments).length;
    });
    console.log(`   • ${totalComments} total comments`);

    console.log('\n📝 Next steps:');
    console.log('   1. Review the generated en-US.json file');
    console.log('   2. Manually translate to pt-PT.json OR use Crowdin:');
    console.log('      npm run crowdin:upload');
    console.log('      (translate in Crowdin dashboard)');
    console.log('      npm run crowdin:download');
    console.log('\n' + '='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error extracting API content:', error);
    process.exit(1);
  }
}

// Execute main function
void main();
