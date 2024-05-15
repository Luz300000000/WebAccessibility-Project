import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsiteService } from '../website.service';
import { PageService } from '../page.service';
import { Page } from '../page';
import { Website } from '../website';
import { Router } from '@angular/router';
import { sleep } from '../util';
import { EvaluationService } from '../evaluation.service';
import { Evaluation } from '../evaluation';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css']
})
export class ConfirmDeleteDialogComponent {

  constructor (
    private _snackBar: MatSnackBar,
    private router: Router,
    private websiteService: WebsiteService,
    private pageService: PageService,
    private evaluationService: EvaluationService,
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { website: Website, pages: Page[] }
  ) {}

  confirmDeleteNotif() {
    this.data.pages.forEach((page: Page) => {
      this.deletePage(page._id);
      this.deleteEvaluation(page.url);
    });

    const deleteWebsiteAsync = async () => {
      this.deleteWebsite(this.data.website._id);
      sleep(200);
    };

    deleteWebsiteAsync();
    this._snackBar.open("Website and pages deleted successfully.", "OK");
    this.router.navigate(['/websites']);
  }

  deletePage(id: string): void {
    this.pageService.deletePage(id).subscribe();
  }

  deleteEvaluation(pageURL: string): void {
    let pageEvaluation: Evaluation | undefined;

    const deleteEvaluationAsync = async () => {

      this.evaluationService.getEvaluationFromPage(pageURL)
        .subscribe(evaluation => pageEvaluation = evaluation);

      await sleep(200);
      console.log(pageEvaluation);

      if (pageEvaluation !== undefined) {
        this.evaluationService.deleteEvaluation(pageEvaluation._id)
          .subscribe();
      }
    }

    deleteEvaluationAsync();
  }

  deleteWebsite(id: string): void {
    this.websiteService.deleteWebsite(id).subscribe();
  }
}
