import { DataService } from '../../../core/services/data.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NetworkingComponent } from './networking.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NetworkingComponent', () => {
    let component: NetworkingComponent;
    let fixture: ComponentFixture<NetworkingComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [NetworkingComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NetworkingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
