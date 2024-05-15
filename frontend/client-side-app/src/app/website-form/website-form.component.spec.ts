import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlFormComponent } from './website-form.component';

describe('UrlFormComponent', () => {
  let component: UrlFormComponent;
  let fixture: ComponentFixture<UrlFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UrlFormComponent]
    });
    fixture = TestBed.createComponent(UrlFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
