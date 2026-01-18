# API Response Translation System

This guide documents how API responses (articles, tags, and comments) are translated in this Angular RealWorld application using Crowdin.

## 🎯 What We Achieved

A runtime translation system that:

- ✅ Translates API articles (title, description, body)
- ✅ Translates article tags
- ✅ Translates article comments
- ✅ Provides language switcher in the header
- ✅ Instantly updates UI when language changes
- ✅ Caches translations for performance
- ✅ Currently supports English and Portuguese

## 🏗️ Architecture Overview

### Core Components

**1. TranslationService** (`src/app/core/services/translation.service.ts`)

- Loads translation JSON files from `/assets/i18n/`
- Provides reactive `localeChange$` observable
- Translates articles, tags, and comments
- Caches translations per locale

**2. Language Switcher** (`src/app/core/layout/language-switcher.component.ts`)

- Dropdown UI in the header
- Triggers `TranslationService.setLocale()` on selection

**3. API Interceptor** (`src/app/core/interceptors/api.interceptor.ts`)

- Prepends API base URL to requests
- **Skips `/assets/` requests** to allow translation files to load

**4. Components with Translation**

- `ArticleListComponent` - Translates article lists on home page
- `ArticleComponent` - Translates article detail pages and comments

## 🚀 Quick Start

```bash
npm start
```

Navigate to `http://localhost:4200` and use the language dropdown in the header to switch between English and Português. All articles, tags, and comments translate instantly!

## 📝 Translation File Structure

```json
{
  "api": {
    "articles": {
      "article-slug-from-api": {
        "title": "Translated Title",
        "description": "Translated Description",
        "body": "Translated Body..."
      }
    },
    "tags": {
      "javascript": "JavaScript",
      "react": "React"
    },
    "comments": {
      "article-slug-from-api": {
        "comment-body-key-first-50-chars": "Translated Comment"
      }
    }
  },
  "ui": {
    "language": "Language",
    "selectLanguage": "Select Language"
  }
}
```

### Key Generation Rules

**Articles:** Uses the article `slug` from API

```
Key: api.articles.{slug}.title
Example: api.articles.how-to-learn-javascript-efficiently.title
```

**Tags:** Uses the tag name from API

```
Key: api.tags.{tagName}
Example: api.tags.javascript
```

**Comments:** Uses first 50 characters of comment body (lowercase, alphanumeric + hyphens)

```
Key: api.comments.{articleSlug}.{bodyKey}
Example: api.comments.react-hooks-best-practices.useeffect-dependencies-caught-me-so-many-times-whe
```

**Comment Key Generation Logic:**

```typescript
const bodyKey = comment.body
  .substring(0, 50)
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '-')
  .replace(/-+$/, '');
```

## 🔄 How Translation Works

### 1. Language Switch Flow

```
User selects language
  ↓
TranslationService.setLocale('pt-PT')
  ↓
Load /assets/i18n/pt-PT.json (or from cache)
  ↓
Update translations signal
  ↓
Emit localeChange$ event
  ↓
Components subscribe and re-translate
  ↓
UI updates immediately
```

### 2. Article List Translation

```typescript
// ArticleListComponent stores original API data
this.originalResults = articles;

// Translates on initial load
this.results = this.translationService.translateArticles(articles);

// Re-translates when locale changes
this.translationService.localeChange$.subscribe(() => {
  this.results = [...this.translationService.translateArticles(this.originalResults)];
});
```

### 3. Article Detail + Comments Translation

```typescript
// ArticleComponent stores original data
this.originalArticle = article;
this.originalComments = comments;

// Translates on load
this.article = this.translationService.translateArticle(article);
this.comments = this.translationService.translateComments(comments, slug);

// Re-translates when locale changes
this.translationService.localeChange$.subscribe(() => {
  this.article = this.translationService.translateArticle(this.originalArticle);
  this.comments = [...this.translationService.translateComments(this.originalComments, slug)];
});
```

## 🛠️ Workflow for Managing Translations

### Step 1: Extract API Content

Run the extraction script to generate English translation file from API:

```bash
npm run extract-api-content
```

This creates/updates `src/assets/i18n/en-US.json`.

### Step 2: Manually Create Target Language Files

Copy `en-US.json` to `pt-PT.json` and translate the values:

```bash
cp src/assets/i18n/en-US.json src/assets/i18n/pt-PT.json
```

Edit `pt-PT.json` to add Portuguese translations.

### Step 3: Test Locally

```bash
npm start
```

