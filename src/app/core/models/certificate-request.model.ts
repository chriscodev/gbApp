export class CertificateRequest {
  class: string;
  commonName: string;
  country: string;
  csr: string;
  id: number;
  keyHash: string;
  keyType: string;
  locality: string;
  name: string;
  nameHash: string;
  organization: string;
  publicKey: string;
  state: string;
}

export class GetCertificateRequest {
  id: number;
  name: string;
  keyType: string;
  country: string;
  locality: string;
  organization: string;
  commonName: string;
}

export class CertificateRequestPostAtomic {
  addedUsers: GetCertificateRequest[];
  updatedUsers: GetCertificateRequest[];
  deletedUserIds: Array<number>;
}
