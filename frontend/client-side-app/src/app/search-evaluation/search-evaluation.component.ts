import { Component, OnInit } from '@angular/core';
import { Page } from '../page';
import { Evaluation } from '../evaluation';
import { PageService } from '../page.service';
import { EvaluationService } from '../evaluation.service';
import { WebsiteService } from '../website.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Website } from '../website';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-evaluation',
  templateUrl: './search-evaluation.component.html',
  styleUrls: ['./search-evaluation.component.css']
})
export class SearchEvaluationComponent implements OnInit {
  selectedWebsite: string = "";
  websites: Website[] = [];

  selectedPage: string = "";
  pages: Page[] = [];

  constructor(
    private websiteService: WebsiteService,
    private pageService: PageService,
    private evaluationService: EvaluationService,
    private _snackBar: MatSnackBar,
    private router: Router
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

  getPages(): void {
    this.pageService.getPagesFromWebsite(this.selectedWebsite)
      .subscribe(pages => this.pages = pages);
  }

  searchEvaluation(): void {
    this.evaluationService.getEvaluationFromPage(this.selectedPage)
      .subscribe(evaluation => {
        if (evaluation) {
          this.router.navigate([`/evaluation/${evaluation._id}`]);
        } else {
          this._snackBar.open("This page haven't been evaluated yet.", "OK");
          this.selectedPage = "";
          this.selectedWebsite = "";
        }
      });
  }

  resetSelectedPage(): void {
    if (this.selectedPage !== "" && !this.selectedPage.includes(this.selectedWebsite)) {
      this.selectedPage = "";
    }
  }
}
