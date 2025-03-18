import { Component, OnInit, Output, ViewChild, EventEmitter, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-pending-change',
    templateUrl: './pending-change.component.html',
    styleUrls: ['./pending-change.component.scss']
})

export class PendingChangeComponent implements OnInit {
    @Output() confirmClick = new EventEmitter<string>();
    @ViewChild('modalPendingRef') modalPendingRef: TemplateRef<any>;

    modalReference: NgbModalRef;
    modalOptions: NgbModalOptions;
    interval: any;

    subject = new Subject<boolean>();

    constructor(private modalService: NgbModal) {
        this.modalOptions = {
            size: 'lg',
            windowClass: 'modal-holder',
            centered: true
        };
    }
    ngOnInit(): void {
    }
    openPendingChangeModal() {
      this.modalService.open(this.modalPendingRef, this.modalOptions);
    }
    pendingOK() {
        return true;
    }
    pendingCancel() {
        this.modalReference.dismiss();
        this.confirmClick.emit();
        return false;
    }
}
