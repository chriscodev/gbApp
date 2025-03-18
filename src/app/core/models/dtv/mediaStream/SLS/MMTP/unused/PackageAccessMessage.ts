// Copyright © 2018 Triveni Digital, Inc. All rights reserved.

/**
 * Signalling tables required for Package access, including the MMT Package (MP) table and MPI table.
 *
 * @see 10.3.2 PA Message ISO-IEC 23008-1
 */
export class PackageAccessMessage
{
   public messageID: number;
   public version: number;
   public paTable: PackageAccessTable;
   public mpiTable: object;
   public mpTable: object;
   public criTable: object;
   public dciTable: object;
}

/**
 * Information for all other signalling tables for a Package.
 */
export class PackageAccessTable
{

}
