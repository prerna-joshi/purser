import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { PlanInfraService } from '../../services/plan-infra.service';
import { CompareService } from 'src/app/modules/compare/services/compare.service';

@Component({
  selector: 'app-plan-infra',
  templateUrl: './plan-infra.component.html',
  styleUrls: ['./plan-infra.component.scss'],
  providers:[PlanInfraService, CompareService]
})

export class PlanInfraComponent implements OnInit {

  fileToUpload: File = null;
  showBtns = true;
  enableUpload :boolean ;
  backBtn : boolean = false;
  showCloud : boolean = false;
  cloudDetails : any[] = [];
  nodes : any[] = [];
  showDetailsModal : boolean;
  getCloudData : boolean;

  setDefault(){
    this.cloudDetails = 

    [
    
      {

    
        "cloud": "aws",
    
        "existingCost": 1000,
    
        "totalCost": 48.96,
    
        "cpuCost": 34.56,
    
        "memoryCost": 14.4,
    
        "cpu": 2,
    
        "memory": 2,
    
        "nodes": [
    
          {
    
            "instanceType": "t3.small",
    
            "os": "Windows",
    
            "totalNodeCost": 48.96,
    
            "cpuNodeCost": 34.56,
    
            "memoryNodeCost": 14.4,
    
            "cpuNode": 2,
    
            "memoryNode": 2
    
          },
          {
    
            "instanceType": "t3.small",
    
            "os": "Windows",
    
            "totalNodeCost": 48.96,
    
            "cpuNodeCost": 34.56,
    
            "memoryNodeCost": 14.4,
    
            "cpuNode": 2,
    
            "memoryNode": 2
    
          },
          {
    
            "instanceType": "t3.small",
    
            "os": "Windows",
    
            "totalNodeCost": 48.96,
    
            "cpuNodeCost": 34.56,
    
            "memoryNodeCost": 14.4,
    
            "cpuNode": 2,
    
            "memoryNode": 2
    
          },
          {
    
            "instanceType": "t3.small",
    
            "os": "Windows",
    
            "totalNodeCost": 48.96,
    
            "cpuNodeCost": 34.56,
    
            "memoryNodeCost": 14.4,
    
            "cpuNode": 2,
    
            "memoryNode": 2
    
          }
    
        ]
    

      },
    
      {
    
        "cloud": "gcp",
    
        "existingCost": 1000,
    
        "totalCost": 51.621120000000005,
    
        "cpuCost": 45.51984,
    
        "memoryCost": 6.10128,
    
        "cpu": 2,
    
        "memory": 2,
    
        "nodes": [
    
          {
    
            "instanceType": "n1-standard",
    
            "os": "linux",
    
            "totalNodeCost": 51.62112,
    
            "cpuNodeCost": 45.51984,
    
            "memoryNodeCost": 6.10128,
    
            "cpuNode": 2,
    
            "memoryNode": 2
    
          }
    
        ]
    
      },
    
      {
    
        "cloud": "pks",
    
        "existingCost": 1000,
    
        "totalCost": 74.448,
    
        "cpuCost": 69.264,
    
        "memoryCost": 5.184,
    
        "cpu": 2,
    
        "memory": 2,
    
        "nodes": [
    
          {
    
            "instanceType": "PKS-US-East-1",
    
            "os": "linux",
    
            "totalNodeCost": 74.448,
    
            "cpuNodeCost": 69.264,
    
            "memoryNodeCost": 5.184,
    
            "cpuNode": 2,
    
            "memoryNode": 2
    
          }
    
        ]
    
      },
    
      {

    
        "cloud": "azure",
    
        "existingCost": 1000,
    
        "totalCost": 59.760000000000005,
    
        "cpuCost": 34.56,
    
        "memoryCost": 25.200000000000003,
    
        "cpu": 2,
    
        "memory": 3.5,
    
        "nodes": [
    
          {
    
            "instanceType": "Basic_A2",
    
            "os": "windows",
    
            "totalNodeCost": 59.760000000000005,
    
            "cpuNodeCost": 34.56,
    
            "memoryNodeCost": 25.200000000000003,
    
            "cpuNode": 2,
    
            "memoryNode": 3.5
    
          }
        ]
      }
    ] 
  }

  cloudRegions = [
    {
      cloud : "Amazon Web Services",
      region : ["US-East-1", "US-West-2", "EU-West-1"],
      selectedRegion : "US-East-1"
    },
    {
      cloud : "Microsoft Azure",
      region : ["US-East-1", "US-West-2", "EU-West-1"] ,
      selectedRegion : "US-East-1"     
    },
    {
      cloud : "Google Cloud Platform",
      region : ["US-East-1", "US-West-2", "EU-West-1"],
      selectedRegion : "US-East-1"      
    },
    {
      cloud : "Pivotal Container Service",
      region : ["US-East-1", "US-West-2", "EU-West-1"],
      selectedRegion : "US-East-1"
    }

  ];

  images = ["awst.png", "azuret.png","gcpt.png", "pkst.png"];

  myStyles = [{
    'background-color': '#FEF3B5',
    },
    {
      'background-color': '#E1F1F6',
    },
    {
      'background-color': '#DFF0D0',
    },
    {
      'background-color': '#F5DBD9',
    }
  ]

  constructor(private planInfraService : PlanInfraService, private compareService : CompareService) { }

  ngOnInit() {
    this.enableUpload = false;
    this.getCloudData = false;
    this.setDefault();
  }

  handleFileInput(files: FileList){
    this.fileToUpload = files.item(0);
    this.enableUpload = true;
  }
  
  uploadFileToActivity() {
    this.showBtns = false;
    this.backBtn = true;
    this.showCloud = true;
    this.getCloudData = true;

    this.planInfraService.postFile(this.fileToUpload).subscribe(data => {
        console.log("Uploaded File successfully");
        this.getCloudData = false;
        this.cloudDetails = data;
        /*for(let cd of this.cloudDetails){
          cd.costDiff = (cd.existingCost - cd.totalCost);
          cd.costPercent = ((cd.costDiff / cd.existingCost) * 100).toFixed(2);
        }*/
      }, error => {
        console.log(error);
      });
  }
  back(){
    this.showBtns = true;
    this.backBtn = false;
    this.showCloud = false;
    this.enableUpload = false;
    this.getCloudData = false;
  }
  showDetails(cloud){
    this.nodes = cloud.nodes;
    this.showDetailsModal = true;
  }
}