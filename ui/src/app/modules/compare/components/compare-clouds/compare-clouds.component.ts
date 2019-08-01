import { Component, OnInit } from '@angular/core';
import { CloudRegion } from './cloud-region';
import { CompareService } from '../../services/compare.service';
import { Observable } from 'rxjs';
import { CloudDetails } from './cloud-details';
import { setDefaultService } from 'selenium-webdriver/opera';

@Component({
  selector: 'app-compare-clouds',
  templateUrl: './compare-clouds.component.html',
  styleUrls: ['./compare-clouds.component.scss'],
  providers:[CompareService]
})
export class CompareCloudsComponent implements OnInit {

  regions :any;
  showCloud : boolean = false;
  detailsL = ["CPU", "Memory", "CPU Cost", "Memory Cost", "Total Cost"];
  showDetailsModal : boolean = false;
  showBtn : boolean = true;
  showBack : boolean = false;

  cloudDetails : any[] = [];
  cloudRegions : any[] = [];
  diffPercent : any[] = [];
  costDiff : any[] = [];

  detailsResponse : any[] = [];

  sendCloudRegion : any[] = [];

  images = ["awst.png", "gcpt.png", "pkst.png", "azuret.png"];

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

  cardColors = [
    "'backgroudColor' : '#E1F1F6'",
    "'backgroudColor' : '#FEF3B5'",
    "'backgroudColor' : '#F5DBD9'",
    "'backgroudColor' : '#DFF0D0'",
  ]
  
  constructor(private compareService : CompareService) { }

  ngOnInit() {

    this.setDefault();

    this.regions = this.compareService.getRegions().subscribe(response => {
      console.log("Regions for clouds" + response);
    });

  }

  setDefault(){
    this.sendCloudRegion = [{
      "region":"us-east-1",
      "cloud" : "aws"
    },
    {
        "region":"westus",
        "cloud" : "azure"
    },{
      "region":"us-east1",
      "cloud":"gcp"
    },
    {
      "region":"US-East-1",
      "cloud":"pks"
    }
    ];

    this.cloudRegions = [
      {
        cloudName : "Amazon Web Services",
        cloud : "aws",
        region : ["us-east-1", "us-west-1"],
        selectedRegion : "us-east-1"
      },
      {
        cloudName : "Google Cloud Platform",
        cloud : "gcp",
        region : ["us-east1", "us-west1"],
        selectedRegion : "us-east1"      
      },
      {
        cloudName : "Pivotal Container Service",
        cloud : "pks",
        region : ["US-East-1", "US-West-2"],
        selectedRegion : "US-East-1"
      },
      {
        cloudName : "Microsoft Azure",
        cloud : "azure",
        region : ["eastus", "westus"] ,
        selectedRegion : "eastus"     
      }
    ];
    this.cloudDetails = [
      {
        cloud : "AWS",
        cpu : 1,
        cpuCost : 100,
        memory : 20,
        memoryCost : 40,
        totalCost : 500,
        existingCost : 20
      },
      {
        cloud : "GCP",
        cpu : 1,
        cpuCost : 100,
        memory : 20,
        memoryCost : 40,
        totalCost : 300,
        existingCost : 100
      },
      {
        cloud : "PKS",
        cpu : 1,
        cpuCost : 100,
        memory : 20,
        memoryCost : 40,
        totalCost : 100,
        existingCost : 200
      },
      {
        cloud : "Azure",
        cpu : 1,
        cpuCost : 100,
        memory : 20,
        memoryCost : 40,
        totalCost : 200,
        existingCost : 120
      }
    ]
    /*
    var c;
    for(c = 0;c < this.cloudRegions.length; c++){
        this.selectedRegions[c] = "US-East-1";
    }
    */
    console.log("------default-------" + JSON.stringify(this.cloudRegions))  
  }
  
  showClouds(){

    this.showBtn = false;
    this.showCloud = true;
    this.showBack = true;
    
    this.compareService.sendCloudRegion(this.cloudRegions).subscribe(data => {
        console.log(data);
        this.cloudDetails = data;
        this.calculateChangeInCost();
    });

    console.log("--------cost Percent-------" + JSON.stringify(this.cloudDetails));
  }
  calculateChangeInCost(){
    for(let cd of this.cloudDetails){
      cd.existingCost = 1;
      cd.costDiff = (cd.totalCost - cd.existingCost).toFixed(2);
      cd.costPercent = ((cd.costDiff / cd.totalCost) * 100).toFixed(2);
      console.log("-----percent total cost---" + JSON.stringify(cd.totalCost));
      console.log("-----peercent cost diff---" + JSON.stringify(cd.costDiff));
      console.log("-----cost percent ---" + JSON.stringify(cd.costPercent));
    } 
  }
  showDetails(){
    this.showDetailsModal = true;
  }
  back(){
    this.showBtn = true;
    this.showCloud = false;
    this.showBack = false;

    this.setDefault();
  }
}