import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CuratorRegistryPageComponent } from "./curator-registry-page.component";

describe("CuratorRegistryPageComponent", () => {
  let component: CuratorRegistryPageComponent;
  let fixture: ComponentFixture<CuratorRegistryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CuratorRegistryPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CuratorRegistryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
