// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginComponent} from './pages/login/login.component';
import {MainComponent} from './pages/main/main.component';
import {MainModule} from './pages/main/main.module';
import {AuthGuard} from './shared/helpers';
import {HeaderComponent} from './shared/components/header/header.component';
import {SidebarComponent} from './shared/components/sidebar/sidebar.component';
import {FooterComponent} from './shared/components/footer/footer.component';
import {BreadcrumbsComponent} from './shared/components/breadcrumbs/breadcrumbs.component';
import {TimeoutModalsComponent} from './shared/components/modals/timeout-modals/timeout-modals.component';
import {PendingChangeComponent} from './shared/components/modals/pending-change/pending-change.component';
import {PendingChangesGuard} from './core/guards/canDeactivateGuard';
import {DataService} from './core/services/data.service';
import {Page404Component} from './pages/main/page404/page404.component';
import {ModalsModule} from 'src/app/shared/components/modals/modals.module';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {
    path: 'main',
    component: MainComponent,
    data: {
      reuse: true,
    },
    canActivate: [AuthGuard],
    loadChildren: () => MainModule,
    runGuardsAndResolvers: 'always',
  },
  {path: '**', component: LoginComponent},
  {path: '**', component: Page404Component},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      enableTracing: false,
      preloadingStrategy: PreloadAllModules,
      useHash: true,
      initialNavigation: 'enabledBlocking'
    }),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ModalsModule,
    NgOptimizedImage
  ],
  exports: [RouterModule],
  declarations: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    LoginComponent,
    MainComponent,
    BreadcrumbsComponent,
    TimeoutModalsComponent,
    PendingChangeComponent,
  ],
  providers: [PendingChangesGuard, DataService],
})
export class AppRoutingModule {
}
