import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedExplorerComponent } from './embedded-explorer.component';

describe('EmbeddedExplorerComponent', () => {
  let component: EmbeddedExplorerComponent;
  let fixture: ComponentFixture<EmbeddedExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddedExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddedExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
