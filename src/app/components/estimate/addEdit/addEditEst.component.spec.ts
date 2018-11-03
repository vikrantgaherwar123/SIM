import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEstComponent } from '../addEdit/addEditEst.component';

describe('EstimateComponent', () => {
  let component: AddEditEstComponent;
  let fixture: ComponentFixture<AddEditEstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditEstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditEstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
