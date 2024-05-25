import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-detailed-test-dialog',
  templateUrl: './detailed-test-dialog.component.html',
  styleUrls: ['./detailed-test-dialog.component.css']
})
export class DetailedTestDialogComponent {
  constructor (
    @Inject(MAT_DIALOG_DATA) public testData: any,
    public dialogRef: MatDialogRef<DetailedTestDialogComponent>
  ) { }
}
