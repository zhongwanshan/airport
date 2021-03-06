/**
 * @description: 项目配置文件
 */
var CONFIG = (function (CONFIG) {
    // 服务器信息配置
    // CONFIG.HOST = LOCATION;
    // CONFIG.HOST = "https://www.minguicloud.com";
    CONFIG.HOST = "https://test2.cityeasyplay.com";
    // 
    // 接口服务
    CONFIG.SERVICE = {
        "userService": "/airportCore/base/userService", // 用户服务
        "deptService": "/airportCore/base/deptService", // 部门服务
        "areaService": "/airportCore/core/areaService", // 防区服务
        "groupService": "/airportCore/base/groupService", // 业务组服务
        "commonService": "/airportCore/base/commonService", // 基础服务
        "deviceService": "/airportCore/core/deviceService", // 设备服务
        "companyService": "/airportCore/base/companyService", // 公司服务
        "vehicleService": "/airportCore/core/vehicleService", // 车辆服务
        "deptUserService": "/airportCore/base/deptUserService", // 部门服务
        "permissionService": "/airportCore/base/permissionService", // 权限服务
        "vehicleRepairService": "/airportCore/core/vehicleRepairService", // 车辆保养
        "providerService": "/airportCore/third/providerService", // 设备商
        "alarmService": "/airportCore/core/alarmService", // 系统报警
        "sysParaService": "/airportCore/base/sysParaService", // 系统参数列
        "vehicleModelService": "/airportCore/base/vehicleModelService", // 车辆型号
    };

    // 接口动作
    CONFIG.ACTION = {
        // commonService： 基础服务
        "getCityList": "getCityList", // 获取城市列表接口
        "getBizParam": "getBizParam", // 获取业务枚举值接口
        "getDistrictList": "getDistrictList", // 获取区县列表接口
        "getProvinceList": "getProvinceList", // 获取省份列表接口

        // companyService： 公司服务
        "getCompany": "getCompany", // 根据ID获取公司信息
        "delCompany": "delCompany", // 删除公司接口 
        "saveCompany": "saveCompany", // 新增/修改公司接口
        "getCompanyList": "getCompanyList", // 获取公司列表数据接口

        // deptService：部门服务
        "getDept": "getDept", // 根据部门ID获取部门信息接口
        "delDept": "delDept", // 删除部门接口
        "saveDept": "saveDept", // 新增修改部门接口
        "getDeptList": "getDeptList", // 获取部门列表数据接口
        "getDeptTreeList": "getDeptTreeList", // 获取部门列表数据接口（树型结构）

        // deptUserService：部门用户
        "delDeptUser": "delDeptUser", // 删除部门员工接口
        "saveDeptUser": "saveDeptUser", // 新增部门员工接口
        "getDeptUserList": "getDeptUserList", // 获取部门员工列表数据接口

        // userService：用户服务
        "getUser": "getUser", // 根据ID获取用户信息接口
        "delUser": "delUser", // 删除用户接口 
        "saveUser": "saveUser", // 新增修改用户接口
        "userLogin": "userLogin", // 用户登录接口
        "userLogout": "userLogout", // 用户退出登录
        "getUserList": "getUserList", // 获取用户列表数据接口
        "changeUserPwd": "changeUserPwd", // 用户修改密码接口
        "getUserLogList": "getUserLogList", // 获取用户操作日志列表数据接口

        // groupService：业务组服务
        "delGroup": "delGroup", // 删除业务对象组接口
        "saveGroup": "saveGroup", // 新增修改业务对象分组接口
        "getGroupList": "getGroupList", // 获取业务分组列表接口
        "delGroupMember": "delGroupMember", // 删除业务对象组成员接口
        "saveGroupMember": "saveGroupMember", // 新增业务对象组成员接口
        "getGroupMemberList": "getGroupMemberList", // 获取业务对象分组成员列表接口
        "saveUserGroupDataRes": "saveUserGroupDataRes", // 新增、修改用户角色的业务数据访问权限接口

        // permissionService：权限服务
        "delRole": "delRole", // 删除角色接口
        "saveRole": "saveRole", // 新增修改系统角色接口
        "getRoleList": "getRoleList", // 获取系统角色列表数据接口
        "delRoleUser": "delRoleUser", // 删除系统角色可用功能接口
        "saveRoleUser": "saveRoleUser", // 新增角色下属用户接口
        "delRoleFunction": "delRoleFunction", // 删除系统角色可用功能接口
        "getRoleUserList": "getRoleUserList", // 获取角色下属用户列表数据接口
        "saveRoleFunction": "saveRoleFunction", // 新增角色可用功能接口
        "getFunctionList": "getFunctionList", // 获取系统操作权限功能项目列表接口
        "getFunctionTreeList": "getFunctionTreeList", // 获取系统操作权限功能项目列表接口
        "getFunctionTreeList": "getFunctionTreeList", // 获取系统操作权限功能项（树型结构）
        "getRoleFunctionList": "getRoleFunctionList", // 获取角色可用功能列表数据接口
        "saveUserGroupDataRes": "saveUserGroupDataRes", // 新增、修改用户组的数据访问权限接口
        "delUserGroupDataResList": "delUserGroupDataResList", // 删除业务组可访问的业务对象接口
        "getUserGroupDataResList": "getUserGroupDataResList", // 获取用户角色可访问的业务数据对象列表接口
        "delUserGroupDataResList": "delUserGroupDataResList", // 删除角色可访问的业务对象接口
        "getUserGroupDataResList": "getUserGroupDataResList", // 获取用户组可访问的业务数据对象列表接口
        "saveUserGroups": "saveUserGroups", // 新增用户的业务数据组权限接口
        "delUserGroups": "delUserGroups", // 删除用户可访问的数据组接口
        "getUserGroupList": "getUserGroupList", // 获取用户可访问的业务数据组列表接口

        // vehicleService：车辆服务
        "delVehicle": "delVehicle", // 删除车辆接口
        "saveVehicle": "saveVehicle", // 删除系统角色可用功能接口
        "getVehicleList": "getVehicleList", // 获取车辆列表数据接口
        "getCrossAreaList": "getCrossAreaList", // 获取车辆进出防区数据接口
        "getVehicleRunReport": "getVehicleRunReport", // 获取按车辆类型的车辆使用情况统计数据接口
        "getVehicleOnlineStat": "getVehicleOnlineStat", // 	获取车辆在线统计情况
        "getVehicleCateReport": "getVehicleCateReport", // 获取按车辆类型的车辆分类占比统计数据接口
        "getSingleVehicleTrack": "getSingleVehicleTrack", //获取指定车辆的运动轨迹数据
        "updateVehiclePosition": "updateVehiclePosition", // 修改车辆位置接口
        "getVehicleMilesReport": "getVehicleMilesReport", // 获取车辆里程数统计数据接口
        "getVehicleStatusReport": "getVehicleStatusReport", // 获取按运行状态的车辆分类占比统计数据接口
        "getVehicleUseRecordList": "getVehicleUseRecordList", // 获取车辆使用记录列表
        "getVehicleMileRateReport": "getVehicleMileRateReport", // 车辆运行情况
        "getAllVehiclePositonList": "getAllVehiclePositonList", // 查询车辆最新位置数据接口
        "getVehicleOnlineDetail": "getVehicleOnlineDetail", //获取车辆上下线明细
        "downVehicleOnlineDetail": "downVehicleOnlineDetail", //下载车辆上下线明细excel
        "getVehicleCardFlowStat": "getVehicleCardFlowStat", // 获取车辆流量统计情况
        "updateVehicleOnlineStatus": "updateVehicleOnlineStatus", // 获取车辆流量统计情况
        
        // deviceService：设备服务
        "delDevice": "delDevice", // 删除设备接口
        "delCamera": "delCamera", // 删除摄像头接口
        "saveDevice": "saveDevice", // 新增修改定位终端接口
        "saveCamera": "saveCamera", // 新增修改摄像机信息接口
        "getCameraList": "getCameraList", // 获取摄像头列表数据接口
        "getDeviceList": "getDeviceList", // 获取定位设备列表数据接口
        "downloadDeviceList": "downloadDeviceList", // 下载定位设备列表excel接口 

        // areaService：防区服务
        "delPoi": "delPoi", // 删除POI地图标记接口
        "savePoi": "savePoi", // 新增修改地图POI位置标记接口
        "getPoiList": "getPoiList", // 获取地图POI标记列表数据接口
        "delSecureArea": "delSecureArea", // 删除防区接口
        "saveSecureArea": "saveSecureArea", // 新增修改防区接口
        "getSecureAreaList": "getSecureAreaList", // 获取防区列表数据接口

        // vehicleRepairService：车辆保养
        "getVehicleRepairList": "getVehicleRepairList", // 获取车辆保养信息列表
        "delVehicleRepairInfo": "delVehicleRepairInfo", // 删除车辆保养信息接口
        "saveVehicleRepairInfo": "saveVehicleRepairInfo", // 新增/修改车辆保养信息

        // providerService
        "getProviderSessionId": "getProviderSessionId", // 获取第三方设备平台的http sessionId接口

        // alarmService
        "getAlarmList": "getAlarmList", // 获取系统报警信息接口
        "updateAlarmStatus": "updateAlarmStatus", // 获取系统报警信息接口

        // sysParaService 系统参数
        "getSysParaList": "getSysParaList", // 获取系统参数列表接口 
        "saveSysPara": "saveSysPara", // 保存系统参数接口
        "delSysPara": "delSysPara", // 删除系统参数接口

        // vehicleModelService 车辆型号
        "saveVehicleModel": "saveVehicleModel",
        "getVehicleModelList": "getVehicleModelList",
        "delVehicleModel": "delVehicleModel",
    };

    return CONFIG;
}(CONFIG || {}));