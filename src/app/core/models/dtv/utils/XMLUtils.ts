// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export class XMLUtils {
  public static parseISODuration(d: string): string {
    if (d === undefined) {
      return '';
    }

    const regex: RegExp = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
    const matches: RegExpMatchArray = d.match(regex);
    const years: number = parseFloat(matches[3] || '0');
    const months: number = parseFloat(matches[5] || '0');
    const weeks: number = parseFloat(matches[7] || '0');
    let days: number = parseFloat(matches[9] || '0');
    let hours: number = parseFloat(matches[12] || '0');
    let minutes: number = parseFloat(matches[14] || '0');
    let seconds: number = parseFloat(matches[16] || '0');

    if (weeks > 0) {
      days += 7 * weeks;
    }
    if (seconds > 59) {
      minutes += Math.floor(seconds / 60);
      seconds %= 60;
    }
    if (minutes > 59) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }
    if (hours > 24) {
      days += Math.floor(hours / 24);
      hours %= 24;
    }

    let result = '';
    if (years > 0) {
      result += `${years}y`;
    }
    if (months > 0) {
      result += `${months}M`;
    }
    if (weeks > 0) {
      result += `${weeks}w`;
    }
    if (days > 0) {
      result += `${days}d`;
    }
    if (hours > 0) {
      result += `${hours}h`;
    }
    if (minutes > 0) {
      result += `${minutes}m`;
    }
    if (seconds > 0) {
      result += `${seconds.toFixed(3)}s`;
    }

    if (result === '') {
      result = '0s';
    }

    return result;
  }

  public static interpretISODuration(d: string): string {
    if (d === undefined || d === null || d.length === 0) {
      return '';
    }
    if (!Number.isNaN(parseInt(d, 10))) {
      return `${d}`;
    }
    return `${XMLUtils.parseISODuration(d)} (${d})`;
  }
}
