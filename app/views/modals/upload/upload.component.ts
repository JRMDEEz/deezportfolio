import { Component, OnInit } from '@angular/core';

const ELEMENT_DATA = [
  {
    name: 'Apple',
    location: 'Cupertino, California',
    numberOfEmployees: 132000,
    ceo: 'Tim cook',
    industry: 'Technology'
  },
  {
    name: 'Netflix',
    location: 'Los Gatos, California',
    numberOfEmployees: 5500,
    ceo: 'Reed Hastings',
    industry: 'Technology'
  },
  {
    name: 'Microsoft',
    location: 'Redmond, Washington',
    numberOfEmployees: 134944,
    ceo: 'Satya Nadella',
    industry: 'Technology'
  },
  {
    name: 'Facebook',
    location: 'Menlo park, California',
    numberOfEmployees: 35587,
    ceo: 'Mark Zuckerberg',
    industry: 'Technology'
  },
  {
    name: 'Uber',
    location: 'San fransisco, California',
    numberOfEmployees: 16000,
    ceo: 'Dara Khosrowshahi',
    industry: 'Technology'
  }
];

@Component({
  selector: 'modal-upload',
  templateUrl: './upload.template.html'
})
export class ModalUploadComponent {
  displayedColumns = [
    'select',
    'Name',
    'Location',
    '# of employees',
    'CEO',
    'Industry'
  ];
}
