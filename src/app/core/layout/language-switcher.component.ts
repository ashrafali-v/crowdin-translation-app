import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button
        class="btn btn-sm btn-outline-secondary dropdown-toggle"
        type="button"
        (click)="toggleDropdown($event)"
        [attr.aria-expanded]="isOpen"
      >
        {{ getCurrentLanguageName() }}
      </button>
      <div class="dropdown-menu" [class.show]="isOpen">
        @for (lang of translationService.availableLanguages; track lang.code) {
          <button
            class="dropdown-item"
            type="button"
            [class.active]="lang.code === translationService.getCurrentLocale()"
            (click)="selectLanguage(lang.code, $event)"
          >
            {{ lang.name }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .language-switcher {
        position: relative;
        display: inline-block;
      }

      .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1000;
        display: none;
        min-width: 160px;
        padding: 0.5rem 0;
        margin: 0.125rem 0 0;
        font-size: 0.875rem;
        color: #212529;
        text-align: left;
        list-style: none;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 0.25rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
      }

      .dropdown-menu.show {
        display: block;
      }

      .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.25rem 1rem;
        clear: both;
        font-weight: 400;
        color: #212529;
        text-align: inherit;
        white-space: nowrap;
        background-color: transparent;
        border: 0;
        cursor: pointer;
      }

      .dropdown-item:hover,
      .dropdown-item:focus {
        color: #16181b;
        text-decoration: none;
        background-color: #f8f9fa;
      }

      .dropdown-item.active {
        color: #fff;
        text-decoration: none;
        background-color: #5cb85c;
      }

      .dropdown-toggle::after {
        display: inline-block;
        margin-left: 0.255em;
        vertical-align: 0.255em;
        content: '';
        border-top: 0.3em solid;
        border-right: 0.3em solid transparent;
        border-bottom: 0;
        border-left: 0.3em solid transparent;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  isOpen = false;

  constructor(public translationService: TranslationService) {}

  toggleDropdown(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.isOpen = !this.isOpen;
  }

  selectLanguage(locale: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.translationService.setLocale(locale);
    this.isOpen = false;
  }

  getCurrentLanguageName(): string {
    const currentLocale = this.translationService.getCurrentLocale();
    const lang = this.translationService.availableLanguages.find(l => l.code === currentLocale);
    return lang?.name || 'Language';
  }
}
