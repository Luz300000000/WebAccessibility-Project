import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { EvaluationService } from '../evaluation.service';
import { Evaluation } from '../evaluation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTestDialogComponent } from '../detailed-test-dialog/detailed-test-dialog.component';


@Component({
  selector: 'app-page-evaluation',
  templateUrl: './page-evaluation.component.html',
  styleUrls: ['./page-evaluation.component.css']
})
export class PageEvaluationComponent implements OnInit {

  evaluation: Evaluation | undefined;

  stats: any;

  tests: any;
  filteredTests: any;
  typeFilter: string = "";
  resultFilter: string = "";
  levelFilter: string = "";

  displayedColumns: string[] = ['code', 'type', 'result', 'levels'];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private evaluationService: EvaluationService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
    
  ) { }

  ngOnInit(): void {
    this.getEvaluation();
  }

  getEvaluation(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.evaluationService.getEvaluation(id)
      .subscribe(evaluation => {
        this.evaluation = evaluation;
        this.stats = evaluation.pageData["metadata_stats"];
        console.log(this.stats);
        this.tests = evaluation.pageData["detailed_tests"];
        this.applyTypeFilter();
      });
  }

  openDetailedTest(testData: any): void {
    console.log(testData);

    if (testData.detailed_results.length === 0)
      this._snackBar.open("The result of this test is inapplicable.", "OK");
    else {
      this.dialog.open(DetailedTestDialogComponent, {
        width: '50em',
        height: '30em',
        data: testData
      });
    }
  }

  getUniqueLevels(levels: string[]): string | string[] {
    if (levels.length === 0) {
      return 'None';
    } else {
      const uniqueLevels = Array.from(new Set(levels));
      return uniqueLevels.length > 1 ? uniqueLevels : uniqueLevels[0];
    }
  }

  applyTypeFilter(): void {
    this.filteredTests = this.tests.filter((
      test: { type: string; }) => {
        return !this.typeFilter || test.type === this.typeFilter
    });
  
    // Apply other filters if they are not empty
    if (this.resultFilter !== "") {
      this.filteredTests = this.filteredTests.filter((
        test: { result: string; }) => {
          return !this.resultFilter || test.result === this.resultFilter
      });
    }
  
    if (this.levelFilter !== "") {
      this.filteredTests = this.filteredTests.filter((
        test: { levels: string[] }) => {
          return !this.levelFilter || test.levels.includes(this.levelFilter);
      });
    }
  }
  
  applyResultFilter(): void {
    this.filteredTests = this.tests.filter((
      test: { result: string; }) => {
        return !this.resultFilter || test.result === this.resultFilter
    });
  
    // Apply other filters if they are not empty
    if (this.typeFilter !== "") {
      this.filteredTests = this.filteredTests.filter((
        test: { type: string; }) => {
          return !this.typeFilter || test.type === this.typeFilter
      });
    }
  
    if (this.levelFilter !== "") {
      this.filteredTests = this.filteredTests.filter((
        test: { levels: string[] }) => {
          return !this.levelFilter || test.levels.includes(this.levelFilter);
      });
    }
  }
  
  applyLevelFilter(): void {
    this.filteredTests = this.tests.filter((
      test: { levels: string[] }) => {
        return !this.levelFilter || test.levels.includes(this.levelFilter);
    });
  
    // Apply other filters if they are not empty
    if (this.typeFilter !== "") {
      this.filteredTests = this.filteredTests.filter((
        test: { type: string; }) => {
          return !this.typeFilter || test.type === this.typeFilter
      });
    }
  
    if (this.resultFilter !== "") {
      this.filteredTests = this.filteredTests.filter((
        test: { result: string; }) => {
          return !this.resultFilter || test.result === this.resultFilter
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

}
