// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

export class User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  token: string;
  loggedInTime: string;
}

export class GetUsers {
  id: number;
  name: string;
  password: string;
  privilegeLevel: string;
}

export class UserAtomic {
  addedUsers: GetUsers[];
  updatedUsers: GetUsers[];
  deletedUserIds: Array<number>;
}


export class LoginUser {
  username: string;
  password: string;
}
