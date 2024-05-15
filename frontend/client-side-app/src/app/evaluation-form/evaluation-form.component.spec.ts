import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationFormComponent } from './evaluation-form.component';

describe('EvaluationFormComponent', () => {
  let component: EvaluationFormComponent;
  let fixture: ComponentFixture<EvaluationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvaluationFormComponent]
    });
    fixture = TestBed.createComponent(EvaluationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
