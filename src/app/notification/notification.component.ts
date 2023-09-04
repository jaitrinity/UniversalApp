import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared/service/SharedService';
import { ToastrService } from 'ngx-toastr';
import { LayoutComponent } from '../layout/layout.component';
import { Title } from '@angular/platform-browser';
import { Constant } from '../shared/constant/Contant';
import { CommonFunction } from '../shared/service/CommonFunction';
declare var $: any;

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  subject = "";
  redirectURL = "";
  description = "";
  roleList = [];
  selectedRoleList = [];
  isChecked : boolean = false
  employeeList = [];
  selectedEmployeeList = [];
  videoBase64 : any = "";
  imageBase64 : any = "";
  multiSelectdropdownSettings = {};
  alertFadeoutTime = 0;
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

  ngOnInit(): void {
    this.multiSelectdropdownSettings = {
      singleSelection: false,
      idField: 'paramCode',
      textField: 'paramDesc',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 0,
      allowSearchFilter: true
    };
    this.getAllList();
  }

  getAllList(){
    this.sharedService.getAllList('forNotificationTab', this.tenentId)
    .subscribe((response) =>{
      // console.log(response);
      this.roleList = response.roleList;
      this.employeeList = response.empList;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getAllList"),"Alert !",{timeOut : this.alertFadeoutTime});
    });
  }

  changeListener($event, i): void {
    this.readThis($event.target, i);
  }
  
  readThis(inputValue: any, optionNumber): void {
    var file: File = inputValue.files[0];
    // console.log(file);
    let wrongFile = false;
    let fileName = file.name;
    let fileSize = file.size; // 
    if(optionNumber == 1 && !(fileName.indexOf(".mp4") > -1)){
      this.toastr.warning("only .mp4 format accepted, please choose right file.","Alert !");
      wrongFile = true;
    }
    else if(optionNumber == 1 && fileSize/1024/1024 > 10){
      this.toastr.warning("video size should be less then 10 MB, please choose right file.","Alert !");
      wrongFile = true;
    }
    else if(optionNumber == 2 && !(fileName.indexOf(".jpg") > -1 || fileName.indexOf(".jpeg") > -1 || fileName.indexOf(".png") > -1)){
      this.toastr.warning("only .jpg, .jpeg, .png format accepted, please choose right file.","Alert !");
      wrongFile = true;
    }
    else if(optionNumber == 2 && fileSize/1024 > 500){
      this.toastr.warning("Image size should be less then 500 KB, please choose right file.","Alert !");
      wrongFile = true;
    }
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      let image = myReader.result;
      if (optionNumber == 1) {
        this.videoBase64 = image;
        if(wrongFile){
          $("#videoBase64").val("");
          this.videoBase64 = "";
        }
      }
      else if (optionNumber == 2) {
        this.imageBase64 = image;
        if(wrongFile){
          $("#imageBase64").val("");
          this.imageBase64 = "";
        }
      }
    }
    myReader.readAsDataURL(file);
  }

  submitNotificationData(){
    if(this.subject == ""){
      this.toastr.warning("please enter subject value","Alert !",{timeOut : this.alertFadeoutTime});
      return false;
    }
    else if(this.description == ""){
      this.toastr.warning("please enter description value","Alert !",{timeOut : this.alertFadeoutTime});
      return false;
    }
    else if(this.imageBase64 == "" && this.videoBase64 == ""){
      this.toastr.warning("please upload Image or Video","Alert !",{timeOut : this.alertFadeoutTime});
      return false;
    }
    else if(this.isChecked && this.selectedEmployeeList.length == 0){
      this.toastr.warning("please select atleast one employee","Alert !",{timeOut : this.alertFadeoutTime});
      return false;
    }
    else if(!this.isChecked && this.selectedRoleList.length == 0){
      this.toastr.warning("please select atleast one role","Alert !",{timeOut : this.alertFadeoutTime});
      return false;
    }
    let role = "";
    let employee = "";
    if(this.isChecked){
      employee = CommonFunction.createCommaSeprate(this.selectedEmployeeList);
    }
    else{
      role = CommonFunction.createCommaSeprate(this.selectedRoleList);
    }
    let jsonData = {
      subject : this.subject,
      redirectURL : this.redirectURL,
      description : this.description,
      imageBase64 : this.imageBase64,
      videoBase64 : this.videoBase64,
      employee : employee,
      role : role,
      isChecked : this.isChecked,
      tenentId : this.tenentId
    }
    this.layoutComponent.ShowLoading = true
    this.sharedService.submitDataByInsertType(jsonData,"insertNotification")
    .subscribe((response) =>{
      //console.log(response);
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        this.setDefaultAllField();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submitNotificationData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  setDefaultAllField(){
    this.subject = "";
    this.redirectURL = "";
    this.description = "";
    this.selectedRoleList = [];
    this.isChecked = false
    this.selectedEmployeeList = [];
    this.videoBase64 = "";
    this.imageBase64 = "";
  }

}
