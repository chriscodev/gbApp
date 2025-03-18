// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

export const ElementaryStreamTypeArray = [
  {name: 'MPEG-2 (ISO/IEC 13818-2)', code: 'STANDARD_13818_2_VIDEO', hex: '0x02', shortName: 'MPEG2 Video'},
  {name: 'AC-3 Audio', code: 'STANDARD_ATSC_52_AC3', hex: '0x81', shortName: 'AC-3 Audio'},
  {name: 'ISO/IEC 13818-1 private PES packets', code: 'STANDARD_13818_1_PES', hex: '0x06', shortName: 'MPEG2 PES'},

  {name: 'ISO/IEC Reserved', code: 'ITU_T_ISO_IEC_Reserved', hex: '0x00', shortName: 'ISO Reserved'},
  {name: 'ISO/IEC 11172 Video', code: 'STANDARD_11172_2_VIDEO', hex: '0x01', shortName: 'MPEG1 Video'},
  {name: 'ISO/IEC 11172 Audio', code: 'STANDARD_11172_3_AUDIO', hex: '0x03', shortName: 'MPEG1 Audio'},
  {name: 'ISO/IEC 13818-3 Audio', code: 'STANDARD_13818_3_AUDIO', hex: '0x04', shortName: 'MPEG2 Audio'},
  {name: 'ISO/IEC 13818-1 private sections', code: 'STANDARD_13818_1_PRIVATE', hex: '0x05', shortName: 'MPEG2 Private'},

  {name: 'ISO/IEC 13522 MHEG', code: 'STANDARD_13522_MHEG', hex: '0x07', shortName: 'MHEG'},
  {name: 'ISO/IEC 13818-1 Annex A DSM-CC', code: 'STANDARD_DSM_CC', hex: '0x08', shortName: 'Annex A DSM-CC'},
  {name: 'ITU-T Rec. H.222.1', code: 'STANDARD_H_222_1', hex: '0x09', shortName: 'H.222.1'},
  {name: 'ISO/IEC 13818-6 type A', code: 'STANDARD_13818_6_TYPE_A', hex: '0x0A', shortName: 'MPE'},
  {name: 'ISO/IEC 13818-6 type B', code: 'STANDARD_13818_6_TYPE_B', hex: '0x0B', shortName: 'DSM-CC U-N'},

  {name: 'ISO/IEC 13818-6 type C', code: 'STANDARD_13818_6_TYPE_C', hex: '0x0C', shortName: 'DSM-CC Stream'},
  {name: 'ISO/IEC 13818-6 type D', code: 'STANDARD_13818_6_TYPE_D', hex: '0x0D', shortName: 'DSM-CC Sections'},
  {name: 'ISO/IEC 13818-1 auxiliary"', code: 'STANDARD_13818_1_AUX', hex: '0x0E', shortName: 'Aux'},
  {name: 'ISO/IEC 13818-7 ADTS Audio', code: 'STANDARD_13818_7_ADTS', hex: '0x0F', shortName: 'ADTS Audio'},
  {name: 'MPEG-4 Part 2 (ISO/IEC 14496-2)', code: 'STANDARD_14496_2_VISUAL', hex: '0x10', shortName: 'MPEG4'},

  {name: 'ISO/IEC 14496-3 LATM', code: 'STANDARD_14496_3_LATM', hex: '0x11', shortName: 'LATM'},
  {name: 'ISO/IEC 14496-1 PES packets', code: 'STANDARD_14496_1_PES', hex: '0x12', shortName: 'MPEG4 PES'},
  {name: 'ISO/IEC 14496-1 Sections', code: 'STANDARD_14496_1_SECTIONS', hex: '0x13', shortName: 'MPEG4'},
  {
    name: 'ISO/IEC 13818-6 Synchronized Download Protocol',
    code: 'STANDARD_13818_6_SDP',
    hex: '0x14',
    shortName: 'MPEG2 Data'
  },
  {name: 'H.264 (ISO/IEC 14496-10)', code: 'STANDARD_14496_H264', hex: '0x1B', shortName: 'H.264'},

  {name: 'HEVC (ITU-T Rec. H.265 and ISO/IEC 23008-2)', code: 'STANDARD_23008_HEVC', hex: '0x24', shortName: 'HEVC'},
  {name: 'A/90 Data Service & Network Table', code: 'STANDARD_ATSC_90', hex: '0x95', shortName: 'A90 Data'},
  {name: 'A/90 PES synchronous data', code: 'STANDARD_ATSC_90_PES', hex: '0xC2', shortName: 'A90 PES'},
  {name: 'ISO/IEC 13818-1 Reserved', code: 'STANDARD_13818_1_RESERVED', hex: '0x7F', shortName: 'MPEG2 Reserved'},
  {name: 'SCTE 35 Splice Info', code: 'SCTE_35_SPLICE_INFO', hex: '0x86', shortName: 'DPI Stream'},

  {name: 'User Private', code: 'USER_PRIVATE', hex: '0xFF', shortName: 'User Private'}
];


