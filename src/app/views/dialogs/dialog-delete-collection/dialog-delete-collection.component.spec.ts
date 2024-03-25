import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteCollectionComponent } from './dialog-delete-collection.component';

describe('DialogDeleteCollectionComponent', () => {
  let component: DialogDeleteCollectionComponent;
  let fixture: ComponentFixture<DialogDeleteCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDeleteCollectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeleteCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
