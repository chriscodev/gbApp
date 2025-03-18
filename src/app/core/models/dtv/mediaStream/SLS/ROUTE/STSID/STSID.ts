/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {ROUTESession} from './ROUTESession';

/**
 * Service-based Transport Session Instance Description (S-TSID)
 *
 * Provides component acquisition information associated with one Service. It also provides mapping
 * between DASH Representations found in the MPD and in the TSI corresponding to the component of
 * the Service. The S-TSID can provide component acquisition information in the form of a TSI and
 * the associated DASH Representation identifier carrying DASH Segments associated with the DASH
 * Representation. By the TSI value, the receiver collects the audio/video components from the Service
 * and begins buffering DASH Segments then applies the appropriate decoding processes.
 *
 * XML
 * ~~~~
 * <?xml version=\"1.0\" encoding=\"UTF-8\"?>
 * <S-TSID xmlns=\"tag:atsc.org,2016:XMLSchemas/ATSC3/Delivery/S-TSID/1.0/\"
 *      xmlns:afdt=\"tag:atsc.org,2016:XMLSchemas/ATSC3/Delivery/EFDT/1.0/\"
 *      xmlns:fdt=\"urn:ietf:params:xml:ns:fdt\">
 *  <RS dIpAddr=\"239.10.31.62\" dport=\"8000\">
 *   <LS tsi=\"10\" startTime=\"2018-04-01T00:00:00Z\">
 *     <SrcFlow rt=\"true\">
 *       <EFDT version=\"0\">
 *         <FileTemplate>video/$TOI$.m4s</FileTemplate>
 *         <FDTParameters>
 *           <fdt:File Content-Location=\"video/video_init.mp4\" TOI=\"4294967295\"/>
 *         </FDTParameters>
 *       </EFDT>
 *       <ContentInfo>0</ContentInfo>
 *       <Payload codePoint=\"128\" formatID=\"1\" frag=\"0\" order=\"1\" srcFecPayloadID=\"1\"/>
 *     </SrcFlow>
 *   </LS>
 *   <LS tsi=\"20\" startTime=\"2018-04-01T00:00:00Z\">
 *     <SrcFlow rt=\"true\">
 *       <EFDT version=\"0\">
 *          <FileTemplate>audio/$TOI$.m4s</FileTemplate>
 *          <FDTParameters>
 *            <fdt:File Content-Location=\"audio/audio_init.mp4\" TOI=\"4294967295\"/>
 *          </FDTParameters>
 *       </EFDT>
 *       <ContentInfo>1</ContentInfo>
 *       <Payload codePoint=\"128\" formatID=\"1\" frag=\"0\" order=\"1\" srcFecPayloadID=\"1\"/>
 *    </SrcFlow>
 *     </LS>
 *  </RS>
 * </S-TSID>
 * ~~~~
 *
 * XSD
 * ~~~~
 *  <xs:element name="S-TSID" type="stsid:STSIDType"/>
 *
 *  <xs:complexType name="STSIDType">
 *    <xs:sequence>
 *      <xs:element name="RS" type="stsid:rSessionType" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 *
 * @see A/331 7 SERVICE LAYER SIGNALING
 * @see 7.1.4 Service-based Transport Session Instance Description (S-TSID) A/331 (http://www.atsc.org/wp-content/uploads/2016/02/S33-174r1-Signaling-Delivery-Sync-FEC.pdf)
 */
export class STSID extends TreeElement {
  /**
   *
   * XML: 1 or more
   */
  public routeSessions: ROUTESession[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.routeSessions);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'S-TSID';
  }

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof STSID &&
      ROUTESession.isEqualArray(this.routeSessions, a.routeSessions);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    let result = `${indent}${this.nodeTitle()}:`;
    result = appendChildString(result, 'ROUTE sessions', this.routeSessions, newIndent);
    return result;
  }
}
