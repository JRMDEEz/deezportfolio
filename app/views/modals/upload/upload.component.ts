import { Component, OnInit } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import {
  MatTableDataSource,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef
} from "@angular/material";

import { ModalHelperService } from "../modal-helper.service";

const ELEMENT_DATA = [
  {
    name: "Apple",
    location: "Cupertino, California",
    numberOfEmployees: 132000,
    ceo: "Tim cook",
    industry: "Technology"
  },
  {
    name: "Netflix",
    location: "Los Gatos, California",
    numberOfEmployees: 5500,
    ceo: "Reed Hastings",
    industry: "Technology"
  },
  {
    name: "Microsoft",
    location: "Redmond, Washington",
    numberOfEmployees: 134944,
    ceo: "Satya Nadella",
    industry: "Technology"
  },
  {
    name: "Facebook",
    location: "Menlo park, California",
    numberOfEmployees: 35587,
    ceo: "Mark Zuckerberg",
    industry: "Technology"
  },
  {
    name: "Uber",
    location: "San fransisco, California",
    numberOfEmployees: 16000,
    ceo: "Dara Khosrowshahi",
    industry: "Technology"
  }
];

@Component({
  selector: "modal-companies",
  templateUrl: "./modal-companies.component.html",
  styleUrls: ["./modal-companies.component.css"]
})
export class ModalUploadComponent {
  displayedColumns = [
    "select",
    "Name",
    "Location",
    "# of employees",
    "CEO",
    "Industry"
  ];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  selection = new SelectionModel(true, []);

  constructor(
    public dialogRef: MatDialogRef<ModalUploadComponent>,
    public modalHelperService: ModalHelperService
  ) {}

  save = () => this.modalHelperService.save();
  filter = () => this.modalHelperService.filter();
  sort = () => this.modalHelperService.sort();
  masterToggle = (selection, dataSource) =>
    this.modalHelperService.masterToggle(selection, dataSource);
  isAllSelected = (selection, dataSource) =>
    this.modalHelperService.isAllSelected(selection, dataSource);
}
