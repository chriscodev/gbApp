// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {APP_BASE_HREF, CommonModule, NgOptimizedImage} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HomeComponent} from './home/home.component';
import {NetworkingComponent} from './networking/networking.component';
import {UsersComponent} from './users/users.component';
import {PendingChangesGuard} from '../../core/guards/canDeactivateGuard';
import {FeaturesComponent} from './features/features.component';
import {SwUpdateComponent} from './sw-update/sw-update.component';
import {SnmpComponent} from './snmp/snmp.component';
import {SmtpEmailComponent} from './smtp-email/smtp-email.component';
import {CertificateRequestComponent} from './certificate-request/certificate-request.component';
import {ActivityLogComponent} from './activity-log/activity-log.component';
import {SystemHealthComponent} from './system-health/system-health.component';
import {ScheduleProviderComponent} from './dtv-services/schedule-provider/schedule-provider.component';
import {
  ModalSpListingsComponent
} from '../../shared/components/modals/modal-sp/modal-sp-listings/modal-sp-listings.component';
import {
  ModalSpOnconnectComponent
} from '../../shared/components/modals/modal-sp/grace-note/modal-sp-onconnect/modal-sp-onconnect.component';

import {
  ModalSpTestconnectionComponent
} from '../../shared/components/modals/modal-sp/modal-sp-testconnection/modal-sp-testconnection.component';
import {
  ModalSpSelectxsltComponent
} from '../../shared/components/modals/modal-sp/ftp/modal-sp-selectxslt/modal-sp-selectxslt.component';
import {
  ModalSpStatusComponent
} from '../../shared/components/modals/modal-sp/modal-sp-status/modal-sp-status.component';
import {
  ModalSpScheduleDownloadSettingsComponent
} from '../../shared/components/modals/modal-sp/modal-sp-schedule-download-settings/modal-sp-schedule-download-settings.component';

import {TransportComponent} from './dtv-services/dtv-network/transport/transport.component';
import {ButtonComponent} from '../../shared/components/button/button.component';

