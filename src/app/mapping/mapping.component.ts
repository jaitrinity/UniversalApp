import { Component, OnInit } from '@angular/core';
import { Constant } from '../shared/constant/Contant';
import { MappingTableSetting } from '../shared/tableSettings/MappingTableSetting';
import { Router } from '@angular/router';
import { SharedService } from '../shared/service/SharedService';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { CommonFunction } from '../shared/service/CommonFunction';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LayoutComponent } from '../layout/layout.component';
import { Title } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.css']
})
export class MappingComponent implements OnInit {
  
  alertFadeoutTime = 0;
  inProgress = false;
  categorySubcategoryCaptionList = [];
  categoryList = [];
  selectedCategoryList = [];
  subCategoryList = [];
  selectedSubcategoryList = [];
  captionList =[];
  selectedCaptionList = []
  employeeList = [];
  selectedEmployeeList = [];
  menuList = [];
  selectedMenuList = [];
  locationList = [];
  selectedLocationList = [];
  verifierList = [];
  selectedVerifierList = [];
  approverList = [];
  selectedApproverList = [];
  mappingList = [];
  stateList = [];
  selectedStateList = [];
  cityList = [];
  selectedCityList = [];
  areaList = [];
  selectedAreaList = [];
  minStartDate = "";
  startDate = "";
  endDate = "";
  loginEmpId = "";
  loginEmpRole = "";
  tenentId = "";
  button = "";
  color1 = "";
  color2 = "";
  level = 0;
  mappingTableSettings = MappingTableSetting.setting;
  multiSelectdropdownSettings = {};
  singleSelectdropdownSettings = {};
  constructor(private router: Router,private sharedService : SharedService,
    private toastr: ToastrService,private datePipe: DatePipe, 
    private layoutComponent : LayoutComponent, private titleService:Title) { 
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
    this.minStartDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    setTimeout(() => {
      $("ng2-smart-table thead").css('background-color',this.color1);
      $(".mapping_location").attr("title","Click me to show ? details.");
      $(".mapping_location").click(function(){
        $("#mappingInfoModal").modal({
          backdrop : 'static',
          keyboard : false
        });
      })
    }, 100);

    this.getAllList();
    this.getAllMappingList();
    this.getStateCityAreaList("state");
    //this.updateRouterSequence();
  }

  onSelectOrDeselectState(item){
    this.cityList = [];
    this.selectedCityList = [];
    this.areaList = [];
    this.selectedAreaList = [];
    if(this.selectedStateList.length == 0){
      return ;
    }
    this.getStateCityAreaList('city');
  }
  onSelectOrDeselectCity(item){
    this.areaList = [];
    this.selectedAreaList = [];
    if(this.selectedCityList.length == 0){
      return ;
    }
    this.getStateCityAreaList('area');
  }
  onSelectOrDeselectArea(item){}

  onSelectAllOrDeselectAllCity(item){
    this.selectedCityList = item;
    this.areaList = [];
    this.selectedAreaList = [];
    if(this.selectedCityList.length == 0){
      return ;
    }
    this.getStateCityAreaList('area');
  }
  onSelectAllOrDeselectAllArea(item){}

