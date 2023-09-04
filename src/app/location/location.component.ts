import { Component, OnInit } from '@angular/core';
import { Constant } from '../shared/constant/Contant';
import { LocationTableSetting } from '../shared/tableSettings/LocationTableSetting';
import { SharedService } from '../shared/service/SharedService';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import * as XLSX from 'xlsx';
import { CommonFunction } from '../shared/service/CommonFunction';
import { EmpLocMappingTableSetting } from '../shared/tableSettings/EmpLocMappingTableSetting';
import { EmpLocMappingNonEditTableSetting } from '../shared/tableSettings/EmpLocMappingNonEditTableSetting';
import { LayoutComponent } from '../layout/layout.component';
import { Title } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {
  state = new FormControl();
  stateOptions: string[] = [];
  // stateOptions: string[] = ['One', 'Two', 'Three'];
  stateFilteredOptions: Observable<string[]>;

  city = new FormControl();
  cityOptions: string[] = [];
  // cityOptions: string[] = ['a1', 'b2', 'c3'];
  cityFilteredOptions: Observable<string[]>;

  area = new FormControl();
  areaOptions: string[] = [];
  // areaOptions: string[] = ['aI', 'bII', 'cIII'];
  areaFilteredOptions: Observable<string[]>;

  stateList = [];
  selectedStateList = [];

  cityList = [];
  selectedCityList = [];

  areaList = [];
  selectedAreaList = [];

  roleList = [];
  selectedRoleList = [];

  employeeList = [];
  selectedEmployeeList = [];
  
  step : number = 4;
  isNew : boolean = true;
  alertFadeoutTime = 0;
  geoInfo = "* If manual enter Geo-coordinate, please press `Enter` key..";
  isShowMap : boolean = true;
  locationName = "";
  latitude = "";
  longitude = "";
  geoCoordinate = "";
  locationList = [];
  locationTableSettings = LocationTableSetting.setting;
  empLocMappingList = [];
  empLocMappingTableSettings = EmpLocMappingTableSetting.setting;
  empLocMappingNonEditTableSettings = EmpLocMappingNonEditTableSetting.setting;
  tenentId = "";
  loginEmpId = "";
  loginEmpRole = "";
  button = "";
  color1 = "";
  color2 = "";
  address = "";
  zoom = 12;
  lat = 28.6490059;
  lng = 77.3668853;
  editLat = 28.6490059;
  editLng = 77.3668853;

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
      $(".location_GeoCoordinate").attr("title","Click me to show ? details.");
      $(".location_GeoCoordinate").click(function(){
        $("#locationInfoModal").modal({
          backdrop : 'static',
          keyboard : false
        });
      })
    }, 100);
    
    this.getStateCityAreaList("state",0);
    this.getAllLocationList();
    this.getAllList();
    this.getEmpLocMappingList();
    //this.updateRouterSequence();
  }
  private _stateFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.stateOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
  private _cityFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cityOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
  private _areaFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.areaOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  setStep(index: number) {
    this.step = index;
  }

  onSelectionChanged(event: MatAutocompleteSelectedEvent, type : any){
    this.getStateCityAreaList(type,0);
  }

  onSelectOrDeselectState(item){
    this.cityList = [];
    this.selectedCityList = [];
    this.areaList = [];
    this.selectedAreaList = [];
    if(this.selectedStateList.length == 0){
      return ;
    }
    this.getStateCityAreaList('city',1);
  }
  onSelectOrDeselectCity(item){
    this.areaList = [];
    this.selectedAreaList = [];
    if(this.selectedCityList.length == 0){
      return ;
    }
    this.getStateCityAreaList('area',1);
  }
  onSelectOrDeselectArea(item){}

  onSelectAllOrDeselectAllCity(item){
    this.selectedCityList = item;
    this.areaList = [];
    this.selectedAreaList = [];
    if(this.selectedCityList.length == 0){
      return ;
    }
    this.getStateCityAreaList('area',1);
  }
  onSelectAllOrDeselectAllArea(item){}
  onSelectOrDeselectRole(item){
    this.employeeList = [];
    this.selectedEmployeeList = [];
    if(this.selectedStateList.length == 0 || this.selectedRoleList.length == 0){
      return ;
    }
    this.getEmployeeByCircleAndRole();
  }

  getEmpLocMappingList(){
    let jsonData = {
      loginEmpId : this.loginEmpId,
      loginEmpRole : this.loginEmpRole,
      tenentId : this.tenentId
    }
    this.sharedService.getAllListBySelectType(jsonData,"EmpLocMapping")
    .subscribe((response) =>{
      this.empLocMappingList = response.empLocMappingList;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getEmpLocMappingList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  getEmployeeByCircleAndRole(){
    let jsonData = {
      loginEmpId : this.loginEmpId,
      loginEmpRole : this.loginEmpRole,
      tenentId : this.tenentId,
      state : CommonFunction.createCommaSeprate(this.selectedStateList),
      role : CommonFunction.createCommaSeprate(this.selectedRoleList)
    }

    this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllListBySelectType(jsonData,"EmployeeByCircleAndRole")
    .subscribe((response) =>{
      //console.log(response);
      this.employeeList = response.employeeList;
      if(this.employeeList.length == 0){
        this.toastr.warning("Employee not found as per select criteria","Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getAllRoleList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  getStateCityAreaList(searchType : any, tabType : number){
    let jsonData;
    if(tabType == 0){
      jsonData = {
        loginEmpId : this.loginEmpId,
        tenentId : this.tenentId,
        searchType : searchType,
        state : this.state.value,
        city : this.city.value
      }
    }
    else if(tabType == 1){
      jsonData = {
        loginEmpId : this.loginEmpId,
        tenentId : this.tenentId,
        searchType : searchType,
        state : CommonFunction.createCommaSeprate(this.selectedStateList),
        city : CommonFunction.createCommaSeprate(this.selectedCityList)
      }
    }
    // this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllListBySelectType(jsonData,searchType)
    .subscribe((response) =>{
      // console.log(response);
     
      if(searchType == 'state'){
        this.stateOptions = response.state;
        this.stateFilteredOptions = this.state.valueChanges.pipe(
          startWith(''),
          map(value => this._stateFilter(value))
        );
        
        let tempStateList = [];
        for(let i=0;i<this.stateOptions.length;i++){
          let stateJson = {
            paramCode : this.stateOptions[i],
            paramDesc : this.stateOptions[i]+" "
          }
          tempStateList.push(stateJson);
        }
        this.stateList = tempStateList;
      }
      else if(searchType == 'city'){
        let cityResponse = response.city;
        if(tabType == 0){
          this.cityOptions = cityResponse;
          this.cityFilteredOptions = this.city.valueChanges.pipe(
            startWith(''),
            map(value => this._cityFilter(value))
          );
        }
        else if(tabType == 1){
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
      }
      else if(searchType == 'area'){
        let areaResponse = response.area;
        if(tabType == 0){
          this.areaOptions = areaResponse;
          this.areaFilteredOptions = this.area.valueChanges.pipe(
            startWith(''),
            map(value => this._areaFilter(value))
          );
        }
        else if(tabType == 1){
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
        

        
      }
      
         
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getStateCityAreaList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  makeBlank(fieldId){
    $(fieldId).val("");
  }

  getAllList(){
    this.sharedService.getAllList('location', this.tenentId)
    .subscribe((response) =>{
      // console.log(response);
      this.roleList = response.roleList;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getAllList"),"Alert !",{timeOut : this.alertFadeoutTime});
    });
  }

  closeModal(){
    $("#locationInfoModal").modal("hide");
  }
  onChooseLocation(event,id){
    // console.log(event)
    let lat = event.coords.lat;
    let lng = event.coords.lng;
    if(id==1){
      this.geoCoordinate = lat+","+lng;
      this.lat = lat; this.lng = lng;
      this.getAddressByLatLong(this.geoCoordinate);
    }
    else {
      this.editableGeoCoordinate = lat+","+lng;
      this.editLat = lat; this.editLng = lng;
      this.getAddressByLatLong(this.editableGeoCoordinate);
    }

  }
  getAddressByLatLong(latLong:string){
    this.sharedService.getAddressByLatLong(latLong)
    .subscribe((response) =>{
      // console.log(response);
      this.address = response.results[0].formatted_address;
      // console.log(this.address)
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getAddressByLatLong"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
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
  getAllLocationList(){
    this.locationList = [];
    let jsonData = {
      "loginEmpId" : this.loginEmpId,
      "loginEmpRole" : this.loginEmpRole,
      "tenentId" : this.tenentId
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllLocationList(jsonData)
    .subscribe((response) =>{
      // console.log(response);
      this.locationList = response.locationList;
      this.layoutComponent.ShowLoading = false;;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submitAssignData"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });
  }

  submitLocData(){
    if($("#stateAuto").val() == ""){
      this.toastr.warning("please enter state ","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if($("#cityAuto").val() == ""){
      this.toastr.warning("please enter city ","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if($("#areaAuto").val() == ""){
      this.toastr.warning("please enter area ","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    
    else if(this.locationName == ""){
      this.toastr.warning("please enter location name","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.geoCoordinate == ""){
      this.toastr.warning("please enter geoCoordinate value ","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.address == ""){
      this.toastr.warning(this.geoInfo,"Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    // else if(this.latitude == ""){
    //   this.toastr.warning("please enter latitude","Alert !",{timeOut : this.alertFadeoutTime});
    //   return ;
    // }
    // else if(this.longitude == ""){
    //   this.toastr.warning("please enter longitude","Alert !",{timeOut : this.alertFadeoutTime});
    //   return ;
    // }
    // this.latitude = this.geoCoordinate.split(",")[0];
    // this.longitude = this.geoCoordinate.split(",")[1];
    let jsonData = {
      state : this.state.value,
      city : this.city.value,
      area : this.area.value,
      locationName : this.locationName,
      geoCoordinate : this.geoCoordinate,
      address : this.address,
      tenentId : this.tenentId
    }
    // console.log(JSON.stringify(jsonData));
    this.layoutComponent.ShowLoading = true;
    this.sharedService.submitLocationData(jsonData)
    .subscribe((response) =>{
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        this.getStateCityAreaList("state",0);
        this.setDefaultToField();
        this.getAllLocationList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submit location data"),"Alert !",{timeOut : this.alertFadeoutTime});
    });

  }

  submitEmpLocMappingData(){
    if(this.selectedStateList.length == 0){
      this.toastr.warning("please select state","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.selectedRoleList.length == 0){
      this.toastr.warning("please select role","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.selectedEmployeeList.length == 0){
      this.toastr.warning("please select employee","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    let jsonData = {
      tenentId : this.tenentId,
      state : CommonFunction.createCommaSeprate(this.selectedStateList),
      city : CommonFunction.createCommaSeprate(this.selectedCityList),
      area : CommonFunction.createCommaSeprate(this.selectedAreaList),
      role : CommonFunction.createCommaSeprateByParamDesc(this.selectedRoleList),
      employee : CommonFunction.createCommaSeprate(this.selectedEmployeeList),
      editEmpLocId : this.editEmpLocId
    }
    
    this.layoutComponent.ShowLoading = true;
    this.sharedService.submitDataByInsertType(jsonData, 'employeeLocationMapping')
    .subscribe((response) =>{
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        // this.getStateCityAreaList("state",0);
        this.setDefaultToField();
        this.getEmpLocMappingList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submit location data"),"Alert !",{timeOut : this.alertFadeoutTime});
    });
  }

  searchLocation(id){
    // alert("dd");
    if(id == 1){
      this.lat = parseFloat(this.geoCoordinate.split(",")[0]);
      this.lng = parseFloat(this.geoCoordinate.split(",")[1]);
      this.getAddressByLatLong(this.geoCoordinate);
    }
    else{
      this.editLat = parseFloat(this.editableGeoCoordinate.split(",")[0]);
      this.editLng = parseFloat(this.editableGeoCoordinate.split(",")[1]);
      this.getAddressByLatLong(this.editableGeoCoordinate);
    }
    
  }

  arrayBuffer:any;
  importData = [];
  addfile(event)     
  {    
    let file= event.target.files[0];     
    let fileReader = new FileReader();    
    fileReader.readAsArrayBuffer(file);     
    fileReader.onload = (e) => {    
        this.arrayBuffer = fileReader.result;    
        var data = new Uint8Array(this.arrayBuffer);    
        var arr = new Array();    
        for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);    
        var bstr = arr.join("");    
        var workbook = XLSX.read(bstr, {type:"binary"});    
        var first_sheet_name = workbook.SheetNames[0];    
        var worksheet = workbook.Sheets[first_sheet_name];
        this.importData = XLSX.utils.sheet_to_json(worksheet,{raw:true});
        // console.log(imprtData);
        // console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));    
        //   var arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:true});     
        //       this.filelist = [];    
        //       console.log(this.filelist)    
      
    }    
  } 

  uploadLocData(){
    if(this.importData.length == 0){
      this.toastr.warning("please select file first ","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    this.layoutComponent.ShowLoading = true;
    let uploadLocationList = [];
    for(let i=0;i<this.importData.length;i++){
      let json = {
        srNo : this.importData[i].SrNo,
        state : this.importData[i].State,
        city : this.importData[i].City,
        area : this.importData[i].Area,
        locationName : this.importData[i].Location_Name,
        geoCoordinate : this.importData[i].LatLong,
        tenentId : this.tenentId
      }
      uploadLocationList.push(json);
    }
   
    this.sharedService.submitDataByInsertType(uploadLocationList, 'importLocation')
    .subscribe((response) =>{
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        this.getStateCityAreaList("state",0);
        this.setDefaultToField();
        this.getAllLocationList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submit location data"),"Alert !",{timeOut : this.alertFadeoutTime});
    });
  }

  downloadFormat(){
    let link = "http://trinityapplab.in/UniversalApp/files/uploadFormat/Location_Upload.xlsx";
    window.open(link);
  }

  setDefaultToField(){
    // this.isShowMap = false;
    this.locationName = "";
    this.latitude = "";
    this.longitude = "";
    this.geoCoordinate = "";
    this.address = "";
    this.lat = 28.6490059;
    this.lng = 77.3668853;
    this.state = new FormControl();
    this.city = new FormControl();
    this.area = new FormControl();
    this.importData = [];
    $("#locationFile").val("");
    this.selectedStateList = [];
    this.cityList = [];
    this.selectedCityList = [];
    this.areaList = [];
    this.selectedAreaList = [];
    this.selectedRoleList = [];
    this.employeeList = [];
    this.selectedEmployeeList = [];
    this.editEmpLocId = "0"

  }

  goToMap(){
    // window.open("https://www.google.co.in/maps","_blank");
    this.isShowMap = !this.isShowMap;
  }

  onCustomAction(event) {
    switch ( event.action) {
    //   case 'activerecord':
    //     this.actionOnEmployee(event,1);
    //     break;
    //  case 'deactiverecord':
    //     this.actionOnEmployee(event,0);
    //     break;
      case 'editrecord':
        this.editLocation(event);
        break;
      case 'editEmpLocRecord':
        this.editEmpLocRecord(event);
      break;
    }
    
  }
  editEmpLocId = "0";
  editEmpLocRecord(event){
    this.editEmpLocId = event.data.id;
    let state = event.data.state;
    let city = event.data.city;
    let area = event.data.area;
    let empId = event.data.empId;
    let empName = event.data.empName;
    let roleId = event.data.roleId;
    let roleName = event.data.roleName;

    let editStateList = [];
    let stateJson = {
      paramCode : state,
      paramDesc : state+" "
    }
    editStateList.push(stateJson);
    this.selectedStateList = editStateList;
    this.onSelectOrDeselectState(this.selectedStateList);

    if(city != ""){
      let editCityList = [];
      let cityJson = {
        paramCode : city,
        paramDesc : city+" "
      }
      editCityList.push(cityJson);
      this.selectedCityList = editCityList;
      this.onSelectOrDeselectCity(this.selectedCityList);
    }

    if(area != "" && this.selectedCityList.length !=0){
      let editAreaList = [];
      let areaJson = {
        paramCode : area,
        paramDesc : area+" "
      }
      editAreaList.push(areaJson);
      this.selectedAreaList = editAreaList;
    }

    let editRoleList = [];
    let roleJson = {
      paramCode : roleId,
      paramDesc : roleName
    }
    editRoleList.push(roleJson);
    this.selectedRoleList = editRoleList;
    this.onSelectOrDeselectRole(this.selectedRoleList);

    let editEmpList = [];
    let empJson = {
      paramCode : empId,
      paramDesc : empName
    }
    editEmpList.push(empJson);
    this.selectedEmployeeList = editEmpList;

    // this.setStep(1);
    this.openAnyModal('createEmpLocModal');
    this.isNew = false;

  }
  updateEmpLocMappingData(){
    this.submitEmpLocMappingData();
    this.isNew = true;
  }
  cancelEmpLocMappingData(){
    this.isNew = true;
    this.setDefaultToField();
  }

  closeEditModal(){
    if(!this.isDoAnyChange){
      let isConfirm = confirm("Do you want to close?");
      if(isConfirm){
        $("#editLocationModal").modal("hide");
      }
    }
    else{
      $("#editLocationModal").modal("hide");
    }
  }

  isDoAnyChange : boolean = true;
  editableLocationName = "";
  editableGeoCoordinate = "";
  editableLocationId = "";
  editLocation(event){
    this.isDoAnyChange = true;
    this.editableLocationId = event.data.locId;
    this.editableLocationName = event.data.locName;
    this.editableGeoCoordinate = event.data.geoCoordinate;
    this.address = event.data.address;
    this.editLat = parseFloat(this.editableGeoCoordinate.split(",")[0])
    this.editLng = parseFloat(this.editableGeoCoordinate.split(",")[1])

    $("#editLocationModal").modal({
      backdrop : 'static',
      keyboard : false
    });
  }

  editLocationData(){
    if(this.address == null || this.address == ""){
      this.toastr.warning(this.geoInfo,"Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    let jsonData = {
      locationId : this.editableLocationId,
      locationName : this.editableLocationName,
      geoCoordinate : this.editableGeoCoordinate,
      address : this.address
    }
    // console.log(JSON.stringify(jsonData));
    
    this.layoutComponent.ShowLoading = true;
    this.sharedService.actionOnDataByUpdateType(jsonData,'updateLocation')
    .subscribe((response) =>{
      //console.log(response);
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        this.setDefaultToField();
        this.getAllLocationList();
      }
      else{
        this.toastr.warning(response.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
      }
      this.layoutComponent.ShowLoading = false;;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("submit location data"),"Alert !",{timeOut : this.alertFadeoutTime});
    });

    $("#editLocationModal").modal("hide");
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
