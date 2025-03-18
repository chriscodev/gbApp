/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';

interface FlatNode {
  expandable: boolean;
  data: any;
  level: number;
}

@Component({
  selector: 'app-modal-tree-view',
  templateUrl: './modal-tree-view.component.html',
  styleUrl: './modal-tree-view.component.scss'
})
export class ModalTreeViewComponent implements OnInit, OnChanges{
  @Input() treeData: any;
  @Input() headers: any;
  @Input() treeType: string;
  @Output() selectedNode: EventEmitter<any> = new EventEmitter();
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );
  private transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      data: node.data,
      level,
    };
  }

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = [];
    console.log(this.transformer);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit() {
    console.log(this.treeData);
    if (isDefined(this.treeData)){
      this.dataSource.data = this.treeData;
      this.treeControl.expandAll();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if inputData has changed
    if (changes.treeData && !changes.treeData.firstChange) {
      // Perform actions here
      console.log('Input data has been filled out:', this.treeData);
      this.dataSource.data = this.treeData;
      this.treeControl.expandAll();
    }
  }

  selectNode(event: any){
    this.treeData.forEach(item => {
      item.data.active = false;
      item.children.forEach(child => {
        child.data.active = false;
      });
    });
    event.active = true;
    this.selectedNode.emit(event);
  }

}