  getStateCityAreaList(searchType : any){
    let jsonData = {
      loginEmpId : this.loginEmpId,
      tenentId : this.tenentId,
      searchType : searchType,
      state : CommonFunction.createCommaSeprate(this.selectedStateList),
      city : CommonFunction.createCommaSeprate(this.selectedCityList)
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
      else if(searchType == 'city'){
        let cityResponse = response.city;
        let tempCityList = [];
        for(let i=0;i<cityResponse.length;i++){
          let cityJson = {
            paramCode : cityResponse[i],
            paramDesc : cityResponse[i]+" "
          }
          tempCityList.push(cityJson);
        }
        this.cityList = tempCityList;
      }
      else if(searchType == 'area'){
        let areaResponse = response.area;
        let tempAreaList = [];
        for(let i=0;i<areaResponse.length;i++){
          let areaJson = {
            paramCode : areaResponse[i],
            paramDesc : areaResponse[i]+" "
          }
          tempAreaList.push(areaJson);
        }
        this.areaList = tempAreaList;
      }
      
         
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getStateCityAreaList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  makeBlank(fieldId){
    $(fieldId).val("");
  }

  closeModal(){
    $("#mappingInfoModal").modal("hide");
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

  onSelectOrDeselectEmployee(item: any){
    this.createNewVerifiedList();
  }

  findLevelOfChecklist(){
    if(this.categoryList.length != 0){
      this.level = 1;
    }
    else{
      this.level = 0;
    }
    if(this.level == 1 && this.subCategoryList.length != 0){
      this.level = 2;
    }
    if(this.level == 2 && this.captionList.length != 0){
      this.level = 3;
    }
    // console.log(this.level);
  }

  onSelectCategory(item){
    this.subCategoryList = [];
    this.selectedSubcategoryList = [];
    this.captionList = [];
    this.selectedCaptionList = [];

    let selectedCategory = item.paramDesc;

    let subCateList = [];
    for(let i=0;i<this.categorySubcategoryCaptionList.length;i++){
      let menuId = this.categorySubcategoryCaptionList[i].menuId;
      let category = this.categorySubcategoryCaptionList[i].category;
      let subcategory = this.categorySubcategoryCaptionList[i].subcategory;
      let findIndex = subCateList.findIndex(x => x.paramDesc === subcategory);
      if(subcategory != '' && category === selectedCategory && findIndex === -1){
        let json = {
          paramCode : menuId,
          paramDesc : subcategory
        }
        subCateList.push(json);
      }
      
    }
    this.subCategoryList = subCateList;
      // console.log(i+" : "+findIndex)     
  }

  onDeselectCategory(item){
    this.subCategoryList = [];
    this.selectedSubcategoryList = [];
    this.captionList = [];
    this.selectedCaptionList = [];
  }

  onSelectSubcategory(item){
    this.captionList = [];
    this.selectedCaptionList = [];

    let selectedSubcategory = item.paramDesc;

    let capList = [];
    for(let i=0;i<this.categorySubcategoryCaptionList.length;i++){
      let menuId = this.categorySubcategoryCaptionList[i].menuId;
      let subcategory = this.categorySubcategoryCaptionList[i].subcategory;
      let caption = this.categorySubcategoryCaptionList[i].caption;
      let findIndex = capList.findIndex(x => x.paramDesc === caption);
      if(caption != '' && subcategory === selectedSubcategory && findIndex === -1){
        let json = {
          paramCode : menuId,
          paramDesc : caption
        }
        capList.push(json);
      }
      
    }
    this.captionList = capList;

  }
  onDeselectSubcategory(item){
    this.captionList = [];
    this.selectedCaptionList = [];
  }

  onSelectOrDeselectCaption(item){}

  createNewVerifiedList(){
    this.verifierList = [];
    this.selectedVerifierList = [];
    this.approverList = [];
    this.selectedApproverList = [];
    let empIds = this.createCommaSeprate(this.selectedEmployeeList);
    for(let i=0;i<this.employeeList.length;i++){
      let paramCode = this.employeeList[i].paramCode;
      if(!empIds.match(paramCode)){
        this.verifierList.push(this.employeeList[i]);
      }
    }
  }
  onSelectOrDeselectVerifier(item: any){
    this.createNewApproverList();
  }

  
  createNewApproverList(){
    this.approverList = [];
    this.selectedApproverList = [];
    let empIds = this.createCommaSeprate(this.selectedVerifierList);
    for(let i=0;i<this.verifierList.length;i++){
      let paramCode = this.verifierList[i].paramCode;
      if(!empIds.match(paramCode)){
        this.approverList.push(this.verifierList[i]);
      }
    }
  }
  

  getAllMappingList(){
    this.mappingList = [];
    let jsonData = {
      "loginEmpId" : this.loginEmpId,
      "loginEmpRole" : this.loginEmpRole,
      "tenentId" : this.tenentId
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllMappingList(jsonData)
    .subscribe((response) =>{
      //console.log(response);
      this.mappingList = response.mappingList;
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getAllMappingList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  createCommaSeprate(listData : any){
    let commSeprateValue = "";
    for(let i=0;i<listData.length;i++){
      commSeprateValue += listData[i].paramCode;
      if(i != listData.length-1){
        commSeprateValue += ",";
      }
    }
    return commSeprateValue;
  }

  getAllList(){
    this.sharedService.getAllList('mapping', this.tenentId)
    .subscribe((response) =>{
      // console.log(response);
      // this.employeeList = response.empList;
      this.employeeList = response.roleList;
      this.categorySubcategoryCaptionList = response.categorySubcategoryCaptionList;
      let cateList = [];
      for(let i=0;i<this.categorySubcategoryCaptionList.length;i++){
        let menuId = this.categorySubcategoryCaptionList[i].menuId;
        let category = this.categorySubcategoryCaptionList[i].category;
        let findIndex = cateList.findIndex(x => x.paramDesc === category);
        // console.log(i+" : "+findIndex)
        if(findIndex === -1){
          let json = {
            paramCode : menuId,
            paramDesc : category
          }
          cateList.push(json);
        }
        
      }
      this.categoryList = cateList;
      this.locationList = response.locationList;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getCategorySubcategoryByRole"),"Alert !",{timeOut : this.alertFadeoutTime});
    });
  }

  submitMappingData(){
    this.findLevelOfChecklist();
    // console.log(this.level)
    if(this.level == 1 && this.selectedCategoryList.length == 0){
      this.toastr.warning("please select cateogory","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.level == 2 && this.selectedSubcategoryList.length == 0){
      this.toastr.warning("please select sub cateogory","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.level == 3 && this.selectedCaptionList.length == 0){
      this.toastr.warning("please select caption","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.selectedEmployeeList.length == 0){
      this.toastr.warning("please select employee role","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    // else if(this.selectedLocationList.length == 0){
    //   this.toastr.warning("please select location","Alert !",{timeOut : this.alertFadeoutTime});
    //   return ;
    // }
    else if(this.startDate == ""){
      this.toastr.warning("please select start date","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.endDate == ""){
      this.toastr.warning("please select end date","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    // let empIds = this.createCommaSeprate(this.selectedEmployeeList);
    let empRole = CommonFunction.createCommaSeprateByParamDesc(this.selectedEmployeeList);
    // let menuIds = this.createCommaSeprate(this.selectedMenuList);
    let menuIds = "";
    if(this.level == 1){
      menuIds = this.createCommaSeprate(this.selectedCategoryList);
    }
    else if(this.level == 2){
      menuIds = this.createCommaSeprate(this.selectedSubcategoryList);
    }
    else if(this.level == 3){
      menuIds = this.createCommaSeprate(this.selectedCaptionList);
    }
    // let locationIds = this.createCommaSeprate(this.selectedLocationList);
    // let verifierIds = this.createCommaSeprate(this.selectedVerifierList);
    // let approverIds = this.createCommaSeprate(this.selectedApproverList);

    let verifierRole = CommonFunction.createCommaSeprateByParamDesc(this.selectedVerifierList);
    let approverRole = CommonFunction.createCommaSeprateByParamDesc(this.selectedApproverList);

    let jsonData = {
      // empId : empIds,
      empRole : empRole,
      menuId : menuIds,
      // locationId : locationIds,
      state : CommonFunction.createCommaSeprate(this.selectedStateList),
      city : CommonFunction.createCommaSeprate(this.selectedCityList),
      area : CommonFunction.createCommaSeprate(this.selectedAreaList),
      startDate : this.startDate,
      endDate : this.endDate,
      // verifier : verifierIds,
      verifierRole : verifierRole,
      // approver : approverIds,
      approverRole : approverRole,
      tenentId : this.tenentId
    }
    // console.log(JSON.stringify(jsonData))
    this.layoutComponent.ShowLoading = true;
    this.inProgress = true;
    this.sharedService.submitMappingData(jsonData)
    .subscribe((response) =>{
      //console.log(response);
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        this.setDefaultField();
        this.getAllMappingList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      // this.layoutComponent.ShowLoading = false;
      this.inProgress = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submitMappingData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });

  }

  setDefaultField(){
    this.selectedEmployeeList = [];
    // this.selectedMenuList = [];
    this.selectedCategoryList = [];
    this.subCategoryList = [];
    this.selectedSubcategoryList = [];
    this.captionList = [];
    this.selectedCaptionList = [];
    this.selectedLocationList = [];
    this.verifierList = [];
    this.selectedVerifierList = [];
    this.approverList = [];
    this.selectedApproverList = [];
    this.startDate = "";
    this.endDate = "";
    this.selectedStateList = [];
    this.cityList = [];
    this.selectedCityList = [];
    this.areaList = [];
    this.selectedAreaList = [];
  }

  onCustomAction(event) {
    switch ( event.action) {
      case 'activerecord':
        this.actionOnMapping(event,1);
        break;
     case 'deactiverecord':
        this.actionOnMapping(event,0);
        break;
      case 'editrecord':
        this.editMapping(event);
        break;
    }
  }

  actionOnMapping(event,action){
    let isConfirm = confirm("Do you want to change?");
    if(isConfirm){
      let mappingId = event.data.mappingId;
      let jsonData = {
        "mappingId" : mappingId,
        "action" : action
      }
      this.layoutComponent.ShowLoading = true;
      this.sharedService.actionOnMapping(jsonData,'mapping')
      .subscribe((response) =>{
        if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
          this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
          this.getAllMappingList();
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

  closeEditModal(){
    if(!this.isDoAnyChange){
      let isConfirm = confirm("Do you want to close?");
      if(isConfirm){
        $("#editMappingModal").modal("hide");
      }
    }
    else{
      $("#editMappingModal").modal("hide");
    }
  }

  onSelectOrDeselectEditableVerifier(item: any){
    this.isDoAnyChange = false;
    this.createNewEditableApproverList("");
  }
  createNewEditableApproverList(approverId){
    this.editApproverList = [];
    this.editableSelectedApproverList = [];
    let empIds = this.createCommaSeprate(this.editableSelectedVerifierList);
    for(let i=0;i<this.editVerifierList.length;i++){
      let paramCode = this.editVerifierList[i].paramCode;
      if(!empIds.match(paramCode)){
        this.editApproverList.push(this.editVerifierList[i]);
        if(i == this.editVerifierList.length-1){
          this.createEditableSelectedApproverList(approverId);
        }
      }
    }
  }

  createEditableSelectedApproverList(approverId){
    if(approverId != null && approverId != ''){
      this.editableSelectedApproverList = [];
      for(let i=0;i<this.editApproverList.length;i++){
        let paramCode = this.editApproverList[i].paramCode;
        if(approverId == paramCode){
          this.editableSelectedApproverList.push(this.editApproverList[i]);
        }
      }
    }
  }

  isDoAnyChange : boolean = true;
  editableMappingId = "";
  editableSelectedLocationList = [];
  editVerifierList = [];
  editableSelectedVerifierList = [];
  editApproverList = [];
  editableSelectedApproverList = [];
  editMapping(event){
    this.isDoAnyChange = true;
    this.editableSelectedLocationList = [];
    this.editVerifierList = [];
    this.editableSelectedVerifierList = [];
    this.editApproverList = [];
    this.editableSelectedApproverList = [];

    this.editableMappingId = event.data.mappingId;
    let empId = event.data.empId;
    let verifierId = event.data.verifier;
    let approverId = event.data.approver;
    for(let i=0;i<this.employeeList.length;i++){
      let paramCode = this.employeeList[i].paramCode;
      if(!empId.match(paramCode)){
        this.editVerifierList.push(this.employeeList[i]);
        if(i == this.employeeList.length-1){
          this.createdEditableSelectedVerifierId(verifierId);
          if(this.editableSelectedVerifierList.length != 0){
            this.createNewEditableApproverList(approverId);
          }
        }
      }
    }

    let locIdStr = event.data.locId;
    let locIdArr = locIdStr.split(",");
    for(let i=0;i<this.locationList.length;i++){
      let loopLocId = this.locationList[i].paramCode;
      let indexOf = locIdArr.indexOf(loopLocId);
      if(indexOf >= 0){
        this.editableSelectedLocationList.push(this.locationList[i]);
      }
    }
    $("#editMappingModal").modal({
      backdrop : 'static',
      keyboard : false
    });
    // alert("edit : "+mappingId);
  }

  createdEditableSelectedVerifierId(verifierId){
    if(verifierId != null && verifierId != ''){
      this.editableSelectedVerifierList = [];
      for(let i=0;i<this.editVerifierList.length;i++){
        let paramCode = this.editVerifierList[i].paramCode;
        if(verifierId == paramCode){
          this.editableSelectedVerifierList.push(this.editVerifierList[i]);
        }
      }
    }
  }

  editMappingData(){
    let isConfirm = confirm("Do you want to change?");
    if(isConfirm){
      let editLocationId = CommonFunction.createCommaSeprate(this.editableSelectedLocationList)
      let editVerifierId = CommonFunction.createCommaSeprate(this.editableSelectedVerifierList);
      let editApproverId = CommonFunction.createCommaSeprate(this.editableSelectedApproverList);
      let mappingId = this.editableMappingId;
      let jsonData = {
        "mappingId" : mappingId,
        "locationId" : editLocationId,
        "verifierId" : editVerifierId,
        "approverId" : editApproverId,
      }
      this.layoutComponent.ShowLoading = true;
      this.sharedService.actionOnMapping(jsonData,'updateMapping')
      .subscribe((response) =>{
        if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
          this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
          this.getAllMappingList();
        }
        else{
          this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        }
        this.layoutComponent.ShowLoading = false;
        
      },
      (error)=>{
        this.toastr.warning(Constant.returnServerErrorMessage("editMappingData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      });
    }

    $("#editMappingModal").modal("hide");
  }

  openAnyModal(modalId){
    $("#"+modalId).modal({
      backdrop : 'static',
      keyboard : false
    });
  }

  closeAnyModal(modalName){
    $("#"+modalName).modal("hide");
  }
  


}
