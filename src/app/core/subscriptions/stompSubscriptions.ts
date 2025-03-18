/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

export class StompVariables {
  public static stompChannels = {
    loginSessionsUpdate: '/topic/notifyLoginSessionsUpdate',
    notifyJavaAdminClientLogon: '/topic/notifyJavaAdminClientLogon',
    notifyUsersUpdate: '/topic/admin/notifyUsersUpdate',
    notifySMTPSettingsUpdate: '/topic/admin/notifySMTPSettingsUpdate',
    notifySNMPSettingsUpdate: '/topic/admin/notifySNMPSettingsUPdate',
    notifyCertRequestsUpdate: '/topic/admin/notifyCertRequestsUpdate',
    notifyRouteLogUpdate: '/topic/notifyRouteLogUpdate',
    notifySegmentDownloadUpdate:
      '/topic/ipStreamStatus/notifySegmentDownloadUpdate',
    notifyAlarmUpdate: '/topic/alarmModelUpdate',
    notifyEncodedOutput: '/topic/notifyEncodedOutput',
    notifyScheduleProvidersUpdate: '/topic/notifyScheduleProvidersUpdate',
    notifyCurrentServerTime: '/topic/currentServerTime',
    notifyLocationSettingsUpdate: '/topic/admin/notifyLocationSettingsUpdate',
    notifyScheduleProviderStatusUpdate: '/topic/notifyScheduleProviderStatusUpdate',
    notifyOutputStatusUpdate: '/topic/notifyOutputStatusUpdate',
    notifyLicenseNodeLockChanged: '/topic/notifyNodeLockChanged',
    notifyLicenseLogoff: '/topic/notifyLicenseLogoff',
    notifyCommitUpdate: '/topic/notifyCommitUpdate',
    notifyCertsUpdate: '/topic/admin/notifyCertsUpdate',
    notifyEventLogUpdate: '/topic/notifyEventLogUpdated',
    notifyCertStatusUpdate: '/topic/admin/notifyCertStatusUpdate',
    notifyAlarmConfigUpdate: '/topic/alarmConfigUpdate',
    notifyAlarmEventUpdate: '/topic/alarmEventUpdate',
    notifyNetworkSettingsUpdate: '/topic/networkSettingsUpdate',
    notifyServerStatusChanged: '/topic/notifyServerStatusChanged',
    notifyRedundancySettingsUpdate: '/topic/admin/notifyRedundancySettings',
    notifyExportStatus: '/topic/admin/notifyExportStatus'
  };
}
