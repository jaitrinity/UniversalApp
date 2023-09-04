import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { SharedService } from '../shared/service/SharedService';
import { Constant } from '../shared/constant/Contant';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('100ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('100ms', style({transform: 'translateX(100%)', opacity: 0}))
        ])
      ]
    )
  ],
})
export class LayoutComponent implements OnInit {
  //Toogle Variable for the sidenav.
  ToggleVariable = true;
  //Toogle variable for searchbar.
  ToggledSearch = false;

  ShowLoading = false;
  loginEmpId : string = "";
  empName : string;
  loginEmpRole : string = "";
  empRoleId : string;
  tenentId = "";
  public menuTopList = [];
  public menuList = [];
  constructor(private router : Router,private sharedService : SharedService) { 
    this.loginEmpId = localStorage.getItem("empId");
    this.empName = localStorage.getItem("empName");
    this.empRoleId = localStorage.getItem("empRoleId");
    this.loginEmpRole = localStorage.getItem("loginEmpRole");
    this.tenentId = localStorage.getItem("tenentId");
  }

  ngOnInit(): void {
    this.loadMenuList();
    this.loadTopMenuList();
    setTimeout(() => {
      if(this.loginEmpRole != 'Admin'){
        let firstMenuId = localStorage.getItem("firstMenuId");
        this.router.navigate(['/layout/menu-submenu/'+firstMenuId]);
      }
    }, 100);
  }

  Logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  loadTopMenuList(){
    let jsonData = {
      loginEmpId : this.loginEmpId,
      loginEmpRole : this.loginEmpRole,
      tenentId : this.tenentId
    }
    this.sharedService.getHeaderMenu(jsonData)
    .subscribe( (response) =>{
      //console.log(response);
      this.menuTopList = response.headerMenuList;
      for(let i=0;i<this.menuTopList.length;i++){
        localStorage.setItem(this.menuTopList[i].routerLink,this.menuTopList[i].menuName);
      }
  },
    (error)=>{
      
    })
  }

  loadMenuList(){
    var jsonStr = {
      loginEmpId:this.loginEmpId,
      empRoleId:this.empRoleId,
      loginEmpRole:this.loginEmpRole,
      tenentId:this.tenentId
    }
    //console.log(jsonStr);
    this.menuList = [];
    this.sharedService.getMenuListByRoleName(jsonStr)
    .subscribe( (response) =>{
      // console.log(response);
        if(response.responseCode === Constant.SUCCESSFUL_STATUS_CODE){
          this.menuList = response.wrappedList;
          for(let i=0;i<this.menuList.length;i++){
            let catId = this.menuList[i].menuId;
            let catName = this.menuList[i].menuName;
            if(i==0){
              localStorage.setItem("firstMenuId",catId);
            }
            localStorage.setItem(catId,catName);
          }
        }
        else{
         
        }
  },
    (error)=>{
      
    })

  }

}
