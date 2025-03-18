export class Networking {
  hostname: string;
  ipsettings: Settings[];
}

export class Settings {
  name: string;
  address: string;
  gateway: string;
  mac: string;
  nameServers: Array<string>;
  netmask: string;
  type: string;
}

export class NetworkingSettings {
  networkSettings: Networking;
  restartServer: boolean;
}
