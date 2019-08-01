import { Component, OnInit } from '@angular/core';
import { CompareService } from '../../services/compare.service';

@Component({
  selector: 'app-compare-clouds',
  templateUrl: './compare-clouds.component.html',
  styleUrls: ['./compare-clouds.component.scss'],
  providers:[CompareService],
  animations : []
})
export class CompareCloudsComponent implements OnInit {

  regions :any;
  showCloud : boolean = false;
  showDetailsModal : boolean = false;
  showBtn : boolean = true;
  nodes : any[] = [];
  cloudDetails : any[] = [];
  cloudRegions : any[] = [];
  diffPercent : any[] = [];
  costDiff : any[] = [];
  cloudsLoaded : boolean;
  showCompare : boolean;

  detailsResponse : any[] = [];

  images = ["awst.png", "gcpt.png", "pkst.png","azuret.png"];

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
  
  constructor(private compareService : CompareService) { }

  ngOnInit() {

    this.setDefault();
    this.cloudsLoaded = false;
    //this.showCompare = false;
    this.showCompare = true;

    this.regions = this.compareService.getRegions().subscribe(response => {
      this.showCompare = true;
      console.log("Regions for clouds" + response);
    });

  }

  setDefault(){

    this.cloudRegions = [
      {
        cloud : "Amazon Web Services",
        cloudName : "aws",
        region : ["us-east-1", "us-west-1", "us-east-2", "	us-west-2", "ap-east1", "ap-south-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1"],
        selectedRegion : "us-east-1"
      },
      {
        cloud : "Microsoft Azure",
        cloudName : "azure",
        region : ["eastus", "westus", "westus2", "australiaeast", "eastasia", "southeastasia", "centralus", "eastus2", "northcentralus", "southcentralus", "notheurope", "westeurope", "southindia", "centralindia", "westindia"] ,
        selectedRegion : "eastus"     
      },
      {
        cloud : "Google Cloud Platform",
        cloudName : "gcp",
        region : ["us-east1", "us-west1","asia-east1","asia-east2","asia-northeast1","asia-southeast1","us-east1","us-east4","europe-west1","us-west1"],
        selectedRegion : "us-east1"      
      },
      {
        cloud : "Pivotal Container Service",
        cloudName : "pks",
        region : ["US-East-1", "US-West-2", "EU-West-1"],
        selectedRegion : "US-East-1"
      }
    ];
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
  
  showClouds(){

    this.showBtn = false;
    this.cloudsLoaded = true;
    this.showCloud = true;
     
    for(let cd of this.cloudDetails){
      cd.costDiff = (cd.existingCost - cd.totalCost);
      cd.costPercent = ((cd.costDiff / cd.existingCost) * 100).toFixed(2);
    }
    
    /*
    for(var c in this.cloudRegions ){
      this.sendCloudRegion.push({
        'cloud': this.cloudRegions[c].cloud,
        'region': this.selectedRegions[c]
      });
    }
    */
    this.compareService.regions = this.cloudRegions;

    this.compareService.sendCloudRegion(this.cloudRegions).subscribe(data => {
      /*
      for(let cd of this.cloudDetails){
        cd.costDiff = (cd.existingCost - cd.totalCost);
        cd.costPercent = ((cd.costDiff / cd.existingCost) * 100).toFixed(2);
      }*/
        this.cloudDetails = data;
        this.cloudsLoaded = false;
    });
  }

  showDetails(cloud){
    this.nodes = cloud.nodes;
    this.showDetailsModal = true;
  }

  back(){
    this.showBtn = true;
    this.showCloud = false;
    this.cloudsLoaded = false;
    this.setDefault();
  }
}