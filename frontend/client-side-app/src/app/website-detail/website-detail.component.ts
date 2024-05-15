import { Component, OnInit, ViewChild } from '@angular/core';
import { Website } from '../website';
import { Page } from '../page';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsiteService } from '../website.service';
import { PageService } from '../page.service';
import { Location } from '@angular/common';
import { MatSort, Sort } from '@angular/material/sort';
import { FormControl, Validators } from '@angular/forms';
import urlRegexSafe from 'url-regex-safe';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { sanitizeURL, sleep } from '../util';
import { Evaluation } from '../evaluation';
import { EvaluationService } from '../evaluation.service';

@Component({
  selector: 'app-website-detail',
  templateUrl: './website-detail.component.html',
  styleUrls: ['./website-detail.component.css']
})
export class WebsiteDetailComponent implements OnInit {

  website: Website | undefined;
  pages: Page[] = [];
  
  urlRegex = urlRegexSafe( {returnString: true} );
  pageFormControl = new FormControl('', Validators.pattern(this.urlRegex));

  selection = new SelectionModel<Page>(true, []);
  displayedColumns: string[] = ['select', 'url', 'createdDate', 'lastEvaluationDate', 'state'];

  websiteData: any;

  @ViewChild(MatSort) sort: MatSort = new MatSort;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private websiteService: WebsiteService,
    private pageService: PageService,
    private evaluationService: EvaluationService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const addWebsiteAsync = async () => {
      this.getWebsite();
      await sleep(200);
      this.getPages();
      await sleep(200);
      this.getWebsiteData();
      await sleep(200);
    };
    
    addWebsiteAsync();
  }

  onSubmit(): void {

    let pageURL = sanitizeURL(this.pageFormControl.value!);

    if (this.pageFormControl.valid
        && pageURL.startsWith(this.website!.url + "/")) {

          console.log("Added page:", pageURL);
          this._snackBar.open("Page added successfully.", "OK");
          this.pageFormControl.reset();

          let createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
          let state = "não conforme";

          if (this.website)
            this.addPage(pageURL, this.website.url, createdDate);

          const addPagesAsync = async () => {
            await sleep(200);
            this.getPages();
          }
          addPagesAsync();
    } else {
        this._snackBar.open("Page couldn't be added.", "OK");
    }
  }
  
  getPages(): void {
    this.pageService.getPagesFromWebsite(this.website?.url)
      .subscribe(pages => this.pages = pages);
  }

  addPage(url: String, websiteURL: String, createdDate: String): void {
    if (!url || !websiteURL)
      return;
    else
      this.pageService.addPage({ url, websiteURL, createdDate, state:'Por avaliar'} as Page)
        .subscribe(page => {this.pages.push(page)});
  }

  deletePage(id: string): void {
    this.pageService.deletePage(id).subscribe();
  }

  getWebsite(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.websiteService.getWebsite(id)
      .subscribe(website => this.website = website);
  }

  deleteWebsite(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.websiteService.deleteWebsite(id).subscribe();
  }

  getWebsiteData(): void {
    this.evaluationService.getWebsiteEvaluationsData(this.website?.url)
      .subscribe(websiteData => this.websiteData = websiteData);
  }

  deleteEvaluation(pageURL: string): void {
    let pageEvaluation: Evaluation | undefined;

    const deleteEvaluationAsync = async () => {

      this.evaluationService.getEvaluationFromPage(pageURL)
        .subscribe(evaluation => pageEvaluation = evaluation);

      await sleep(200);

      if (pageEvaluation !== undefined) {
        this.evaluationService.deleteEvaluation(pageEvaluation._id).subscribe();
        await sleep(200);
        this.getWebsiteData();
      }
    }
    deleteEvaluationAsync();
  }

  goBack(): void {
    this.location.back();
  }

  sortData(sort: Sort): void {
    const data = this.pages.slice();
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.pages = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'createdDate':
          return compare(a.createdDate, b.createdDate, isAsc);
        case 'lastEvaluationDate':
          return compare(a.lastEvaluationDate, b.lastEvaluationDate, isAsc);
        default:
          return 0;
      }
    });

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  }

  confirmDelete(enterAnimationDuration: string, exitAnimationDuration: string): void {
    if (this.website !== undefined) {
      
      if (this.pages.length > 0) { // If the website has pages, confirmation is required
        this.dialog.open(ConfirmDeleteDialogComponent, {
          width: '250px',
          enterAnimationDuration,
          exitAnimationDuration,
          data: {website: this.website, pages: this.pages}
        });
      
      } else { // If the website has no pages, delete the website right away

          const deleteWebsiteAsync = async () => {
            this.deleteWebsite();
            sleep(200);
          };

          deleteWebsiteAsync();
          this._snackBar.open("Website deleted successfully.", "OK");
          this.router.navigate(['/websites']);
      }
    }
  }

   // --------- FOR CHECKBOX SELECTION ---------
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.pages.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.pages);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Page): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  //** Delete selected pages from the website */
  deleteSelectedPages(): void {
    let selectedPages: Page[] = this.selection.selected;
    selectedPages.forEach(page => {
        this.deletePage(page._id);
        this.deleteEvaluation(page.url);
    });

    this._snackBar.open(`${selectedPages.length} page(s) were deleted.`, "OK");

    // Update the pages array reference (dataSource of the table)
    this.pages = this.pages.filter(page => !this.selection.isSelected(page));
    this.selection.clear();
  }
}
