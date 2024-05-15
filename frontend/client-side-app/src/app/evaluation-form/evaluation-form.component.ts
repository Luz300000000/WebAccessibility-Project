import { Component, OnInit } from '@angular/core';
import { Website } from '../website';
import { WebsiteService } from '../website.service';
import { FormControl } from '@angular/forms';
import { PageService } from '../page.service';
import { Page } from '../page';
import { sleep } from '../util';
import { EvaluationService } from '../evaluation.service';
import { Evaluation } from '../evaluation';

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
    private evaluationService: EvaluationService
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
      
      let pages = this.getSelectedPages();
      this.getSelectedWebsite();
      await sleep(200);

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
      this.website!.state = "Avaliado";
      this.updateWebsite();
      // pages
      console.log(this.evaluations);
      pages.forEach(page => {
        page.lastEvaluationDate = evaluationDateTime;
          this.evaluations.forEach(evaluation => {
            if (evaluation.pageURL === page.url) {
              if (evaluation.pageData.errorsAAA > 0)
                page.state = 'Não conforme';
              else
                page.state = 'Conforme';
            }
          });
        this.updatePage(page);
      });
    }
    startEvaluationAsync();
  }
}
