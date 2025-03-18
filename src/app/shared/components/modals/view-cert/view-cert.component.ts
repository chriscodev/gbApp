// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.
import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Cert, CertStatus, DefaultCert, DefaultCertStatus, OCSPStatus} from '../../../../core/models/server/Cert';
import {convertCertStatusType, getCertStatusById} from '../../../helpers/certUtil';
import {ClientCertsModel} from '../../../../core/models/ClientCertsModel';
import {cloneDeep} from 'lodash';
import {ModalDynamicTbTranslateComponent} from '../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {Subscription} from 'rxjs';
import {ServiceGroup} from '../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';
import {CertificatesComponent} from '../../../../pages/main/certificates/certificates.component';

declare var $;

@Component({
  selector: 'app-view-cert',
  templateUrl: './view-cert.component.html',
  styleUrls: ['./view-cert.component.scss']
})
export class ViewCertComponent implements OnInit {
  @ViewChild(ModalDynamicTbTranslateComponent) certTable: ModalDynamicTbTranslateComponent;
  @Input() modalSelectCert = false;
  @Input() certType: string;
  @Input() currentCert = new DefaultCert();
  @Input() currentCertStatus = new DefaultCertStatus();
  @Input() issuerCertStatus = new DefaultCertStatus();
  @Input() issuerCertStatus2 = new DefaultCertStatus();
  @Input() issuerCert: Cert | null;
  @Input() issuerCert2: Cert | null;
  @Input() issuerStatus = false;
  @Input() issuerStatus2 = false;
  @Input() serverCerts: Cert[] = [];
  @Input() localServiceGroup: ServiceGroup;
  @Output() certRecordChanged: EventEmitter<Cert> = new EventEmitter();
  tsid: number;
  errorMessage = '';
  private allServerCerts: Cert[] = [];
  public serverCertStatusus: Map<number, CertStatus> = new Map<number, CertStatus>();
  public certDecodedData = '';
  protected subscriptions: Subscription [] = [];
  public tableHeaders = [
    {header: 'Issued To', key: 'name', visible: true},
    {header: 'Expires', key: 'notAfter', visible: true, showDate: true}
  ];
  public buttonList = [];

  constructor(
    @Inject(CertificatesComponent) private CertificatesComponent: CertificatesComponent,
    public certModel: ClientCertsModel,
    private cdr: ChangeDetectorRef) {
    this.allServerCerts = cloneDeep(this.certModel.certsSubject.getValue());
    this.serverCertStatusus = cloneDeep(this.certModel.certsStatusSubject.getValue());
    this.loadCertWithBSIDMatch();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.certModel.certs$.subscribe((certs: Cert[]) => {
      this.allServerCerts = cloneDeep(certs);
      this.loadCertWithBSIDMatch();
    }));

  }

  convertDecToHexComponent(val) {
    const hexValue = Number(val).toString(16).toUpperCase();
    return '0x' + hexValue;
  }

  convertCertStatusType(type: OCSPStatus) {
    return convertCertStatusType(type);
  }

  public selectCert(event: any) {
    this.currentCert = cloneDeep(this.certTable.selectedRow);
    this.certRecordChanged.emit(this.currentCert);
    this.closeModal('#modalCertLink');
  }

  viewCertDetails(cert: Cert) {
    if (cert.id !== -1) {
      this.certModel.viewCert(cert.id).subscribe(
        (response) => {
          $('#viewDetailsCert').html = response;
          this.certDecodedData = response;
        },
        (error) => {
          console.error('Error from server:', error);
        }
      );
    } else {
      const dataCert = this.CertificatesComponent.localCerts.find(
        (e: Cert) => e.clientId === cert.clientId);
      this.certDecodedData = dataCert.certificate as unknown as string;
      this.certModel.printCert(this.certDecodedData).subscribe((response) => {
        $('#viewDetailsCert').html = response;
        this.certDecodedData = response;
      },
        (error) => {
          console.error('Error from server:', error);
        });
    }
    $('#viewDetailsCert').innerHTML = this.certDecodedData;
    setTimeout(() => {
      $('#viewDetailsModal').modal({
        keyboard: true,
        show: true
      });
    }, 0);

  }

  viewIssuerCert2Details() {
    this.issuerCert2 = this.allServerCerts.find((e: Cert) => e.ski === this.issuerCert.aki) || null;
    this.issuerStatus2 = !(this.issuerCert2 !== null && !this.issuerCert.isSelfSigned);
    if (this.issuerCert2?.id) {
      this.issuerCertStatus2 = getCertStatusById(this.issuerCert2.id, this.serverCertStatusus);
    } else {
      this.issuerCertStatus2 = new DefaultCertStatus();
    }
    setTimeout(() => {
      $('#viewIssuerCert2Modal').modal({
        keyboard: true,
        show: true
      });
    }, 0);
  }


  verifyCert() {
  }

  openViewCertDialog() {
    if (this.modalSelectCert) {
      this.currentCertStatus = getCertStatusById(this.currentCert.id, this.serverCertStatusus);
      this.issuerCert = this.allServerCerts.find((e: Cert) => e.ski === this.currentCert.aki) || null;
      this.issuerStatus = !(this.issuerCert !== null && !this.currentCert.isSelfSigned);
      if (this.issuerCert?.id) {
        this.issuerCertStatus = getCertStatusById(this.issuerCert.id, this.serverCertStatusus);
      } else {
        this.issuerCertStatus = new DefaultCertStatus();
      }
    }
    setTimeout(() => {
      $('#viewCertModal').modal({
        keyboard: true,
        show: true
      });
    }, 0);
  }

  public closeModal(modalName) {
    $(modalName).modal('hide');
  }

  loadCertWithBSIDMatch() {
    if (isDefined(this.tsid)) {
      const certList: Cert[] = cloneDeep(this.certModel.certsSubject.getValue());
      const matchedCerts = [];
      certList.forEach(certObject => {
        if (certObject.privateKeyAvailable && Array.isArray(certObject.bsids)) {
          const exactMatch = certObject.bsids.some(bsid => String(bsid) === String(this.tsid));
          if (exactMatch) {
            matchedCerts.push(certObject);
          }
        }
      });
      this.serverCerts = cloneDeep(matchedCerts);
      if (this.serverCerts?.length === 0) {
        this.errorMessage = 'There are no available signaling certificates matching BSID ' + this.tsid;
      } else {
        this.errorMessage = null;
      }
      this.cdr.detectChanges();
    }
  }

  viewIssuerCertDetails() {
    setTimeout(() => {
      $('#viewIssuerCertModal').modal({
        keyboard: true,
        show: true
      });
    }, 0);
  }
}
