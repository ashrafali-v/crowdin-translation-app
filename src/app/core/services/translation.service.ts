import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations = signal<Record<string, any>>({});
  private currentLocale = signal<string>('en-US');
  private cache = new Map<string, Observable<any>>();

  // Observable to notify when locale changes
  private localeChanged$ = new BehaviorSubject<string>('en-US');
  public localeChange$ = this.localeChanged$.asObservable();

  // Available languages
  readonly availableLanguages = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'pt-PT', name: 'Português' },
    { code: 'ml-IN', name: 'മലയാളം' },
  ];

  constructor(private http: HttpClient) {
    // Load default locale
    this.loadTranslations('en-US');
  }

  getCurrentLocale(): string {
    return this.currentLocale();
  }

  setLocale(locale: string) {
    this.currentLocale.set(locale);
    this.loadTranslations(locale).then(() => {
      // Emit locale change event AFTER translations are loaded
      this.localeChanged$.next(locale);
    });
  }

  private loadTranslations(locale: string): Promise<void> {
    return new Promise(resolve => {
      const cacheKey = locale;

      if (!this.cache.has(cacheKey)) {
        const translation$ = this.http.get<any>(`/assets/i18n/${locale}.json`).pipe(
          tap(data => this.translations.set(data)),
          shareReplay(1),
        );

        this.cache.set(cacheKey, translation$);
      }

      // Always update translations signal, even from cache
      this.cache.get(cacheKey)?.subscribe({
        next: data => {
          this.translations.set(data);
          resolve();
        },
        error: () => resolve(), // Resolve even on error to prevent hanging
      });
    });
  }

  get(key: string, defaultValue?: string): string {
    const keys = key.split('.');
    let value: any = this.translations();

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return value ?? defaultValue ?? key;
  }

  translateArticle(article: any): any {
    if (!article) return article;

    const slug = article.slug;

    return {
      ...article,
      title: this.get(`api.articles.${slug}.title`, article.title),
      description: this.get(`api.articles.${slug}.description`, article.description),
      body: this.get(`api.articles.${slug}.body`, article.body),
      tagList: article.tagList?.map((tag: string) => this.get(`api.tags.${tag}`, tag)),
    };
  }

  translateArticles(articles: any[]): any[] {
    return articles?.map(article => this.translateArticle(article)) || [];
  }

  translateComment(comment: any, articleSlug: string): any {
    if (!comment) return comment;

    // Create a simple key from the comment body (first 50 chars, lowercase, no special chars)
    const bodyKey = comment.body
      .substring(0, 50)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+$/, '');
    const translatedBody = this.get(`api.comments.${articleSlug}.${bodyKey}`, comment.body);

    return {
      ...comment,
      body: translatedBody,
    };
  }

  translateComments(comments: any[], articleSlug: string): any[] {
    return comments?.map(comment => this.translateComment(comment, articleSlug)) || [];
  }
}
