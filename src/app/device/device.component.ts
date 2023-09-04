import { Component, OnInit } from '@angular/core';
import { Constant } from '../shared/constant/Contant';
import { SharedService } from '../shared/service/SharedService';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DeviceTableSetting } from '../shared/tableSettings/DeviceTableSetting';
import { LayoutComponent } from '../layout/layout.component';
import { Title } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {
  
  alertFadeoutTime = 0;
  deviceList = [];
  deviceTableSettings = DeviceTableSetting.setting;
  loginEmpId = "";
  loginEmpRole = "";
  tenentId = "";
  button = "";
  color1 = "";
  color2 = "";
  constructor(private router: Router,private sharedService : SharedService,
    private toastr: ToastrService, private layoutComponent : LayoutComponent,
    private titleService:Title) {
    this.loginEmpId = localStorage.getItem("empId");
    this.loginEmpRole = localStorage.getItem("loginEmpRole");
    this.alertFadeoutTime = Constant.ALERT_FADEOUT_TIME;
    this.tenentId = localStorage.getItem("tenentId");
    this.button = localStorage.getItem("button");
    this.color1 = localStorage.getItem("color1");
    this.color2 = localStorage.getItem("color2");
    let menuName = localStorage.getItem(this.router.url.substring(8))
    this.titleService.setTitle(localStorage.getItem("appName")+" : "+menuName);
   }

  ngOnInit() {
    setTimeout(() => {
      $("ng2-smart-table thead").css('background-color',this.color1);
    }, 100);
    this.getAllDeviceList();
    //this.updateRouterSequence();
  }
  updateRouterSequence(){
    let jsonData = {
      loginEmpId : this.loginEmpId,
      currentRouter : this.router.url
    }
    this.sharedService.actionOnDataByUpdateType(jsonData,'routerSequence')
    .subscribe((response) =>{
      // console.log(response);
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("updateRouterSeq"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }
  getAllDeviceList(){
    this.deviceList = [];
    let jsonData = {
      "loginEmpId" : this.loginEmpId,
      "loginEmpRole" : this.loginEmpRole,
      "tenentId" : this.tenentId
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllDeviceList(jsonData)
    .subscribe((response) =>{
      //console.log(response);
      this.deviceList = response.deviceList;
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submitAssignData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  actionOnDevice(event,action){
    let isConfirm = confirm("Do you want to change?");
    if(isConfirm){
      let deviceId = event.data.deviceId;
      let jsonData = {
        "deviceId" : deviceId,
        "action" : action
      }
      this.layoutComponent.ShowLoading = true;
      this.sharedService.actionOnDevice(jsonData)
      .subscribe((response) =>{
        if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
          this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
          this.getAllDeviceList();
        }
        else{
          this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        }
        this.layoutComponent.ShowLoading = false;
        
      },
      (error)=>{
        this.toastr.warning(Constant.returnServerErrorMessage("submitAssignData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      });
    }
  }

  searchDeviceData(){
    this.getAllDeviceList();
  }


}
