import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateCollectionComponent } from './dialog-create-collection.component';

describe('DialogCreateCollectionComponent', () => {
  let component: DialogCreateCollectionComponent;
  let fixture: ComponentFixture<DialogCreateCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCreateCollectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreateCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
