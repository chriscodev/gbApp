/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {AbstractMutableElementsClientModel} from './AbstractClientModel';
import {Injectable} from '@angular/core';
import {UsersService} from '../services/user.service';
import {User, UsersUpdate} from './server/User';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {BehaviorSubject, Observable} from 'rxjs';
import {RequestUpdateNotification, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {MainService} from '../services/main.service';
import {GetloginSession} from './main';

@Injectable({
  providedIn: 'root'
})
export class ClientUsersModel extends AbstractMutableElementsClientModel {
  private static instanceCount = 0;
  public usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this.usersSubject.asObservable();
  public allLoginSessionsSubject: BehaviorSubject<GetloginSession> = new BehaviorSubject<GetloginSession>(null);
  public allLoginSessions$: Observable<GetloginSession> = this.allLoginSessionsSubject.asObservable();

  public constructor(private mainService: MainService,
                     private usersService: UsersService,
                     private sockStompService: SockStompService
  ) {
    super();
    console.log('ClientUsersModel constructor usersService: ', usersService, ', instanceCount: ',
      ++ClientUsersModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public async refresh() {
    console.log('ClientUsersModel refresh');
    await this.usersService.getUsers().subscribe(users => {
      this.usersSubject.next(users);
      users.forEach(user => {
        console.log('user: ', user);
      });
    });
    this.doGetAllLoginSessionRefresh();
  }

  public async update(newUsers: User[]): Promise<any> {
    console.log('ClientUsersModel update newUsers: ', newUsers);
    const elementCompareResults: DefaultElementCompareHandler<User> = this.createElementsUpdate(
      this.usersSubject.getValue(), newUsers);
    const usersUpdate: UsersUpdate = new UsersUpdate(elementCompareResults.added,
      elementCompareResults.updated,
      elementCompareResults.deletedIds);
    this.lastRequestId = uuidv4();
    await this.usersService.usersUpdate(usersUpdate, this.lastRequestId).subscribe(
      () => {
        console.log('ClientUsersModel update complete, refreshing...');
        this.refresh();
      },
      (error) => {
        console.log('ClientUsersModel update ERROR', error);
      }
    );
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientUsersModel notifyStompEvent topic: ', topic, ', messageJson: ',
      messageJson, ', this.lastRequestId: ', this.lastRequestId);
    // Refresh if from other client and successful
    if (topic === StompVariables.stompChannels.notifyUsersUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      if (this.lastRequestId !== requestUpdateNotification.requestId &&
        requestUpdateNotification.success) {
        console.log('ClientUsersModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ',
          requestUpdateNotification, ', this.lastRequestId: ', this.lastRequestId);
        this.refresh();
      }
    }
  }

  private doGetAllLoginSessionRefresh(): void {
    this.mainService.getAllSessions().subscribe(allLoginSessions => {
      this.allLoginSessionsSubject.next(allLoginSessions);
    });
  }
}
