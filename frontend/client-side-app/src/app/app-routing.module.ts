import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WebsiteFormComponent } from './website-form/website-form.component';
import { WebsitesComponent } from './websites/websites.component';
import { WebsiteDetailComponent } from './website-detail/website-detail.component';
import { EvaluationFormComponent } from './evaluation-form/evaluation-form.component';
import { SearchEvaluationComponent } from './search-evaluation/search-evaluation.component';
import { PageEvaluationComponent } from './page-evaluation/page-evaluation.component';

const routes: Routes = [
  { path: '', redirectTo: '/register-websites', pathMatch: 'full' },
  { path: 'register-websites', component: WebsiteFormComponent, data: { title: 'Register Websites' } },
  { path: 'websites', component: WebsitesComponent, data: { title: 'Websites' } },
  { path: 'website/:id', component: WebsiteDetailComponent, data: { title: 'Website Details' } },
  { path: 'new-evaluation', component: EvaluationFormComponent, data: { title: 'New Evaluation' } },
  { path: 'search-evaluation', component: SearchEvaluationComponent, data: { title: 'Search Page Evaluation' } },
  { path: 'evaluation/:id', component: PageEvaluationComponent, data: { title: 'Page Evaluation' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