export const ExtensionTypeArray = [
  {code: 'UNKNOWN', image: 'ImageResource.TD_LOGO.getIcon()', boolean: true, name: 'Unknown'},
  {code: 'CAPABILITIES', image: 'ImageResource.RINGS.getIcon()', boolean: true, name: 'Capabilities'},
  {code: 'DRM_SYSTEM_ID', image: 'ImageResource.TD_LOGO.getIcon()', boolean: true, name: 'DRM System Id'},
  {code: 'SERVICE_ID', image: '', boolean: true, name: 'Service Id'},
  {code: 'INET_URL', image: 'ImageResource.ETHERNET.getIcon()', boolean: true, name: 'Broadband Signaling'},
  {code: 'SIMULCAST_TSID', image: 'ImageResource.MIRROR.getIcon()', boolean: true, name: 'Simulcast TSID'},
  {code: 'OTHER_BSID', image: 'ImageResource.PIE_CHART.getIcon()', boolean: true, name: 'Other BSID"'},
  {code: 'GENRE', image: 'ImageResource.GENRE.getIcon()', boolean: true, name: 'Genre'},
  {
    code: 'BROADBAND_SERVICE_ICON',
    image: 'ImageResource.BROADBAND_IMAGE.getIcon()',
    boolean: true,
    name: 'Broadband Service Icon'
  },
  {
    code: 'BROADCAST_SERVICE_ICON',
    image: 'ImageResource.IMAGE.getIcon()',
    boolean: true,
    name: 'Broadcast Service Icon'
  },
  {code: 'BONDED_BSIDS', image: 'ImageResource.LINKS.getIcon()', boolean: true, name: 'Bonded BSID'},
  {code: 'BASE_URL', image: 'ImageResource.HOME_PLATE.getIcon()', boolean: true, name: 'Base URL'},
  {code: 'BASE_PATTERN', image: 'ImageResource.PATTERN.getIcon()', boolean: true, name: 'Base Pattern'},
  {
    code: 'USER_DEFINED_ATSC3_MESSAGE',
    image: 'ImageResource.BOOK.getIcon()',
    boolean: true,
    name: 'User Defined ATSC3 Message'
  },
  {code: 'CP', image: 'ImageResource.POINT.getIcon()', boolean: true, name: 'LCT Codepoint'},
  {code: 'CCI', image: 'ImageResource.BUG.getIcon()', boolean: true, name: 'UnkLCT CCI'},
  {code: 'LANGUAGE', image: 'ImageResource.LANGUAGE.getIcon()', boolean: true, name: 'Language'},
];

export const ratingRegionType = [
  {region: 'USA', code: 'USA', number: 1},
  {region: 'Canada', code: 'CANADA', number: 2},
  {region: 'USA & Canada', code: 'USA_CANADA', number: 3},
];