Use the language dropdown to verify translations work correctly.

### Step 4: Upload to Crowdin (Optional)

For team translation workflow:

```bash
npm run crowdin:upload
```

### Step 5: Download from Crowdin (Optional)

After translators complete work:

```bash
npm run crowdin:download
```

## 🌍 Adding New Languages

### 1. Add to TranslationService

Edit `src/app/core/services/translation.service.ts`:

```typescript
readonly availableLanguages = [
  { code: 'en-US', name: 'English' },
  { code: 'pt-PT', name: 'Português' },
  { code: 'es-ES', name: 'Español' },  // Add new language
];
```

### 2. Create Translation File

Create `src/assets/i18n/es-ES.json` with the same structure as `en-US.json`.

### 3. Test

The new language will automatically appear in the dropdown!

## 📦 NPM Scripts

| Command                       | Description                            |
| ----------------------------- | -------------------------------------- |
| `npm run extract-api-content` | Generate en-US.json from API responses |
| `npm run crowdin:upload`      | Upload source files to Crowdin         |
| `npm run crowdin:download`    | Download translations from Crowdin     |
| `npm run translate:update`    | Extract + Upload in one command        |

## 🐛 Troubleshooting

### Articles Not Translating

**Issue:** Only some articles translate or none translate.

**Solution:** Verify article slugs in translation files match API exactly.

- Check browser console for actual API slugs
- Compare with keys in `en-US.json` and `pt-PT.json`
- Article slug format: `how-to-learn-javascript-efficiently`

### Comments Not Translating

**Issue:** Comments show in English even after switching language.

**Solution:** Comment keys must match the generated key from first 50 characters.

- Use the test script: `node scripts/test-comment-keys.js`
- This shows exact keys generated from comment text
- Update translation files with matching keys

Example:

```javascript
// Comment: "useEffect dependencies caught me so many times when I was learning React. Wish I had read this earlier!"
// Generated key: "useeffect-dependencies-caught-me-so-many-times-whe"
```

### Translation Files Not Loading (404 Error)

**Issue:** Browser console shows 404 errors for translation files.

**Solution:**

1. Verify files exist in `src/assets/i18n/`
2. Check file names match locale codes exactly: `pt-PT.json` (not `pt.json`)
3. Ensure API interceptor skips `/assets/` requests

### Language Switcher Not Visible

**Issue:** No language dropdown in header.

**Solution:**

1. Check `LanguageSwitcherComponent` is imported in `HeaderComponent`
2. Verify `<app-language-switcher>` is in header template

## 💡 Best Practices

1. **Always use exact API slugs** - This is the most common source of errors
2. **Test comment keys** - Use the test script to verify key generation
3. **Keep original data** - Store untranslated API responses for re-translation
4. **Create new arrays** - Use spread operator `[...array]` to trigger change detection
5. **Cache translations** - TranslationService automatically caches per locale

## 🔍 Key Technical Decisions

### Why Body-Based Keys for Comments?

Comments don't have stable IDs across environments. Using the first 50 characters of comment body as a key creates a deterministic identifier that works across API instances.

### Why Store Original API Data?

When users switch languages, we need the original English text to generate proper translation keys. Storing original data allows instant re-translation without API calls.

### Why Skip Assets in Interceptor?

The API interceptor prepends the API base URL to all requests. Translation files are served from `/assets/` and should not be intercepted, or they would return 404.

### Why Use Signals and Observables?

- **Signals:** Efficient reactive state management for translations
- **Observables:** Notify components when locale changes
- **Combination:** Provides both reactive data and event notifications

## 📁 File Reference

**Translation Files:**

- `src/assets/i18n/en-US.json` - English (source)
- `src/assets/i18n/pt-PT.json` - Portuguese

**Core Services:**

- `src/app/core/services/translation.service.ts` - Main translation logic
- `src/app/core/interceptors/api.interceptor.ts` - HTTP interceptor

**UI Components:**

- `src/app/core/layout/language-switcher.component.ts` - Dropdown
- `src/app/core/layout/header.component.ts` - Header with switcher

**Feature Components:**

- `src/app/features/article/components/article-list.component.ts` - Article lists
- `src/app/features/article/pages/article/article.component.ts` - Article detail

**Scripts:**

- `scripts/extract-api-content.ts` - Generate translation files
- `scripts/test-comment-keys.js` - Test comment key generation

**Configuration:**

- `crowdin.yml` - Crowdin integration config

---

**Last Updated:** January 18, 2026
