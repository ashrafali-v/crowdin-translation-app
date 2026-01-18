import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { ArticlesService } from '../services/articles.service';
import { ArticleListConfig } from '../models/article-list-config.model';
import { Article } from '../models/article.model';
import { ArticlePreviewComponent } from './article-preview.component';
import { NgClass } from '@angular/common';
import { LoadingState } from '../../../core/models/loading-state.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-article-list',
  template: `
    @if (loading === LoadingState.LOADING) {
      <div class="article-preview">Loading articles...</div>
    }

    @if (loading === LoadingState.LOADED) {
      @for (article of results; track article.slug) {
        <app-article-preview [article]="article" />
      } @empty {
        <div class="article-preview">No articles are here... yet.</div>
      }

      <nav>
        <ul class="pagination">
          @for (pageNumber of totalPages; track pageNumber) {
            <li class="page-item" [ngClass]="{ active: pageNumber === currentPage }">
              <button class="page-link" (click)="setPageTo(pageNumber)">
                {{ pageNumber }}
              </button>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  imports: [ArticlePreviewComponent, NgClass],
  styles: `
    .page-link {
      cursor: pointer;
    }
  `,
})
export class ArticleListComponent implements OnInit {
  query!: ArticleListConfig;
  results: Article[] = [];
  currentPage = 1;
  totalPages: Array<number> = [];
  loading = LoadingState.NOT_LOADED;
  LoadingState = LoadingState;
  destroyRef = inject(DestroyRef);
  private originalResults: Article[] = [];

  @Input() limit!: number;
  @Input()
  set config(config: ArticleListConfig) {
    if (config) {
      this.query = config;
      this.currentPage = 1;
      this.runQuery();
    }
  }

  constructor(
    private articlesService: ArticlesService,
    private translationService: TranslationService,
  ) {}

  ngOnInit() {
    // Listen for locale changes and re-translate articles
    this.translationService.localeChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.originalResults.length > 0) {
        // Create a new array reference to trigger change detection
        this.results = [...this.translationService.translateArticles(this.originalResults)];
      }
    });
  }

  setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.runQuery();
  }

  runQuery() {
    this.loading = LoadingState.LOADING;
    this.results = [];

    // Create limit and offset filter (if necessary)
    if (this.limit) {
      this.query.filters.limit = this.limit;
      this.query.filters.offset = this.limit * (this.currentPage - 1);
    }

    this.articlesService
      .query(this.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.loading = LoadingState.LOADED;
        // Store original untranslated results
        this.originalResults = data.articles;
        // Translate and display with new array reference
        this.results = [...this.translationService.translateArticles(data.articles)];

        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(data.articlesCount / this.limit)), (val, index) => index + 1);
      });
  }
}
