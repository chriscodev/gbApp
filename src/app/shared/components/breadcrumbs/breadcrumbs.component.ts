// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbList: Array<any> = [];
  menu: Array<any> = [];
  thirdCrumbs: boolean = false;
  thirdCrumbsName: string;
  constructor(private router: Router) {
    this.menu = this.getMenu();
    this.listenRouting();

    console.log('this.router.url', this.router.url)


  }

  ngOnInit(): void {

    let path = this.router.url
    let loc = path.split("/");
    console.log('loc', loc);
    console.log('loc3', loc[3])

    if (loc[3] !== undefined) {
      this.thirdCrumbsName = '';
      this.thirdCrumbs = true;
      if (loc[3] === 'schedule-provider') {
        this.thirdCrumbsName = "Schedule Provider";

      } else if (loc[3] === 'dtv-network') {
        this.thirdCrumbsName = "DTV Network"
      }

    }

  }

  listenRouting() {
    let routerUrl: string;
    let routerList: Array<any>;
    let target: any;

    this.router.events.subscribe((_router: any) => {
      routerUrl = this.router.url;

      if (routerUrl && typeof routerUrl === 'string') {
        // breadcrumb
        target = this.menu;
        this.breadcrumbList.length = 0;

        // routing url, [0], [1] ...etc
        routerList = routerUrl
          ?.slice(1)
          ?.split('/')
          ?.filter((x) => x !== 'alarm');
        routerList?.forEach((_router, index) => {
          // menu routing
          target = target?.find((page) => page.path?.slice(2) === _router);
          if (target) {
            // breadcrumbList loop list
            this.breadcrumbList.push({
              name: target.name,
              // routing, routing
              path:
                index === 0
                  ? target.path
                  : `${this.breadcrumbList[index - 1].path
                  }/${target.path?.slice(2)}`,
            });

            if (index + 1 !== routerList.length) {
              target = target.children;
            }
          }
        });
      }
    });
  }

  getMenu(): Array<any> {
    const menu = [
      {
        name: 'Home',
        path: './main',
        children: [
          {
            name: 'Networking',
            path: './networking',
          },
          {
            name: 'Date / Time',
            path: './date-time',
          },
          {
            name: 'Users',
            path: './users',
          },
          {
            name: 'Features',
            path: './features',
          },
          {
            name: 'S/W Update',
            path: './sw-update',
          },
          {
            name: 'Certificate Request',
            path: './certificate-request',
          },
          {
            name: 'SNMP',
            path: './snmp',
          },
          {
            name: 'SMTP/Email',
            path: './smtp-email',
          },
          {
            name: 'Activity Log',
            path: './activity-log',
          },
          {
            name: 'System Health',
            path: './system-health',
          },
          {
            name: 'Networks',
            path: './networks',
          },
          {
            name: 'Network Config',
            path: './network-config',
          },
          {
            name: 'service Map',
            path: './service-map',
          },
          {
            name: 'DTV services',
            path: './dtv-services',
          },
          {
            name: 'Active Alarms',
            path: './active-alarms',
          },
          {
            name: 'Alarm Configuration',
            path: './alarm-configuration',
          },
          {
            name: 'Alarm History',
            path: './alarm-history',
          },
        ],
      },
    ];

    return menu;
  }
}
