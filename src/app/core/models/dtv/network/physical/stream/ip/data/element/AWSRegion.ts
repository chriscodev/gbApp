// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export enum AWSRegions {
  AF_SOUTH_1 = 'AF_SOUTH_1',
  AP_EAST_1 = 'AP_EAST_1',
  AP_NORTHEAST_1 = 'AP_NORTHEAST_1',
  AP_NORTHEAST_2 = 'AP_NORTHEAST_2',
  AP_NORTHEAST_3 = 'AP_NORTHEAST_3',
  AP_SOUTH_1 = 'AP_SOUTH_1',
  AP_SOUTHEAST_1 = 'AP_SOUTHEAST_1',
  AP_SOUTHEAST_2 = 'AP_SOUTHEAST_2',
  CA_CENTRAL_1 = 'CN_NORTH_1',
  CN_NORTH_1 = 'CN_NORTH_1',
  CN_NORTHWEST_1 = 'CN_NORTHWEST_1',
  EU_CENTRAL_1 = 'EU_CENTRAL_1',
  EU_NORTH_1 = 'EU_NORTH_1',
  EU_SOUTH_1 = 'EU_SOUTH_1',
  EU_WEST_1 = 'EU_WEST_1',
  EU_WEST_2 = 'EU_WEST_2',
  EU_WEST_3 = 'EU_WEST_3',
  ME_SOUTH_1 = 'ME_SOUTH_1',
  SA_EAST_1 = 'SA_EAST_1',
  US_EAST_1 = 'US_EAST_1',
  US_EAST_2 = 'US_EAST_2',
  US_WEST_1 = 'US_WEST_1',
  US_WEST_2 = 'US_WEST_2'
}
export interface AWSRegionsWithDisplayName {
  readonly awsRegion: AWSRegions;
  readonly displayName: string;
}
export const AWS_REGIONS: AWSRegionsWithDisplayName[] = [
  {awsRegion: AWSRegions.AF_SOUTH_1, displayName: 'Africa (Cape Town)'},
  {awsRegion: AWSRegions.AP_EAST_1, displayName: 'Asia Pacific (Hong Kong)'},
  {awsRegion: AWSRegions.AP_NORTHEAST_1, displayName: 'Asia Pacific (Tokyo)'},
  {awsRegion: AWSRegions.AP_NORTHEAST_2, displayName: 'Asia Pacific (Seoul)'},
  {awsRegion: AWSRegions.AP_NORTHEAST_3, displayName: 'Asia Pacific (Osaka)'},
  {awsRegion: AWSRegions.AP_SOUTH_1, displayName: 'Asia Pacific (Mumbai)'},
  {awsRegion: AWSRegions.AP_SOUTHEAST_1, displayName: 'Asia Pacific (Singapore)'},
  {awsRegion: AWSRegions.AP_SOUTHEAST_2, displayName: 'Asia Pacific (Sydney)'},
  {awsRegion: AWSRegions.CA_CENTRAL_1, displayName: 'Canada (Central)'},
  {awsRegion: AWSRegions.CN_NORTH_1, displayName: 'China (Beijing)'},
  {awsRegion: AWSRegions.CN_NORTHWEST_1, displayName: 'China (Ningxia)'},
  {awsRegion: AWSRegions.EU_CENTRAL_1, displayName: 'Europe (Frankfurt)'},
  {awsRegion: AWSRegions.EU_NORTH_1, displayName: 'Europe (Stockholm)'},
  {awsRegion: AWSRegions.EU_SOUTH_1, displayName: 'Europe (Milan)'},
  {awsRegion: AWSRegions.EU_WEST_1, displayName: 'Europe (Ireland)'},
  {awsRegion: AWSRegions.EU_WEST_2, displayName: 'Europe (London)'},
  {awsRegion: AWSRegions.EU_WEST_3, displayName: 'Europe (Paris)'},
  {awsRegion: AWSRegions.ME_SOUTH_1, displayName: 'Middle East (Bahrain)'},
  {awsRegion: AWSRegions.SA_EAST_1, displayName: 'South America (SÃ£o Paulo)'},
  {awsRegion: AWSRegions.US_EAST_1, displayName: 'US East (N. Virginia)'},
  {awsRegion: AWSRegions.US_EAST_2, displayName: 'US East (Ohio)'},
  {awsRegion: AWSRegions.US_WEST_1, displayName: 'US West (N. California)'},
  {awsRegion: AWSRegions.US_WEST_2, displayName: 'US West (Oregon)'}
];
