# Crowdin Setup Guide for Angular Application

## Overview

This project is configured to use Crowdin for AI-powered localization and translation management.

## Prerequisites

1. Create a Crowdin account at https://crowdin.com
2. Create a new project in Crowdin
3. Generate a Personal Access Token from https://crowdin.com/settings#api-key

## Setup Instructions

### 1. Configure Crowdin

Edit `crowdin.yml` and update:

- `project_id`: Your Crowdin project ID (found in Project Settings > API)
- Set environment variable: `export CROWDIN_PERSONAL_TOKEN=your_token_here`

### 2. Set Target Languages

In `crowdin.yml`, uncomment and modify the languages section:

```yaml
languages:
  - es # Spanish
  - fr # French
  - de # German
  - ja # Japanese
  - zh-CN # Chinese Simplified
  # Add more as needed
```

### 3. Extract Translatable Content

Run this command to extract all i18n strings from your Angular app:

```bash
npm run i18n:extract
```

This creates `src/locale/messages.xlf` containing all translatable strings.

### 4. Upload Source Files to Crowdin

```bash
npm run crowdin:upload
```

This uploads the source translation file to Crowdin.

### 5. Use Crowdin AI Translation

In your Crowdin project dashboard:

1. Go to **Settings > Integrations**
2. Enable **AI Translator** (powered by ChatGPT or other AI providers)
3. Configure translation settings and quality preferences
4. AI will automatically pre-translate your content

### 6. Download Translated Files

After translations are complete (or AI pre-translation is done):

```bash
npm run crowdin:download
```

This downloads translated files to `src/locale/messages.{locale}.xlf`

### 7. Build Localized Versions

Build your app with localization:

```bash
ng build
```

This creates separate builds for each configured language in `dist/angular-conduit/{locale}/`

## Available Commands

| Command                    | Description                                   |
| -------------------------- | --------------------------------------------- |
| `npm run i18n:extract`     | Extract translatable strings from source code |
| `npm run crowdin:upload`   | Upload source files to Crowdin                |
| `npm run crowdin:download` | Download translations from Crowdin            |
| `npm run crowdin:sync`     | Extract, upload, and download in one command  |

## Adding Translations to Your Code

### In Templates (HTML):

```html
<!-- Simple text -->
<h1 i18n>Welcome to RealWorld</h1>

<!-- With description and ID -->
<p i18n="User greeting|A welcome message@@welcomeMessage">Hello, {{username}}!</p>

<!-- Attributes -->
<img [src]="logo" i18n-alt alt="Application logo" />
```

### In TypeScript:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `<h1>{{ title }}</h1>`,
})
export class ExampleComponent {
  title = $localize`:Site title:Welcome to our site`;
}
```

## Crowdin AI Features

Crowdin AI Localization offers:

- **AI Pre-translation**: Automatically translate content using AI
- **Context-aware translations**: Better quality with AI understanding context
- **Consistency**: Maintains terminology across translations
- **Speed**: Fast translation of large volumes
- **Quality scoring**: AI evaluates translation quality

## Workflow

1. Developers mark strings for translation using i18n
2. Run `npm run i18n:extract` to extract strings
3. Upload to Crowdin: `npm run crowdin:upload`
4. Crowdin AI translates content automatically
5. Reviewers can refine translations in Crowdin dashboard
6. Download translations: `npm run crowdin:download`
7. Build localized app: `ng build`

## Language Configuration

### Supported Language Codes

Common codes you can add to `crowdin.yml`:

- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese (Portugal)
- `pt-BR` - Portuguese (Brazil)
- `ru` - Russian
- `ja` - Japanese
- `zh-CN` - Chinese Simplified
- `zh-TW` - Chinese Traditional
- `ko` - Korean
- `ar` - Arabic
- `nl` - Dutch
- `pl` - Polish
- `tr` - Turkish
- `sv` - Swedish
- `da` - Danish
- `no` - Norwegian
- `fi` - Finnish
- `cs` - Czech
- `el` - Greek
- `he` - Hebrew
- `hi` - Hindi
- `id` - Indonesian
- `th` - Thai
- `vi` - Vietnamese

## Resources

- Crowdin Documentation: https://support.crowdin.com
- Crowdin AI: https://crowdin.com/ai-localization
- Angular i18n Guide: https://angular.dev/guide/i18n
- API Documentation: https://support.crowdin.com/api/v2/

## Troubleshooting

### Authentication Issues

Make sure your `CROWDIN_PERSONAL_TOKEN` environment variable is set:

```bash
export CROWDIN_PERSONAL_TOKEN=your_token_here
```

### Missing Translations

Ensure you've run `npm run crowdin:download` after translations are added in Crowdin.

### Build Errors

Check that all locale files exist in `src/locale/` directory before building.
