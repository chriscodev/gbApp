// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import {PostFileRepair} from './PostFileRepair';

/**
 * Associated Procedure Description.
 *
 * Provides information regarding the HTTP file repair procedure, which may be initiated by the receiver to a
 * file repair server, after broadcast delivery of the delivery object of interest has ended, but the entire
 * object was not successfully received. The use of the file repair procedure is nominally used to support
 * broadcast delivery of NRT content, e.g., application-related files that belong to an app-based enhancement,
 * or data services such as the ESG or EAS content.
 *
 * XSD
 * ~~~~
 * 	<xs:element name="AssociatedProcedureDescription" type="APDType"/>
 *
 * 	<xs:complexType name="APDType">
 * 		<xs:sequence>
 * 			<xs:element name="PostFileRepair" type="postFileType"/>
 * 			<xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 * 		</xs:sequence>
 * 		<xs:anyAttribute processContents="skip"/>
 * 	</xs:complexType>
 * ~~~~
 *
 * @see A/331 7 SERVICE LAYER SIGNALING
 * @see A/331 7.1.7 Associated Procedure Description (APD)
 */
export class APD
{
   /**
    * Container for the temporal parameters pertaining to the file repair procedure.
    */
   public postFileRepair: PostFileRepair;

   // TODO other attributes/elements
}