import {
  ModalViewScheduleComponent
} from '../../shared/components/modals/modal-view-schedule/modal-view-schedule.component';
import {
  ModalPsipTransportStreamComponent
} from '../../shared/components/modals/modal-transport/atsc/psip/modal-psip-transport-stream/modal-psip-transport-stream.component';
import {
  ModalEditPsiSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/psip/modal-edit-psi-settings/modal-edit-psi-settings.component';
import {
  ModalTransportAddEditProgramComponent
} from '../../shared/components/modals/modal-transport/atsc/psip/modal-transport-add-edit-program/modal-transport-add-edit-program.component';
import {
  ModalEditPsipTableSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/psip/modal-edit-psip-table-settings/modal-edit-psip-table-settings.component';
import {
  ModalTransportAc3ElemStreamComponent
} from '../../shared/components/modals/modal-transport/atsc/psip/modal-transport-ac3-elem-stream/modal-transport-ac3-elem-stream.component';
import {
  ModalTransportElementaryStreamComponent
} from '../../shared/components/modals/modal-transport/atsc/psip/modal-transport-elementary-stream/modal-transport-elementary-stream.component';
import {
  ModalOutputsTransportSelectComponent
} from '../../shared/components/modals/modal-ouputs/modal-outputs-transport-select/modal-outputs-transport-select.component';
import {
  ModalTransportAtsc3TransportStreamComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/modal-transport-atsc3-transport-stream/modal-transport-atsc3-transport-stream.component';
import {
  ModalTransportServiceGroupComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-service-group/modal-transport-service-group.component';
import {
  ModalTransportSelectExtensionTypeComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/extension/modal-transport-select-extension-type/modal-transport-select-extension-type.component';
import {
  ModalTransportAddBondedBSIDComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/extension/modal-transport-add-bonded-bsid/modal-transport-add-bonded-bsid.component';
import {
  ModalTransportEditLlsSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-edit-lls-settings/modal-transport-edit-lls-settings.component';
import {
  ModalTransportEditBroadbandSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-edit-broadband-settings/modal-transport-edit-broadband-settings.component';
import {
  ModalTransportEditEsgSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-edit-esg-settings/modal-transport-edit-esg-settings.component';
import {
  ModalTransportEditAeaSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-edit-aea-settings/modal-transport-edit-aea-settings.component';
import {
  ModalTransportEditRecoverySettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-edit-recovery-settings/modal-transport-edit-recovery-settings.component';
import {
  ModalTransportVp1EmbeddersComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-vp1-embedders/modal-transport-vp1-embedders.component';

import {
  ModalTransportSelectMediaStreamComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-select-media-stream/modal-transport-select-media-stream.component';
import {
  ModalTransportAddIPStreamsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-add-ipstreams/modal-transport-add-ipstreams.component';
import {
  ModalTransportImportCsvComponent
} from '../../shared/components/modals/modal-transport/modal-transport-import-csv/modal-transport-import-csv.component';

import {
  ModalOutputsViewSelectedTransportComponent
} from '../../shared/components/modals/modal-ouputs/modal-outputs-view-selected-transport/modal-outputs-view-selected-transport.component';
import {TreeGridModule} from '@syncfusion/ej2-angular-treegrid';
import {GridAllModule} from '@syncfusion/ej2-angular-grids';
import {TreeviewModule} from 'ngx-treeview-custom';
import {BlockCopyPasteDirective} from 'src/app/shared/directives/block-copy-paste.directive';
import {DateTimeComponent} from './date-time/date-time.component';
import {NumbersOnlyDirective} from 'src/app/shared/directives/numbers-only.directive';
import {MediaStreamComponent} from './dtv-services/dtv-network/mediastream/mediastream.component';
import {ServiceMapComponent} from './service-map/service-map.component';
import {DtvNetworkComponent} from './dtv-services/dtv-network/dtv-network.component';

import {Page404Component} from './page404/page404.component';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  ModalCommitRevertDialogComponent
} from '../../shared/components/modals/modal-commit-revert-dialog/modal-commit-revert-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {
  ModalConfirmDialogComponent
} from '../../shared/components/modals/modal-confirm-dialog/modal-confirm-dialog.component';
import {MatTabsModule} from '@angular/material/tabs';
import {ModalsModule} from 'src/app/shared/components/modals/modals.module';
import {MatSliderModule} from '@angular/material/slider';
import {
  ModalSpSchedulesearchComponent
} from '../../shared/components/modals/modal-sp/grace-note/modal-sp-schedulesearch/modal-sp-schedulesearch.component';
import {
  ModalDataAddElementsComponent
} from '../../shared/components/modals/modal-data-package/modal-data-add-elements/modal-data-add-elements.component';
import {
  ModalListDataElementsComponent
} from '../../shared/components/modals/modal-data-package/modal-list-data-elements/modal-list-data-elements.component';
import {DataPackageComponent} from './dtv-services/dtv-network/datastream/data-package.component';
import {
  ModalTransportSelectServiceGroupComponent
} from '../../shared/components/modals/modal-data-package/modal-transport-select-service-group/modal-transport-select-service-group.component';
import {
  ModalFileUploadComponent
} from '../../shared/components/modals/modal-data-package/modal-file-upload/modal-file-upload.component';
import {GBStatusComponent} from './gb-status/gb-status.component';
import {EventLogComponent} from './activity-log/event-log/event-log.component';
import {RuntimeLogComponent} from './activity-log/runtime-log/runtime-log.component';
import {CertificatesComponent} from './certificates/certificates.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {
  ModalOutputsAtsc3UdpComponent
} from 'src/app/shared/components/modals/modal-ouputs/atsc3-udp/modal-outputs-atsc3-udp/modal-outputs-atsc3-udp.component';
import {
  ModalOutputsHarrisComponent
} from 'src/app/shared/components/modals/modal-ouputs/harris/modal-outputs-harris/modal-outputs-harris.component';
import {
  ModalOutputsSelectTransportsComponent
} from 'src/app/shared/components/modals/modal-ouputs/modal-outputs-select-transports/modal-outputs-select-transports.component';
import {
  ModalOutputsTestConnectionComponent
} from 'src/app/shared/components/modals/modal-ouputs/triveni-carousel-and-siblings/modal-outputs-test-connection/modal-outputs-test-connection.component';
import {
  ModalOutputsTriveniCarouselComponent
} from 'src/app/shared/components/modals/modal-ouputs/triveni-carousel-and-siblings/modal-outputs-triveni-carousel/modal-outputs-triveni-carousel.component';
import {
  ModalOutputsViewStatusComponent
} from 'src/app/shared/components/modals/modal-ouputs/modal-outputs-view-status/modal-outputs-view-status.component';
import {ModalSpFtpComponent} from '../../shared/components/modals/modal-sp/ftp/modal-sp-ftp/modal-sp-ftp.component';

import {
  ModalTransportAtscRouteDetailsComponent
} from 'src/app/shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-atsc-route-details/modal-transport-atsc-route-details.component';
import {
  ModalOutputsAtsc1UdpComponent
} from 'src/app/shared/components/modals/modal-ouputs/atsc1-udp/modal-outputs-atsc1-udp/modal-outputs-atsc1-udp.component';
import {
  ModalOutputsUdpRouteSelectComponent
} from 'src/app/shared/components/modals/modal-ouputs/atsc1-udp/modal-outputs-udp-route-select/modal-outputs-udp-route-select.component';
import {
  ModalOutputsEasAddressSelectComponent
} from 'src/app/shared/components/modals/modal-ouputs/atsc1-udp/modal-outputs-eas-address-select/modal-outputs-eas-address-select.component';

import {
  ModalNetworksScheduleComponent
} from '../../shared/components/modals/modal-networks/modal-networks-schedule/modal-networks-schedule.component';
import {
  ModalNetworksCaptionComponent
} from '../../shared/components/modals/modal-networks/modal-networks-caption/modal-networks-caption.component';
import {
  ModalNetworksTransportLinkProgramComponent
} from '../../shared/components/modals/modal-networks/modal-networks-transport-link-program/modal-networks-transport-link-program.component';

import {
  ModalProgressBarComponent
} from '../../shared/components/modals/modal-progress-bar/modal-progress-bar.component';

import {
  ModalNetworksDescriptorComponent
} from '../../shared/components/modals/modal-networks/modal-networks-descriptor/modal-networks-descriptor.component';
import {NetworksComponent} from './dtv-services/dtv-network/networks/networks.component';

import {
  ModalNetworksAtscNetworkComponent
} from '../../shared/components/modals/modal-networks/modal-networks-atsc-network/modal-networks-atsc-network.component';
import {
  ModalNetworksAtscChannelComponent
} from '../../shared/components/modals/modal-networks/modal-networks-atsc-channel/modal-networks-atsc-channel.component';
import {
  ModalNetworksAtscServiceComponent
} from '../../shared/components/modals/modal-networks/modal-networks-atsc-service/modal-networks-atsc-service.component';
import {ViewCertComponent} from '../../shared/components/modals/view-cert/view-cert.component';
import {
  ServiceGroupSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/settings/service-group-settings.component';
import {
  ServiceGroupComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/service-group.component';
import {
  ServiceGroupIpStreamsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/ip-streams/service-group-ip-streams.component';
import {SelectTimezoneComponent} from '../../shared/components/utilities/select-timezone/select-timezone.component';
import {OutputComponent} from './dtv-services/dtv-network/output/output.component';

import {
  ModalOutputsViewSelectedTransportsMaterialComponent
} from '../../shared/components/modals/modal-ouputs/modal-outputs-view-selected-transports-material/modal-outputs-view-selected-transports-material.component';
import {
  MatNestedTreeNode,
  MatTree,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodeOutlet,
  MatTreeNodePadding,
  MatTreeNodeToggle
} from '@angular/material/tree';
import {MatProgressBar} from '@angular/material/progress-bar';
import {ModalTreeViewComponent} from '../../shared/components/modals/modal-tree-view/modal-tree-view.component';
import {
  ModalTransportEditDstpSettingsComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/service-group/modal-transport-edit-dstp-settings/modal-transport-edit-dstp-settings.component';
import {IpAddressDirective} from '../../shared/directives/ip-address.directive';
import {
  ModalViewSchedulesListComponent
} from '../../shared/components/modals/modal-sp/modal-sp-view-schedules-list/modal-view-schedules-list.component';
import {ActiveAlarmsComponent} from './alarm/active-alarms/active-alarms.component';
import {AlarmHistoryComponent} from './alarm/history/alarm-history.component';
import {AlarmConfigurationComponent} from './alarm/configuration/alarm-configuration.component';
import {
  ModalOutputsMnaComponent
} from '../../shared/components/modals/modal-ouputs/harris/modal-outputs-mna/modal-outputs-mna.component';
import {
  ModalOutputsAsiComponent
} from '../../shared/components/modals/modal-ouputs/modal-outputs-asi/modal-outputs-asi.component';
import {
  ModalSpOnv3Component
} from '../../shared/components/modals/modal-sp/grace-note/modal-sp-onv3/modal-sp-onv3.component';
import {
  ModalNetworkImportCsvComponent
} from '../../shared/components/modals/modal-networks/modal-network-import-csv/modal-network-import-csv.component';
import {
  ModalOutputsViewRoutesComponent
} from '../../shared/components/modals/modal-ouputs/modal-outputs-view-routes/modal-outputs-view-routes.component';
import {
  ModalTransportAtsc3TranslatedTransportStreamComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/modal-transport-atsc3-translated-transport-stream/modal-transport-atsc3-translated-transport-stream.component';
import {
  ModalAtsc3ViewTransportsListComponent
} from '../../shared/components/modals/modal-transport/atsc/atsc3/modal-atsc3-view-transports-list/modal-atsc3-view-transports-list.component';
import {BaseChartDirective} from 'ng2-charts';
import {
  ModalOutputsAtsc3TranslatorComponent
} from '../../shared/components/modals/modal-ouputs/atsc3-udp/atsc3-translated/modal-outputs-atsc3-translator/modal-outputs-atsc3-translator.component';
import {
  ModalOutputsAtsc3TranslatedRoutesComponent
} from '../../shared/components/modals/modal-ouputs/atsc3-udp/atsc3-translated/modal-outputs-atsc3-translated-routes/modal-outputs-atsc3-translated-routes.component';
import {
  ModalOutputsSelectTransportTypeComponent
} from '../../shared/components/modals/modal-ouputs/modal-outputs-select-transport-type/modal-outputs-select-transport-type.component';
import {
  ModalUdpImportCsvComponent
} from '../../shared/components/modals/modal-ouputs/modal-udp-import-csv/modal-udp-import-csv.component';
import {NoSpecialCharsDirective} from '../../shared/directives/no-special-chars.directive';
import {RedundancyComponent} from './redundancy/redundancy.component';
import {PmcpTcpComponent} from '../../shared/components/modals/modal-sp/pmcp-tcp/pmcp-tcp.component';
import {
  ModalServiceExportListComponent
} from '../../shared/components/modals/modal-service-export/modal-service-export-list/modal-service-export-list.component';
import {ServiceExportComponent} from './dtv-services/service-export/service-export.component';
import {
  ModalTcpExportComponent
} from '../../shared/components/modals/modal-service-export/modal-tcp-export/modal-tcp-export.component';
import {
  ModalFtpExportComponent
} from '../../shared/components/modals/modal-service-export/modal-ftp-export/modal-ftp-export.component';
import {
  ModalExportServicesComponent
} from '../../shared/components/modals/modal-service-export/modal-export-services/modal-export-services.component';
import {
  ModalStreamScopeExportComponent
} from '../../shared/components/modals/modal-service-export/modal-stream-scope-export/modal-stream-scope-export.component';
import {
  ModalFtpTestConnectionComponent
} from '../../shared/components/modals/modal-service-export/modal-ftp-test-connection/modal-ftp-test-connection.component';
import {RedirectGuard} from '../../core/guards/redirect.guard';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [RedirectGuard],
    pathMatch: 'full',
    data: {
      activeTab: 'main',
    },
  },
  {
    path: 'date-time',
    component: DateTimeComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'date-time',
    },
  },
  {
    path: 'networking',
    component: NetworkingComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'networking',
    },
  },
  {
    path: 'users',
    component: UsersComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'users',
    },
  },
  {
    path: 'redundancy',
    component: RedundancyComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'users',
    },
  },
  {
    path: 'certificates',
    component: CertificatesComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'certificates',
    },
  },
  {
    path: 'test',
    component: HomeComponent,
  },
  {
    path: 'features',
    component: FeaturesComponent,
    data: {
      activeTab: 'features',
    },
  },
  {
    path: 'sw-update',
    component: SwUpdateComponent,
    data: {
      activeTab: 'sw-update',
    },
  },
  {
    path: 'certificate-request',
    component: CertificateRequestComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'certificate-request',
    },
  },
  {
    path: 'snmp',
    component: SnmpComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'snmp',
    },
  },
  {
    path: 'smtp-email',
    component: SmtpEmailComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'smtp-email',
    },
  },
  {
    path: 'activity-log',
    component: ActivityLogComponent,
    data: {
      activeTab: 'activity-log',
    },
  },
  {
    path: 'gb-status',
    component: GBStatusComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'gb-status',
    },
  },
  {
    path: 'system-health',
    component: SystemHealthComponent,
    data: {
      activeTab: 'system-health',
    },
  },

  {
    path: 'dtv-services/schedule-provider',
    component: ScheduleProviderComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'schedule-provider',
    },
  },
  {
    path: 'dtv-services/dtv-network',
    component: DtvNetworkComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'dtv-network',
    },
  },
  {
    path: 'dtv-services/service-export',
    component: ServiceExportComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'service-export',
    },
  },
  {
    path: 'service-map',
    component: ServiceMapComponent,
    data: {
      activeTab: 'service-map',
    },
  },
  {
    path: 'alarm/active-alarms',
    component: ActiveAlarmsComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'active-alarms',
    },
  },
  {
    path: 'alarm/alarm-configuration',
    component: AlarmConfigurationComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'alarm-configuration',
    },
  },
  {
    path: 'alarm/alarm-history',
    component: AlarmHistoryComponent,
    canDeactivate: [PendingChangesGuard],
    runGuardsAndResolvers: 'always',
    data: {
      activeTab: 'alarm-history',
    },
  },

  // wrong path
  {path: '**', component: Page404Component},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TreeGridModule,
    GridAllModule,
    TreeviewModule.forRoot(),
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatSliderModule,
    ScrollingModule,
    ModalsModule,
    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodeToggle,
    MatNestedTreeNode,
    MatTreeNodeOutlet,
    MatTreeNodePadding,
    MatProgressBar,
    NgOptimizedImage,
    BaseChartDirective
  ],
  exports: [RouterModule, ModalCommitRevertDialogComponent, SelectTimezoneComponent],
  declarations: [
    HomeComponent,
    NetworkingComponent,
    UsersComponent,
    FeaturesComponent,
    SwUpdateComponent,
    SmtpEmailComponent,
    SnmpComponent,
    CertificateRequestComponent,
    ActivityLogComponent,
    SystemHealthComponent,
    ScheduleProviderComponent,
    ModalSpListingsComponent,
    ModalSpOnconnectComponent,
    ModalSpOnv3Component,
    ModalSpTestconnectionComponent,
    ModalSpSelectxsltComponent,
    ModalSpStatusComponent,
    ModalSpScheduleDownloadSettingsComponent,
    TransportComponent,
    NetworksComponent,
    ModalNetworksScheduleComponent,
    OutputComponent,
    ModalOutputsAsiComponent,
    ModalOutputsHarrisComponent,
    ModalOutputsMnaComponent,
    ModalOutputsTestConnectionComponent,
    ModalOutputsSelectTransportsComponent,
    ModalOutputsSelectTransportsComponent,
    ModalOutputsAtsc3UdpComponent,
    ModalOutputsTriveniCarouselComponent,
    ModalOutputsViewStatusComponent,
    ModalUdpImportCsvComponent,
    ButtonComponent,
    ModalViewScheduleComponent,
    ModalPsipTransportStreamComponent,
    ModalEditPsiSettingsComponent,
    ModalTransportAddEditProgramComponent,
    ModalEditPsipTableSettingsComponent,
    ModalTransportElementaryStreamComponent,
    ModalTransportAc3ElemStreamComponent,
    ModalTransportAtsc3TransportStreamComponent,
    ModalTransportSelectExtensionTypeComponent,
    ModalTransportAddBondedBSIDComponent,
    ModalOutputsTransportSelectComponent,
    ModalTransportServiceGroupComponent,
    ModalTransportEditLlsSettingsComponent,
    ModalTransportEditBroadbandSettingsComponent,
    ModalTransportEditEsgSettingsComponent,
    ModalTransportEditAeaSettingsComponent,
    ModalTransportEditRecoverySettingsComponent,
    ModalTransportVp1EmbeddersComponent,
    ModalTransportSelectMediaStreamComponent,
    ModalTransportAddIPStreamsComponent,
    ModalTransportImportCsvComponent,
    ModalNetworkImportCsvComponent,
    ModalOutputsViewSelectedTransportComponent,
    ModalOutputsViewSelectedTransportsMaterialComponent,
    BlockCopyPasteDirective,
    NumbersOnlyDirective,
    IpAddressDirective,
    NoSpecialCharsDirective,
    ServiceMapComponent,
    MediaStreamComponent,
    DataPackageComponent,
    DtvNetworkComponent,
    ModalConfirmDialogComponent,
    ModalCommitRevertDialogComponent,
    ModalSpSchedulesearchComponent,
    ModalListDataElementsComponent,
    ModalDataAddElementsComponent,
    ModalTransportSelectServiceGroupComponent,
    ModalFileUploadComponent,
    GBStatusComponent,
    EventLogComponent,
    RuntimeLogComponent,
    CertificatesComponent,
    ModalSpSchedulesearchComponent,
    ModalSpFtpComponent,
    PmcpTcpComponent,
    ModalTransportAtscRouteDetailsComponent,
    ModalOutputsAtsc1UdpComponent,
    ModalOutputsUdpRouteSelectComponent,
    ModalOutputsEasAddressSelectComponent,
    ModalNetworksCaptionComponent,
    ModalNetworksTransportLinkProgramComponent,
    ModalProgressBarComponent,
    ModalNetworksDescriptorComponent,
    ModalNetworksAtscNetworkComponent,
    ModalNetworksAtscChannelComponent,
    ModalNetworksAtscServiceComponent,
    ViewCertComponent,
    ServiceGroupSettingsComponent,
    ServiceGroupComponent,
    ServiceGroupIpStreamsComponent,
    SelectTimezoneComponent,
    ModalTreeViewComponent,
    ModalTransportEditDstpSettingsComponent,
    ModalViewSchedulesListComponent,
    ActiveAlarmsComponent,
    AlarmHistoryComponent,
    AlarmConfigurationComponent,
    ModalTransportAtsc3TranslatedTransportStreamComponent,
    ModalAtsc3ViewTransportsListComponent,
    ModalOutputsViewRoutesComponent,
    ModalOutputsAtsc3TranslatorComponent,
    ModalOutputsAtsc3TranslatedRoutesComponent,
    ModalOutputsSelectTransportTypeComponent,
    RedundancyComponent,
    ServiceExportComponent,
    ModalServiceExportListComponent,
    ModalExportServicesComponent,
    ModalTcpExportComponent,
    ModalFtpExportComponent,
    ModalStreamScopeExportComponent,
    ModalFtpTestConnectionComponent
  ],
  providers: [PendingChangesGuard, {provide: APP_BASE_HREF, useValue: './'}],

})
export class MainRoutingModule {
}
