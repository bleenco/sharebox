import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyDialogComponent } from './copy-dialog.component';

describe('CopyDialogComponent', () => {
  let component: CopyDialogComponent;
  let fixture: ComponentFixture<CopyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
