import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEvaluationComponent } from './search-evaluation.component';

describe('SearchEvaluationComponent', () => {
  let component: SearchEvaluationComponent;
  let fixture: ComponentFixture<SearchEvaluationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchEvaluationComponent]
    });
    fixture = TestBed.createComponent(SearchEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
