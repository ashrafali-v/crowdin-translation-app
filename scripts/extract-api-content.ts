import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script to create base translation files for Crowdin
 *
 * Usage:
 * 1. Add your article slugs and content to the articles array below
 * 2. Add comments for each article slug
 * 3. Run this script: npm run extract-api-content
 * 4. Upload to Crowdin: npm run crowdin:upload
 * 5. Translate in Crowdin
 * 6. Download translations: npm run crowdin:download
 *
 * Note: When you have actual API responses, add them to the articles array
 * For comments: Use generic comment IDs (comment-1, comment-2, etc.) since
 * actual comment IDs from API are dynamic. Translation will fall back to
 * original text if no translation exists.
 */

interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

// Add your article content here
// You can copy this from your actual API responses when they're available
const articles: Article[] = [
  {
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: 'It takes a Jacobian',
    tagList: ['dragons', 'training'],
  },
  {
    slug: 'introduction-to-angular',
    title: 'Introduction to Angular',
    description: 'Learn Angular basics',
    body: 'Angular is a platform and framework for building single-page client applications using HTML and TypeScript.',
    tagList: ['angular', 'javascript', 'typescript'],
  },
  // Add more articles here as needed
];

// Create translation structure
function createTranslationFile(articles: Article[]) {
  const translations: any = {
    api: {
      articles: {},
      tags: {},
    },
    ui: {
      language: 'Language',
      selectLanguage: 'Select Language',
    },
  };

  // Extract article content
  articles.forEach(article => {
    translations.api.articles[article.slug] = {
      title: article.title,
      description: article.description,
      body: article.body,
    };

    // Extract unique tags
    article.tagList?.forEach(tag => {
      if (!translations.api.tags[tag]) {
        translations.api.tags[tag] = tag;
      }
    });
  });

  return translations;
}

// Main function
async function main() {
  try {
    console.log('Creating translation file from articles...');
    console.log(`Processing ${articles.length} articles`);

    // Create translation file
    const translations = createTranslationFile(articles);

    // Save to file
    const outputDir = path.join(__dirname, '../src/assets/i18n');
    const outputPath = path.join(outputDir, 'en-US.json');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2));

    console.log(`✅ Translation file created: ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Review the generated translation file');
    console.log('2. Upload to Crowdin: npm run crowdin:upload');
    console.log('3. Once translated, download: npm run crowdin:download');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
