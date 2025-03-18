/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/**
 * General utilities for the app.
 *
 * @see ts/Tests/Utils.Tests.js
 */
export class Utils
{
   public static httpRequest: XMLHttpRequest = new XMLHttpRequest();
   public static counter = 0;
   public static delay = 5000; // interval between pings
   public static connectedSeconds = 0;
   public static disconnectedSeconds = 0;
   public static pingURL = '/api/json/ping';
   public static loginURL = 'index.html';

   /** HTML escape char map. */
   public static readonly htmlCharMap: { [ key: string ]: string } =
      { '<' : '&lt;', '>' : '&gt;', '"' : '&quot;', '&' : '&amp;', '\'' : '&#39;' };

   /** XML escape char map. */
   public static readonly xmlCharMap: { [ key: string ]: string } =
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;', '/': '&#x2F;', '`': '&#x60;',
         ' ': '&nbsp;', '=': '&#x3D;', '\n': '<br/>', '\t': '&nbsp;&nbsp;&nbsp;' };
}

/**
 * Generate an int between the given parameters, inclusive.
 *
 */
export function getRandomInt( min: number, max: number ): number
{
   if ( min === undefined || max === undefined || min > max ) { return undefined; }
   if ( min === max ) { return min; }

   const topMin: number = Math.ceil( min );
   const bottomMax: number = Math.floor( max );
   const scale: number = bottomMax - topMin + 1;
   const r: number = Math.random() * scale;
   return Math.floor( r ) + topMin;
}

// assumes both arrays are similarly sorted
export function arrayEquals( a: {}[], b: {}[] ): boolean
{
   if ( a === undefined && b === undefined ) { return true; }
   if ( a === undefined || b === undefined ) { return false; }

   return a.length === b.length && a.every( ( v, i ) => v === b[ i ] );
}

export function splitOnSpaces( s: string ): number[]
{
   return s?.length > 0 ? s.split( ' ' ).map( ( n: string ) => parseInt( n, 10 ) ) : [];
}

export function splitOnSpacesToStrings( s: string ): string[]
{
   return s?.length > 0 ? s.split( ' ' ) : [];
}

export function allDefined( ...vars: any[] ): boolean
{
   return vars.reduce( ( acc, v ) => acc && ( v !== undefined && v !== null ), true );
}

export function isDefined( value: {} ): boolean
{
   return value !== undefined && value !== null;
}

export function allUndefined( ...vars: any[] ): boolean
{
   return vars.reduce( ( acc, v ) => acc && ( v === undefined || v === null ), true );
}

export function anyUndefined( ...vars: any[] ): boolean
{
   return vars.reduce( ( acc, v ) => acc || ( v === undefined || v === null ), false );
}

export function isUndefined( value: {} ): boolean
{
   return !isDefined( value );
}

export function notEmpty( value: {} ): boolean
{
   return Array.isArray( value ) ? value?.length > 0 : false;
}

export function isEmpty( value: {} ): boolean
{
   return !notEmpty( value );
}

