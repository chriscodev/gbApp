// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export enum SigningType {
  UNSIGNED = 'UNSIGNED',
  ALREADY_SIGNED = 'ALREADY_SIGNED',
  SIGN_AS_AUTHOR = 'SIGN_AS_AUTHOR',
  SIGN_AS_DISTRIBUTOR = 'SIGN_AS_DISTRIBUTOR',
  SIGN_AS_BOTH = 'SIGN_AS_BOTH'
}

export interface SingingTypeWithDisplayName {
  readonly signingType: SigningType;
  readonly displayName: string;
}

export const SIGNING_TYPES: SingingTypeWithDisplayName[] = [
  {signingType: SigningType.UNSIGNED, displayName: 'Unsigned'},
  {signingType: SigningType.ALREADY_SIGNED, displayName: 'Already Signed'},
  {signingType: SigningType.SIGN_AS_AUTHOR, displayName: 'Sign As Author'},
  {signingType: SigningType.SIGN_AS_DISTRIBUTOR, displayName: 'Sign As Distributor'},
  {signingType: SigningType.SIGN_AS_BOTH, displayName: 'Sign As Both'}
];

export class SigningAttributes {
  public constructor(public signingType: SigningType, public authorCertId: number, public distributorCertId: number) {
  }
}
export class DefaultSigningAttributes extends SigningAttributes {
  public constructor() {
    super(SigningType.UNSIGNED, 0, 0);
  }
}
