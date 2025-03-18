// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {CertStatus, DefaultCertStatus, OCSPStatus} from '../../core/models/server/Cert';

/*
export function getEventTypeData(val) {
  let imgStr = '';
  if (val === 'INFORMATION') {
    imgStr = '<i class=\'fa fa-exclamation-circle\' style="color:dodgerblue" ></i>';
  } else if (val === 'ERROR') {
    imgStr = '<i class=\'fa fa-times-circle\' style="color:red"></i>';
  } else if (val === 'WARNING') {
    imgStr = '<i class=\'fa fa-exclamation-triangle\' style="color:red"></i> ';
  } else if (val === 'SEVERE') {
    imgStr = '<i class=\'fa fa-exclamation-triangle\' style="color:orangered"></i>';
  } else if (val === 'CRITICAL') {
    imgStr = '<i class=\'fa fa-minus-circle\' style="color:red"></i> ';
  } else if (val === 'VERBOSE') {
    imgStr = '<i class=\'fa fa-bug \' style="color:red"></i> ';
  }
  return imgStr;
}
*/
export function isSigned(elem, certStatusObject) {
  let status = '';
  let cStatus: OCSPStatus;
  const now = new Date();
  certStatusObject.forEach(status => {
    if (status.certId === elem.id) {
      cStatus = status.status;
    }
  });
  if (elem.issuedTo === elem.issuedBy || elem.aki === elem.ski) {
    status = 'Self Signed';
  } else if (now > elem.notAfter) {
    status = convertCertStatusType(OCSPStatus.EXPIRED);
  } else if (now < elem.notBefore) {
    status = convertCertStatusType(OCSPStatus.NOT_YET_VALID);
  } else if (cStatus === null || elem.id === -1) {
    status = convertCertStatusType(OCSPStatus.NOT_CHECKED);
  } else {
    status = convertCertStatusType(cStatus);
  }
  return status;
}

export function getOSCPProduced(elemId, certStatusObject: CertStatus[]) {
  let produced;
  certStatusObject.forEach(status => {
    if (status.certId === elemId) {
      produced = status?.produced;
    }
  });
  return produced;
}

export function isOnline(elemId, certStatusObject) {
  let isOnlineStatus = false;
  if (elemId < 0) {
    isOnlineStatus = false;
  } else {
    certStatusObject.forEach(status => {
      if (status.certId === elemId) {
        isOnlineStatus = true;
      }
    });
  }
  return isOnlineStatus;
}

export function getCertStatusById(elemId, certStatusObject) {
  let certStatus: CertStatus = new DefaultCertStatus();
  certStatusObject.forEach(status => {
    if (status.certId === elemId) {
      certStatus = status;
    }
  });
  return certStatus;
}

export function convertCertStatusType(type: OCSPStatus) {
  const csType = type as OCSPStatus;
  let certType = '';
  if (csType === OCSPStatus.UNKNOWN) {
    certType = 'Unknown';
  } else if (csType === OCSPStatus.GOOD) {
    certType = 'Good';
  } else if (csType === OCSPStatus.NOT_CHECKED) {
    certType = 'Not Checked';
  } else if (csType === OCSPStatus.EXPIRED) {
    certType = 'Expired';
  } else if (csType === OCSPStatus.NOT_YET_VALID) {
    certType = 'Not Yet Valid';
  } else if (csType === OCSPStatus.RESPONSE_INVALID) {
    certType = 'Response Invalid';
  } else if (csType === OCSPStatus.REVOKED) {
    certType = 'Revoked';
  } else if (csType === OCSPStatus.UNKNOWN_ERROR) {
    certType = 'Unknown Error';
  } else {
    certType = 'Not Checked';
  }
  return certType;
}

