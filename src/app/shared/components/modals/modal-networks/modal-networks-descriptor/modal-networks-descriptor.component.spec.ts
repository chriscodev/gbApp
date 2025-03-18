import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalNetworksDescriptorComponent } from './modal-networks-descriptor.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
describe('ModalNetworksDescriptorComponent', () => {
    let component: ModalNetworksDescriptorComponent;
    let fixture: ComponentFixture<ModalNetworksDescriptorComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule
              ],
            declarations: [ModalNetworksDescriptorComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalNetworksDescriptorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
