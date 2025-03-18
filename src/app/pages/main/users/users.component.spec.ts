/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { DataService } from '../../../core/services/data.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsersComponent } from './users.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { UsersService } from '../../../core/services/user.service';
import {ClientUsersModel} from '../../../core/models/ClientUsersModel';

describe('UsersComponent', () => {
    let component: UsersComponent;
    let fixture: ComponentFixture<UsersComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [UsersComponent],
    imports: [FormsModule,
        ReactiveFormsModule],
    providers: [UsersService, ClientUsersModel, provideHttpClient(withInterceptorsFromDi())]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const userServices: UsersService = TestBed.inject(UsersService);
        const dataService: DataService = TestBed.inject(DataService);
        expect(userServices).toBeTruthy();
        expect(dataService).toBeTruthy();
    });
});