export function escapeHTML( s: string ): string
{
   return s.replace( /[<>"&']/g, ( c: string ) => Utils.htmlCharMap[ c ] );
}

export function escapeXML( s: string ): string
{
   return s.replace( /[&<>"'`=/ \n\t]/g, ( c: string ) => Utils.xmlCharMap[ c ] );
}

export function checkUndefinedCompatible( a: {}, b: {} ): boolean
{
   return ( a === undefined && b === undefined ) || ( isDefined( a ) && isDefined( b ) );
}

export function sameOwnProps( a: any, b: any ): boolean
{
   if ( a === undefined && b === undefined ) { return true; }

   const aProps: string[] = Object.getOwnPropertyNames( a );
   const bProps: string[] = Object.getOwnPropertyNames( b );

   if ( aProps.length !== bProps.length ) {
      console.log( `sameOwnProps differ length aProps.length ${aProps.length} bProps.length ${bProps.length}` );
      console.log( `showing props...` );
     // tslint:disable-next-line:no-shadowed-variable
      for ( const a of aProps )
      {
         console.log( `sameOwnProps a prop ${a}` );
      }
     // tslint:disable-next-line:no-shadowed-variable
      for ( const b of bProps )
      {
         console.log( `sameOwnProps b prop ${b}` );
      }
      return false;
   }
   for ( const propName of aProps )
   {
      if ( a[ propName ] !== b[ propName ] ) {
         console.log( `sameOwnProps differ propName ${propName} a ${a[ propName ]} b ${b[ propName ]}` );
         return false;
      }
   }

   return true;
}

/**
 * Decorator function to check that all parameters to the method are defined.
 *
 */
export function LogUndefinedArgs( target: any, methodName: string | symbol, descriptor: PropertyDescriptor ): PropertyDescriptor
{
   const originalMethod: any = descriptor.value;
   descriptor.value = function(): any
   {
      for ( const a of arguments ) { if ( isUndefined( a ) ) { console.log( 'undefined argument' ); } }
      return originalMethod.apply( this, arguments );
   };

   return descriptor;
}

/**
 * Log to console name of method, value and type of each parameter and returned value with its type.
 */
export function LogMethod( target: any, methodName: string, descriptor: PropertyDescriptor ): void
{
   const originalMethod: any = descriptor.value;
   descriptor.value = function(): any
   {
      const v: any = originalMethod.apply( this, arguments );
      const args: any = Array.prototype.map.call( arguments, arg => `${ JSON.stringify( arg ) }%c: "${ typeof arg }"%c` ).join( ', ' );

      const styles: any[] = [];
      Array.from( arguments ).forEach( () => { styles.push( 'font-style: italic' ); styles.push( 'font-style: normal' ); } );
      const value: string = ( typeof v === 'undefined' ) ? 'void' : `%c${ JSON.stringify( v ) }%c: "${ valueTypeName( v ) }"`;
      console.log( `method %c${methodName}%c = ( ${args} ) => ${value}\n`,
                   'font-style: italic',
                   'font-style: normal',
                   ...styles,
                   'font-style: italic',
                   'font-style: normal' );

      return v;
   };
}

export function valueTypeName( v: any ): string
{
   return Array.isArray( v ) ? 'Array' : typeof v;
}

/**
 * Log to console what instance is created.
 *
 * <pre>
 * Example:
 * @LogClass
 * class LoggedClass
 * {
 *    ...
 * }
 * </pre>
 *
 * @param target - class being logged
 */
export function LogClass( target: any ): void
{
   console.log( `Created class %c${target.name}%c.\n`,
                'font-style: italic',
                'font-style: normal' );
}

/**
 * Log name of method class, method name, and parameter index.
 *
 * <pre>
 * Example:
 * public Method( a: string, @LogParam b: number ): void
 * {
 *    ...
 * }
 * </pre>
 */
export function LogParam( target: any, methodName: string, i: number ): void
{
   console.log( `class %c${ target.constructor.name ?? target.prototype.name }%c, ` +
                         `method %c${ methodName }%c, ` +
                         `${ i + 1 }${ numberEnding( i + 1 )} parameter\n`,
                'font-style: italic',
                'font-style: normal',
                'font-style: italic',
                'font-style: normal' );
}

export function numberEnding( n: number ): string
{
   switch ( Math.abs( n ) )
   {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
   }
}

export function bytesToSize( bytes: number ): string
{
   const sizes: string[] = [' Bytes', ' KB', ' MB', ' GB', ' TB'];
   // if ( bytes === 0 ) { return 0 }
   const i: number = parseInt( Math.floor( Math.log( bytes ) / Math.log( 1024 ) ).toString(), 10 );
   if ( i === 0 ) { return `${bytes} ${sizes[i]}`; }
   return `${( bytes / ( 1024 ** i ) ).toFixed( 1 )}${sizes[i]}`;
}


// @ts-ignore
// tslint:disable-next-line:adjacent-overload-signatures
export declare function isUndefined(value: any): value is undefined;

export function isEmptyValue(value: any) {
  return (
    isUndefined(value) || // Checks for null or undefined
    (typeof value === 'string' && !value.trim()) || // Empty or whitespace-only string
    (Array.isArray(value) && value.length === 0) || // Empty array
    (typeof value === 'object' && Object.keys(value).length === 0) // Empty object
    );
  }
