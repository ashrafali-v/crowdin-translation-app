import { Component, inject } from '@angular/core';
import { UserService } from '../auth/services/user.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { IfAuthenticatedDirective } from '../auth/if-authenticated.directive';
import { LanguageSwitcherComponent } from './language-switcher.component';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  imports: [RouterLinkActive, RouterLink, AsyncPipe, IfAuthenticatedDirective, LanguageSwitcherComponent],
})
export class HeaderComponent {
  currentUser$ = inject(UserService).currentUser;
}
