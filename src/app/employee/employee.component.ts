import { Component, OnInit } from '@angular/core';
import { Constant } from '../shared/constant/Contant';
import { CommonFunction } from '../shared/service/CommonFunction';
import { EmployeeTableSetting } from '../shared/tableSettings/EmployeeTableSetting';
import { Router } from '@angular/router';
import { SharedService } from '../shared/service/SharedService';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { startWith, map } from 'rxjs/operators';
import { LayoutComponent } from '../layout/layout.component';
import { Title } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  
  alertFadeoutTime = 0;
  roleList = [];
  selectedRoleList = [];
  rmIdList = [];
  selectedRmIdList = [];
  employeeList = [];
  // employeeId = "";
  employeeName = "";
  mobile = "";
  secondaryMobile = "";
  // area = "";
  // city = "";
  // state = "";
  stateList = [];
  selectedStateList = [];
  isFieldUser : boolean = false;
  
  editSelectedRoleList = [];
  editEmployeeName = "";
  editMobile = "";
  editSecondaryMobile = "";
  editArea = "";
  editCity = "";
  editSelectedStateList = [];
  editState = "";
  editIsFieldUser : boolean = false;
  editSelectedRmIdList = [];

  isDoAnyChange : boolean = true;
  employeeTableSettings = EmployeeTableSetting.setting;
  tenentId = "";
  loginEmpId = "";
  loginEmpRole = "";
  button = "";
  color1 = "";
  color2 = "";
  multiSelectdropdownSettings = {};
  singleSelectdropdownSettings = {};
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
    this.multiSelectdropdownSettings = {
      singleSelection: false,
      idField: 'paramCode',
      textField: 'paramDesc',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 0,
      allowSearchFilter: true
    };
    this.singleSelectdropdownSettings = {
      singleSelection: true,
      idField: 'paramCode',
      textField: 'paramDesc',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      closeDropDownOnSelection : true
    };
    setTimeout(() => {
      $("ng2-smart-table thead").css('background-color',this.color1);
    }, 100);
    
    this.getStateCityAreaList("state");
    this.getAllList();
    this.getAllEmployeeList();
    //this.updateRouterSequence();
  }
  
  getStateCityAreaList(searchType : any){
    let jsonData = {
      loginEmpId : this.loginEmpId,
      tenentId : this.tenentId,
      searchType : searchType,
      // state : this.state.value,
      // city : this.city.value
    }
    // this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllListBySelectType(jsonData,searchType)
    .subscribe((response) =>{
      // console.log(response);
     
      if(searchType == 'state'){
        let stateResponse = response.state;
        let tempStateList = [];
        for(let i=0;i<stateResponse.length;i++){
          let stateJson = {
            paramCode : stateResponse[i],
            paramDesc : stateResponse[i]+" "
          }
          tempStateList.push(stateJson);
        }
        this.stateList = tempStateList;
      }
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getStateCityAreaList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }
  makeBlank(fieldId){
    $(fieldId).val("");
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

  getAllList(){
    this.sharedService.getAllList('employee', this.tenentId)
    .subscribe((response) =>{
      // console.log(response);
      this.roleList = response.roleList;
      this.rmIdList = response.rmIdList;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getAllList"),"Alert !",{timeOut : this.alertFadeoutTime});
    });
  }

  getAllEmployeeList(){
    this.employeeList = [];
    let jsonData = {
      "loginEmpId" : this.loginEmpId,
      "loginEmpRole" : this.loginEmpRole,
      "tenentId" : this.tenentId,
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllEmployeeList(jsonData)
    .subscribe((response) =>{
      // console.log(response);
      this.employeeList = response.employeeList;
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submitAssignData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  submitEmployeeData(){
    // if(this.employeeId == ""){
    //   this.toastr.warning("please enter employeeId value","Alert !",{timeOut : this.alertFadeoutTime});
    //   return ;
    // }
    if(this.employeeName == ""){
      this.toastr.warning("please enter employeeName value","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.selectedRoleList.length == 0){
      this.toastr.warning("please select one role","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.mobile == ""){
      this.toastr.warning("please enter mobile value","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.mobile.length != 10){
      this.toastr.warning("mobile length should be 10 digit","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    
    else if(this.secondaryMobile != ""){
      if(this.secondaryMobile.length != 10){
        this.toastr.warning("secondary mobile length should be 10 digit","Alert !",{timeOut : this.alertFadeoutTime});
        return ;
      }
    }
    else if($("#stateAuto").val() == ""){
      this.toastr.warning("please enter state ","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    // else if($("#cityAuto").val() == ""){
    //   this.toastr.warning("please enter city ","Alert !",{timeOut : this.alertFadeoutTime});
    //   return ;
    // }
    // else if($("#areaAuto").val() == ""){
    //   this.toastr.warning("please enter area ","Alert !",{timeOut : this.alertFadeoutTime});
    //   return ;
    // }

    let roleIds = CommonFunction.createCommaSeprate(this.selectedRoleList);
    let rmIds = CommonFunction.createCommaSeprate(this.selectedRmIdList);
    let isFiUser = CommonFunction.getBooleanValue(this.isFieldUser);

    let jsonData = {
      // employeeId : this.employeeId,
      employeeName : this.employeeName,
      roleId : roleIds,
      rmId : rmIds,
      mobile : this.mobile,
      secondaryMobile : this.secondaryMobile,
      // state : this.state,
      // city : this.city,
      // area : this.area,
      state : CommonFunction.createCommaSeprate(this.selectedStateList),
      // city : this.city.value,
      // area : this.area.value,
      fieldUser : isFiUser,
      tenentId : this.tenentId
    }
    //console.log(JSON.stringify(jsonData));
    this.layoutComponent.ShowLoading = true;
    this.sharedService.submitEmployeeData(jsonData)
    .subscribe((response) =>{
      //console.log(response);
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        this.setDefaultAllField();
        this.getAllEmployeeList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submitEmployeeData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  setDefaultAllField(){
    // this.employeeId = "";
    this.employeeName = ""
    this.selectedRoleList = [];
    this.selectedRmIdList = [];
    this.mobile = "";
    // this.area = "";
    // this.city = "";
    // this.state = "";
    
    this.selectedStateList = [];
    
    this.isFieldUser = false;

    this.editableEmployeeId = "";
    this.editEmployeeName = ""
    this.editSelectedRoleList = [];
    this.editSelectedRmIdList = [];
    this.editMobile = "";
    this.editArea = "";
    this.editCity = "";
    this.editState = "";
    this.editIsFieldUser = false;
  }

  onCustomAction(event) {
    switch ( event.action) {
      case 'activerecord':
        this.actionOnEmployee(event,1);
        break;
     case 'deactiverecord':
        this.actionOnEmployee(event,0);
        break;
      case 'editrecord':
        this.editEmployee(event);
        break;
    }
  }

  actionOnEmployee(event,action){
    let actionType = action == 1 ? "Activate" : "Deactivate";
    let isConfirm = confirm("Do you want to "+actionType+" this?");
    if(isConfirm){
      let id = event.data.id;
      let jsonData = {
        "id" : id,
        "action" : action
      }
      this.layoutComponent.ShowLoading = true;
      this.sharedService.actionOnEmployee(jsonData)
      .subscribe((response) =>{
        if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
          this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
          this.getAllEmployeeList();
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

  editableEmployeeId = "";
  editableId = "";
  editEmployee(event){
    this.isDoAnyChange = true;
    this.editSelectedRoleList = [];
    this.editSelectedRmIdList = [];
    this.editableId = event.data.id;
      this.editableEmployeeId = event.data.empId;
      for(let i=0;i<this.employeeList.length;i++){
        let iid = this.employeeList[i].id;
        if(iid == this.editableId){
          this.editEmployeeName = this.employeeList[i].empName;
          this.editMobile = this.employeeList[i].mobile;
          this.editSecondaryMobile = this.employeeList[i].secMobile;
          let roleId = this.employeeList[i].roleId;
          for(let j=0;j<this.roleList.length;j++){
            let roleIdParamCode = this.roleList[j].paramCode;
            if(roleIdParamCode == roleId){
              this.editSelectedRoleList.push(this.roleList[j]);
              break;
            }
          }
          this.editArea = this.employeeList[i].area;
          this.editCity = this.employeeList[i].city;
          let rmId = this.employeeList[i].rmId;
          for(let j=0;j<this.rmIdList.length;j++){
            let rmIdParamCode = this.rmIdList[j].paramCode;
            if(rmIdParamCode == rmId){
              this.editSelectedRmIdList.push(this.rmIdList[j]);
              break;
            }
          }
          this.editIsFieldUser = this.employeeList[i].fieldUser == 1 ? true : false;
          this.editState = this.employeeList[i].state;
          let editStateList = [];
          let editStateJson = {
            paramCode : this.editState,
            paramDesc : this.editState+" "
          }
          editStateList.push(editStateJson);

          this.editSelectedStateList = editStateList;
          break;
        }
      }

      //console.log(this.editSelectedRoleList);

      $("#editEmployeeModal").modal({
        backdrop : 'static',
        keyboard : false
      });
    }

    closeModal(){
      if(!this.isDoAnyChange){
        let isConfirm = confirm("Do you want to close?");
        if(isConfirm){
          $("#editEmployeeModal").modal("hide");
        }
      }
      else{
        $("#editEmployeeModal").modal("hide");
      }
      
    }

    editEmployeeData(){
      if(this.editEmployeeName == ""){
        this.toastr.warning("please enter employeeName value","Alert !",{timeOut : this.alertFadeoutTime});
        return ;
      }
      else if(this.editSelectedRoleList.length == 0){
        this.toastr.warning("please select one role","Alert !",{timeOut : this.alertFadeoutTime});
        return ;
      }
      else if(this.editMobile == ""){
        this.toastr.warning("please enter mobile value","Alert !",{timeOut : this.alertFadeoutTime});
        return ;
      }
      else if(this.editMobile.length != 10){
        this.toastr.warning("mobile length should be 10 digit","Alert !",{timeOut : this.alertFadeoutTime});
        return ;
      }
      else if(this.editSecondaryMobile != null && this.editSecondaryMobile != ""){
        if(this.editSecondaryMobile.length != 10){
          this.toastr.warning("secondary mobile length should be 10 digit","Alert !",{timeOut : this.alertFadeoutTime});
          return ;
        }
      }


      let isConfirm = confirm("Do you want to save new  info ?");
      if(!isConfirm){
        return ;
      }
      let roleIds = CommonFunction.createCommaSeprate(this.editSelectedRoleList);
      let rmIds = CommonFunction.createCommaSeprate(this.editSelectedRmIdList);
      let isFiUser = CommonFunction.getBooleanValue(this.editIsFieldUser);
      this.editState = CommonFunction.createCommaSeprate(this.editSelectedStateList);
    let jsonData = {
      // id : this.editableId,
      employeeId : this.editableEmployeeId,
      employeeName : this.editEmployeeName,
      roleId : roleIds,
      rmId : rmIds,
      mobile : this.editMobile,
      secondaryMobile : this.editSecondaryMobile,
      area : this.editArea,
      city : this.editCity,
      state : this.editState,
      fieldUser : isFiUser
    }
    //console.log(JSON.stringify(jsonData));
    this.layoutComponent.ShowLoading = true;
    this.sharedService.actionOnDataByUpdateType(jsonData,"editEmployee")
    .subscribe((response) =>{
      //console.log(response);
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        $("#editEmployeeModal").modal("hide");
        this.setDefaultAllField();
        this.getAllEmployeeList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("editEmployeeData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }
  
  closeAnyModal(modalName){
    $("#"+modalName).modal("hide");
  }
  changeSelected(e){
    $("#createEmployeeModal").modal({
      backdrop : 'static',
      keyboard : false
    });
  }
 
}
