// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {NetworkType} from '../../core/models/dtv/network/logical/Network';

export function convertDescriptor(val): string {
  let name;
  switch (val.tag) {
    case 173:
      name = '&#x1F6C8; ATSC Private Information - ' + val.formatIdentifier;
      break;
    case 255:
      name = '&#x1F4CB; User Defined - [User Defined - tag: ' + val.userTag + ']';
      break;
    case 160:
      name = '&#x1F5CF; Extended Channel Name - ' + val.longChannelName;
      break;
    case 170:
      name = '&#xA9; Redistribution Control - [Redistribution Control]';
      break;
    case 9:
      name =
        '&#x1F511; Conditional Access Descriptor - [System ID: ' +
        val.systemId +
        '][PID: ' +
        val.pid +
        ']';
      break;
  }
  return name;
}

export function checkDescriptorType(val): string {
  let name;
  switch (val) {
    case 173:
      name = 'ATSC Private Information';
      break;
    case 255:
      name = 'User Defined';
      break;
    case 160:
      name = 'Extended Channel Name';
      break;
    case 170:
      name = 'Redistribution Control';
      break;
    case 9:
      name = 'Conditional Access Descriptor';
      break;
  }
  return name;
}

export function checkDescriptorTag(val): string {
  let tag;
  switch (val) {
    case 'ATSC Private Information':
      tag = 173;
      break;
    case 'User Defined':
      tag = 255;
      break;
    case 'Extended Channel Name':
      tag = 160;
      break;
    case 'Redistribution Control':
      tag = 170;
      break;
    case 'Conditional Access Descriptor':
      tag = 9;
      break;
  }
  return tag;
}

export function convertExtension(val): string {
  let name;
  switch (val.type) {
    case 'CAPABILITIES':
      name = '&#x1F517; Capabilities (' + val.capabilities + ')';
      break;
    case 'INET_URL':
      name = '&#x1F4F6; Broadband Signaling (' + val.url + ')';
      break;
    case 'OTHER_BSID':
      let otherBsids = '';
      if (val.otherBsids) {
        otherBsids = val.otherBsids;
      }
      name = '&#x25D4; Other BSID (' + otherBsids + ')';
      break;
    case 'DRM_SYSTEM_ID':
      name = '&#x1f512; DRM System Id (' + val.drmSystemId + ')';
      break;
    case 'SIMULCAST_TSID':
      if (parseInt(val.major) > 0) {
        name = '&#x1F4E1; Simulcast TSID (TSID: ' + val.tsid + ' Service: ' + val.major + '-' + val.minor + ')';
      } else {
        name = '&#x1F4E1; Simulcast TSID (TSID: ' + val.tsid + ')';
      }
      break;
    case 'GENRE':
      name = '&#127925; Genre (' + val.genre + ')';
      break;
    case 'BROADBAND_SERVICE_ICON':
      name = '&#x1F4F6; Broadband Service Icon (' + val.url + ')';
      break;
    case 'BROADCAST_SERVICE_ICON':
      name = '&#x1F4FB; Broadcast Service Icon (' + val.url + ')';
      break;
    case 'BASE_URL':
      name = '&#129095; Base URL (' + val.url + ')';
      break;
    case 'BASE_PATTERN':
      let serveType = 'Broadcast';
      if (val.appServiceType === 'UNICAST') {
        serveType = 'Unicast';
      }
      name = '&#x28FF; Base Pattern (' + serveType + ' ' + val.pattern + ')';
      break;
    case 'USER_DEFINED_ATSC3_MESSAGE':
      name = '&#128211; User Defined ATSC3 Message (content_type: ' + val.contentType + ')';
      break;
    case 'CP':
      name = '&#128204; LCT Codepoint (' + val.codePoint + ', ' + val.format + ')';
      break;
    case 'CCI':
      name = '&#x1F41E; LCT CCI (0x' + val.cci + ')';
      break;
    case 'LANGUAGE':
      name = '&#x1F4AC; Language (' + val.languageCode + ')';
      break;
    case 'SGDU_PASSTHROUGH':
      name = '&#8694; SGDU Passthrough ';
      break;
    case 'VIDEO_STREAM_PROPERTIES':
      name = '&#9654; Video Stream Properties ';
      break;
    case 'AUDIO_STREAM_PROPERTIES':
      name = '&#128264; Audio Stream Properties ';
      break;
    case 'CAPTION_ASSET':
      name = '&#13252; Caption Asset ';
      break;
    case 'LOW_DELAY':
      name = '&#128337; Low Delay ';
      break;
  }
  return name;
}

