import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedTestDialogComponent } from './detailed-test-dialog.component';

describe('DetailedTestDialogComponent', () => {
  let component: DetailedTestDialogComponent;
  let fixture: ComponentFixture<DetailedTestDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailedTestDialogComponent]
    });
    fixture = TestBed.createComponent(DetailedTestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
