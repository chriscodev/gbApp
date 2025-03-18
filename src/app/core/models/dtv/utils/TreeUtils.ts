// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import {formatDate} from './DateTimeUtils';
import {RFC5646_LANGUAGE_TAGS} from './RFC5646LangCodes';
import {TreeElement} from './TreeElement';
import {isDefined, isUndefined} from './Utils';

/*
 * Utils for MPD parsing and formatting.
 *
 * @class TreeUtils
 * @constructor
 */

export function noNull(n: string | number | boolean): string | number | boolean {
  return n === null ? undefined : n;
}

export function formatInt(i: number): string {
  return (i === undefined) ? undefined : `${i}`;
}

export function formatBoolean(b: boolean): string {
  return (b === undefined) ? undefined : `${b}`;
}

// TODO don't use this, use more specific calls beneath this one, or do what fieldString() does
export function formatTreeItem(name: string, value: string): string {
  if (isUndefined(name) || isUndefined(value) || value.length === 0) {
    return '';
  }
  return `<li><span class="mpdTreeNodeInfoLabel">${name}:</span> <span class="mpdTreeNodeInfo">${value}</span></li>`;
}

export function formatTreeItemBasic(name: string, value: string): string {
  if (isUndefined(name) || isUndefined(value) || value.length === 0) {
    return '';
  }
  return `<li><span class='mpdTreeNodeInfoLabelBasic'>${name}:</span> <span class="mpdTreeNodeInfo">${value}</span></li>`;
}

export function formatTreeItemString(name: string, value: string): string {
  return formatTreeItem(name, value);
}

export function formatTreeItemNumber(name: string, value: number): string {
  return formatTreeItem(name, formatInt(value));
}

export function formatTreeItemDate(name: string, value: Date): string {
  return formatTreeItem(name, formatDate(value));
}

export function formatTreeItemBoolean(name: string, value: boolean): string {
  return formatTreeItem(name, formatBoolean(value));
}

export function isArrayEmpty(a: {}[]): boolean {
  return isDefined(a) ? a.length === 0 : false;
}

export function formatLang(langCode: string): string {
  return isDefined(langCode) ? RFC5646_LANGUAGE_TAGS[langCode] + ' (' + langCode + ')' : undefined;
}

export function fieldString(name: string, value: string | number | boolean | Date, indent: string = ''): string {
  if (value === undefined) {
    return '';
  }
  return `${indent}${name}: ${value}`;
}

export function appendFieldString(s: string, name: string, value: string | number | boolean | Date,
                                  indent: string = ''): string {
  const child: string = fieldString(name, value, indent);
  if (child.length === 0) {
    return s;
  }
  return `${s}\n${child}`;
}

export function childrenString(name: string, children: TreeElement[] | string[] | TreeElement,
                               indent: string = ''): string {
  if (children === undefined) {
    return '';
  }

  if (!Array.isArray(children)) {
    return `${children.toString(indent)}`;
  }

  if (children.length === 0) {
    return '';
  }

  if (typeof children[0] === 'string') {
    return (children as string[]).reduce((result: string, e: string) => result + indent + e, '');
  }

  return (children as TreeElement[]).reduce((result: string, e: TreeElement) => result + e.toString(indent), '');
}

export function appendChildString(s: string, name: string, children: TreeElement[] | string[] | TreeElement,
                                  indent: string = ''): string {
  const child: string = childrenString(name, children, indent);
  return child.length === 0 ? s : `${s}\n${child}`;
}

export function getFormattedTimeShort(timevalue: number, timescale?: number): string {
  if (timevalue === undefined) {
    return undefined;
  }
  const timeValueInSeconds: number = isDefined(timescale) ? timevalue / timescale : undefined;

  return isDefined(timeValueInSeconds) ?
    `${timeValueInSeconds.toFixed(3)}s` : formatInt(timevalue);
}

export function getFormattedTimeLong(timevalue: number, timescale?: number): string {
  if (timevalue === undefined) {
    return undefined;
  }
  return `${(getFormattedTimeShort(timevalue, timescale))} (${timevalue})`;
}
