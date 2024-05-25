import { Component, OnInit } from '@angular/core';
import { Website } from '../website';
import { WebsiteService } from '../website.service';
import { FormControl } from '@angular/forms';
import { PageService } from '../page.service';
import { Page } from '../page';
import { sleep } from '../util';
import { EvaluationService } from '../evaluation.service';
import { Evaluation } from '../evaluation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-evaluation-form',
  templateUrl: './evaluation-form.component.html',
  styleUrls: ['./evaluation-form.component.css']
})
export class EvaluationFormComponent implements OnInit {
  selectedWebsite: string = "";
  websites: Website[] = [];

  selectedPages: string[] = [];
  pages: Page[] = [];

  website: Website | undefined;

  evaluations: Evaluation[] = [];

  constructor(
    private websiteService: WebsiteService,
    private pageService: PageService,
    private evaluationService: EvaluationService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getWebsites();
  }

  getWebsites(): void {
    this.websiteService.getWebsites()
      .subscribe(websites => {
        this.websites = websites;
      });
  }

  getSelectedWebsite(): void {
    this.websiteService.getWebsiteFromURL(this.selectedWebsite)
      .subscribe(website => this.website = website);
  }

  getSelectedPages(): Page[] {
    let pages: Page[] = [];
    this.selectedPages.forEach(pageURL => {
      this.pageService.getPageFromURL(pageURL)
        .subscribe(result => pages.push(result));
    });
    return pages;
  }

  getPages(): void {
    this.pageService.getPagesFromWebsite(this.selectedWebsite)
      .subscribe(pages => this.pages = pages);
  }

  updateWebsite(): void {
    this.websiteService.updateWebsite(this.website!).subscribe();
  }

  updatePage(page: Page): void {
    this.pageService.updatePage(page).subscribe();
  }

  addEvaluation(): void {
    let websiteURL = this.website!.url;
    let pagesURLs = this.selectedPages;

    pagesURLs.forEach(pageURL => {
      this.evaluationService.addEvaluation({ websiteURL, pageURL } as Evaluation)
        .subscribe(result => this.evaluations.push(result));
    });
  }

  submitEvaluation(): void {
    
    const startEvaluationAsync = async () => {

      this._snackBar.open("Started evaluating pages...", "OK");
      
      let pages = this.getSelectedPages();
      this.getSelectedWebsite();
      await sleep(300);

      // --- update before evaluations ---
      // website
      this.website!.state = "Em avaliação";
      this.updateWebsite();
      // pages
      pages.forEach(page => {
        page.state = "Em avaliação";
        this.updatePage(page);
      });

      this.addEvaluation();
      while (this.evaluations.length !== pages.length)
        await sleep(1);

      
      const evaluationDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      // --- update after evaluations ---
      // website
      this.website!.lastEvaluationDate = evaluationDateTime;
      this.updateWebsite();

      // pages
      pages.forEach(page => {
        this.evaluations.forEach(evaluation => {
          if (evaluation === undefined) {
            page.state = 'Erro na avaliação';
          } else {
            this.website!.state = "Avaliado";
              
              if (evaluation.pageData.errorsA > 0 || evaluation.pageData.errorsAA > 0)
                page.state = 'Não conforme';
              else
                page.state = 'Conforme';
          }
          
        });
        page.lastEvaluationDate = evaluationDateTime;
        this.updatePage(page);
      });
      this.updateWebsite();
    }
    startEvaluationAsync();
  }

  resetSelectedPages(): void {
    if (this.selectedPages.length > 0) {
      this.selectedPages.some(pageURL => {
        if (!pageURL.includes(this.selectedWebsite))
          return true;
        else
          return false;
      });
      this.selectedPages = [];
    }
  }
}
