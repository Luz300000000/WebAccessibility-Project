import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// App Components
import { WebsiteFormComponent } from './website-form/website-form.component';
import { WebsitesComponent } from './websites/websites.component';
import { NavigationComponent } from './navigation/navigation.component';
import { WebsiteDetailComponent } from './website-detail/website-detail.component';

// Google Material Components
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { EvaluationFormComponent } from './evaluation-form/evaluation-form.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatExpansionModule } from '@angular/material/expansion';
import { SearchEvaluationComponent } from './search-evaluation/search-evaluation.component';
import { PageEvaluationComponent } from './page-evaluation/page-evaluation.component';
import { DetailedTestDialogComponent } from './detailed-test-dialog/detailed-test-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    WebsiteFormComponent,
    WebsitesComponent,
    NavigationComponent,
    WebsiteDetailComponent,
    ConfirmDeleteDialogComponent,
    EvaluationFormComponent,
    SearchEvaluationComponent,
    PageEvaluationComponent,
    DetailedTestDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    HttpClientModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatSortModule,
    MatTabsModule,
    MatStepperModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    CdkAccordionModule,
    MatExpansionModule
    
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
