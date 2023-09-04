export class EmpLocMappingNonEditTableSetting{
    public static setting = {
        mode: 'external',
        hideSubHeader: false,
        actions: {
          position: 'right',
          add: false,
          edit : false,
          delete : false
        },
        pager :{
          perPage : 10
        },
        columns: {
          state:{
            title : 'State'
          },
          city:{
            title : 'City'
          },
          area:{
            title : 'Area'
          },
          locName: {
            title: 'Location name',
          },
          empName :{
            title : 'Employee Name',
          },
          geoCoordinate: {
            title: 'Geo-coordingate'
          }
        }
    }
}