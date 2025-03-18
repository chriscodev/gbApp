/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {ATSC3Message} from './MMTP/ATSC3Message/ATSC3Message';
import {PackageMPTMessage} from './MMTP/PackageMPTMessage/PackageMPTMessage';
import {USD} from './MMTP/USD/USD';
// import {MPD} from './MPD/MPD';
import {DWD} from './ROUTE/DWD/DWD';
import {HELD} from './ROUTE/HELD/HELD';
import {RouteSLSPackageDescriptor} from './ROUTE/RouteSLSPackageDescriptor';
import {STSID} from './ROUTE/STSID/STSID';
import {USBD} from './ROUTE/USBD/USBD';
import {SLSVersion} from './SLSVersion';

export class SLSDescriptor
{
   public slsVersionDescriptor?: SLSVersion;
   public slsHELD?: HELD;
   public slsDWD?: DWD;
   public routeSLSPackageDescriptor?: RouteSLSPackageDescriptor;
  //  public routeSLSMPD?: MPD;
   public routeSLSSTSID?: STSID;
   public routeSLSUSBD?: USBD;
   public mmtpATSC3Message?: ATSC3Message;
   public mmtpUSD?: USD;
   public mmtpMPTMessage?: PackageMPTMessage;

   // TODO
   // mmtpHRBMMessage?:
   // mmtpHRBMRemovalMessage?:
}
