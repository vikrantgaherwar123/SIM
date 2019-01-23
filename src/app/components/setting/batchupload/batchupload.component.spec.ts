import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchuploadComponent } from './batchupload.component';

describe('BatchuploadComponent', () => {
  let component: BatchuploadComponent;
  let fixture: ComponentFixture<BatchuploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchuploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