export function parseHtmlEntities(type: NetworkType, item) {
  const dynamicTableObject: any = [];
  const textArea = document.createElement('textarea');
  let confirmName: string;

  if (type === 'ATSC_3') {
    textArea.innerHTML = convertExtension(item);
    if (item.type === 'CAPABILITIES') {
      confirmName = 'Capabilities (' + item.capabilities + ')';
    }
    if (item.type === 'INET_URL') {
      confirmName = 'Broadband Signaling (' + item.url + ')';
    }
    if (item.type === 'DRM_SYSTEM_ID') {
      confirmName = 'DRM System Id (' + item.drmSystemId + ')';
    }
    if (item.type === 'SIMULCAST_TSID') {
      confirmName = 'Simulcast TSID (TSID: ' + item.tsid + ' Service: ' + item.major + '-' + item.minor + ')';
    }
    if (item.type === 'OTHER_BSID') {
      confirmName = 'Other BSID (' + item.otherBsids + ')';
    }
    if (item.type === 'GENRE') {
      confirmName = 'Genre (' + item.genre + ')';
    }
    if (item.type === 'BROADBAND_SERVICE_ICON') {
      confirmName = 'Broadband Service Icon (' + item.url + ')';
    }
    if (item.type === 'BROADCAST_SERVICE_ICON') {
      confirmName = 'Broadcast Service Icon (' + item.url + ')';
    }
    if (item.type === 'BASE_URL') {
      confirmName = 'Base URL (' + item.url + ')';
    }
    if (item.type === 'BASE_PATTERN') {
      confirmName = 'Base Pattern (' + item.appServiceType + ' ' + item.pattern + ')';
    }
    if (item.type === 'USER_DEFINED_ATSC3_MESSAGE') {
      confirmName = 'User Defined ATSC3 Message (content_type: ' + item.contentType + ')';
    }
    if (item.type === 'CP') {
      confirmName = 'LCT Codepoint (' + item.codePoint + ', ' + item.format + ')';
    }
    if (item.type === 'LANGUAGE') {
      confirmName = 'Language (' + item.languageCode + ')';
    }
    if (item.type === 'CCI') {
      confirmName = 'LCT CCI (0x' + item.cci + ')';
    }
    if (item.type === 'SGDU_PASSTHROUGH') {
      confirmName = 'SGDU Passthrough';
      dynamicTableObject.editable = false;
    }
    if (item.type === 'VIDEO_STREAM_PROPERTIES') {
      confirmName = 'Video Stream Properties';
      dynamicTableObject.editable = false;
    }
    if (item.type === 'AUDIO_STREAM_PROPERTIES') {
      confirmName = 'Audio Stream Properties';
      dynamicTableObject.editable = false;
    }
    if (item.type === 'CAPTION_ASSET') {
      confirmName = 'Caption Asset';
      dynamicTableObject.editable = false;
    }
    if (item.type === 'LOW_DELAY') {
      confirmName = 'Low Delay';
      dynamicTableObject.editable = false;
    }
  } else {
    textArea.innerHTML = convertDescriptor(item);
    if (item.tag === 173) {
      confirmName = item.formatIdentifier;
    }
    if (item.tag === 255) {
      confirmName = '[User Defined - tag: ' + item.userTag + ']';
    }
    if (item.tag === 9) {
      confirmName = '[System ID: ' + item.systemId + '] [PID: ' + item.pid + ']';
    }
    if (item.tag === 160) {
      confirmName = item.longChannelName;
    }
    if (item.tag === 170) {
      confirmName = '[Redistribution Control]';
      dynamicTableObject.editable = false;
    }
  }
  dynamicTableObject.desc_name = textArea.value;
  dynamicTableObject.name = confirmName;
  return dynamicTableObject;
}
