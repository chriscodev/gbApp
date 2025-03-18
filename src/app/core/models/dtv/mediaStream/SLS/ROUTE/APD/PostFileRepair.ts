// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

/**
 * Container for the temporal parameters pertaining to the file repair procedure.
 *
 * XSD
 * ~~~~
 * 	<xs:complexType name="postFileType">
 * 		<xs:attribute name="offsetTime" type="xs:unsignedLong"/>
 * 		<xs:attribute name="randomTimePeriod" type="xs:unsignedLong" use="required"/>
 * 		<xs:anyAttribute processContents="strict"/>
 * 	</xs:complexType>
 * ~~~~
 */
export class PostFileRepair
{
   /**
    * A first wait interval for the receiver related to the file repair procedure.
    *
    * XML: unsigned long, optional
    */
   public offsetTime: number;

   /**
    * A second wait interval for the receiver related to the file repair procedure.
    *
    * XML: unsigned long, required
    */
   public randomTimePeriod: number;

   // TODO other attributes
}
