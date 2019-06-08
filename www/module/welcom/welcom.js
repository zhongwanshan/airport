(function () {
    var language = utility.getLocalStorage("language");
    var userInfo = utility.getLocalStorage("userInfo");
    var bizParam = utility.getLocalStorage("bizParam");
    var pageVue = new Vue({
        "el": "#js-vue",
        "data": {
            "language": !!language ? language["language"] : "CN",
            "isTableLoading": false,
            "isLoading": true,
            "innerHeight": window.innerHeight / 6,
            "resizeTime": null,
            "copyRight": { "CN": "@copyRight 深圳市民贵科技有限公司", 'EN': "@copyRight Mingui Non-Powered Euipment Management System", 'TW': "@copyRight 民貴無動力管理系統" }[language["language"]],
            // 车辆信息
            "vehicleInfo": {
                "list": [],
                "count": 0
            },
            "terminalStatusList": bizParam["terminalStatus"],
            "vehicleTypeList": bizParam["vehicleType"],
            "vehiclePassTypeList": bizParam["vehiclePassType"],
            "vehicleTypeInfo": {},
            "vehiclePassType": {},

            "isloadDefen": false,
            "totalChartData": null,
            "colorList": ["#66CCCC","#CCFF66","#FF99CC","#A0522D","#FFFF00", "#336699","#CC9933", "#339999"],
            "statuPageInfo": {
                "online": 0,
                "daySpan": 0,
                "count": 0,
            },
            "isTableLoading": false,
            "statuColumns": [
                {
                    "title": "车辆名称",
                    "width": 120,
                    "key": "vehicleName"
                },
                {
                    "title": "车牌号",
                    "width": 120,
                    "key": "licenseNumber"
                },
                {
                    "title": "车辆编号",
                    "width": 120,
                    "key": "vehicleCode"
                },
                // {
                //     "title": "使用状态",
                //     "width": 100,
                //     "key": "useStatusName"
                // },
                {
                    "title": "公司",
                    "width": 200,
                    "key": "companyName"
                },
                {
                    "title": "部门",
                    "width": 200,
                    "key": "deptName"
                },
                // {
                //     "title": "供应商",
                //     "width": 100,
                //     "key": "providerName"
                // },
                {
                    "title": "最后上线时间",
                    "key": "lastGpsTime",
                    "width": 150,
                    "fixed": "right",
                    "sortable": true,
                    "sortType": "desc",
                    "render": function (h, params) {
                        var  classType = "normalDay";
                        var now = Date.parse(new Date());
                        var lastTime = Date.parse(params.row.lastGpsTime.replace("-", "/"));
                        var day = Math.floor((now-lastTime)/(24*3600*1000));
                        if(day>3) {
                            classType = "overDay";
                        }
                        return h("div", [
                            h("span", {
                                "class": classType,
                            }, params.row.lastGpsTime),
                        ]);
                    }
                }
            ],
            "statuDataList": []
        },
        "methods": {
            // 判断是否已经登录，如果没有登录，则直接退出到登录页面
            "isLogin": function () {
                var self = this;

                // 判断是否有用户信息
                if (!userInfo) {
                    alert("请先登录！");
                    window.parent.window.location.href = "/airport/www/login.html";
                }
            },
            // 数据汇总
            "setTotalEchart": function () {
                var self = this;
                var myChart = echarts.init(document.getElementById('totalEchart'));
                var category = [];
                var seriesList = [];
                var legendLabel = [];
                var totalChartDataList = self.totalChartData.reverse();

                for (var i = 0, len = totalChartDataList.length; i < len; i++) {
                    category.push(totalChartDataList[i]["day"]);
                    for (var s = 0, slen = totalChartDataList[i]["useStat"].length; s < slen; s++) {
                        self.vehicleTypeInfo["_"+totalChartDataList[i]["useStat"][s]["vehicleTypeId"]]["list"].push(totalChartDataList[i]["useStat"][s]["totalVehicleNum"]);
                    }
                }

                for(var key in self.vehicleTypeInfo) {
                    legendLabel.push(self.vehicleTypeInfo[key]["name"]);
                    if(self.vehicleTypeInfo.hasOwnProperty(key)) {
                        seriesList.push({
                            name: self.vehicleTypeInfo[key]["name"],
                            type: 'bar',
                            barWidth: 4,
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 2,
                                    color: self.vehicleTypeInfo[key]["color"]
                                }
                            },
                            data: self.vehicleTypeInfo[key]["list"]
                        });
                    }
                }

                // option
                option = {
                    backgroundColor: '#0f375f',
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        top: 20,
                        data: legendLabel,
                        textStyle: {
                            color: '#ccc'
                        }
                    },
                    xAxis: {
                        data: category,
                        axisLine: {
                            lineStyle: {
                                color: '#ccc'
                            }
                        }
                    },
                    yAxis: {
                        splitLine: { show: false },
                        axisLine: {
                            lineStyle: {
                                color: '#ccc'
                            }
                        }
                    },
                    series: seriesList.reverse()
                };
                myChart.setOption(option);

            },
            // 车辆统计
            "setVehicleEchart": function () {
                var self = this;
                var myChart = echarts.init(document.getElementById('vehicleEchart'));
                var typeList = (function () {
                    var list = [];
                    for (var key in self.vehicleTypeInfo) {
                        if (self.vehicleTypeInfo.hasOwnProperty(key)) {
                            if(self.vehicleTypeInfo[key]["value"] != 0) {
                                list.push(self.vehicleTypeInfo[key]);
                            }
                        }
                    }
                    return list;
                })();
                var passList = (function () {
                    var list = [];
                    for (var key in self.vehiclePassType) {
                        if (self.vehiclePassType.hasOwnProperty(key)) {
                            list.push(self.vehiclePassType[key]);
                        }
                    }
                    return list;
                })();

                option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{b}:{c} ({d}%)"
                    },
                    legend: {
                        show: false
                    },
                    series: [
                        {
                            name: '车辆',
                            type: 'pie',
                            selectedMode: 'single',
                            radius: [0, '30%'],
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    backgroundColor: '#334455',
                                    color: "#fff"
                                }
                            },
                            labelLine: {
                                normal: {
                                    length: 5,
                                    length2: 5,
                                    smooth: true,
                                    show: true
                                }
                            },
                            data: typeList
                        },
                        {
                            name: '状态',
                            type: 'pie',
                            radius: ['40%', '55%'],
                            labelLine: {
                                normal: {
                                    smooth: true
                                }
                            },
                            label: {
                                normal: {
                                    formatter: '{b|{b}:}{c}次{per|{d}%}',
                                    backgroundColor: '#eee',
                                    borderColor: '#aaa',
                                    borderWidth: 1,
                                    borderRadius: 4,
                                    rich: {
                                        a: {
                                            color: '#999',
                                            lineHeight: 22,
                                            align: 'center'
                                        },
                                        hr: {
                                            borderColor: '#aaa',
                                            width: '100%',
                                            borderWidth: 0.5,
                                            height: 0
                                        },
                                        b: {
                                            fontSize: 12,
                                            lineHeight: 24
                                        },
                                        per: {
                                            color: '#eee',
                                            backgroundColor: '#334455',
                                            padding: [1, 2],
                                            borderRadius: 2
                                        }
                                    }
                                }
                            },
                            data: passList
                        }
                    ]
                };
                myChart.setOption(option);
            },
            // 车载终端
            "setTerminateState": function () {
                var self = this;
                var myChart = echarts.init(document.getElementById("terminateEchart"));

                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['正在静止', '活动', '开始进入休眠', '运动传感器故障', '侧翻', '离线', 'GPS未定位', '电压采集失败'],
                        textStyle: {
                            color: "#fff"
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    textStyle: {
                        color: "#ffffff"
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                            nameTextStyle: {
                                color: "#ffffff"
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            nameTextStyle: {
                                color: "#ffffff"
                            }
                        }
                    ],
                    series: [
                        {
                            name: '正在静止',
                            type: 'bar',
                            data: [200, 302, 310, 340, 390, 330, 320]
                        },
                        {
                            name: '活动',
                            type: 'bar',
                            stack: '活动',
                            data: [200, 120, 100, 140, 300, 200, 201]
                        },
                        {
                            name: '开始进入休眠',
                            type: 'bar',
                            stack: '开始进入休眠',
                            data: [220, 120, 110, 240, 200, 300, 100]
                        },
                        {
                            name: '运动传感器故障',
                            type: 'bar',
                            stack: '运动传感器故障',
                            data: [100, 302, 210, 104, 190, 300, 100]
                        },
                        {
                            name: '侧翻',
                            type: 'bar',
                            data: [620, 180, 640, 260, 160, 160, 100],
                        },
                        {
                            name: '离线',
                            type: 'bar',
                            barWidth: 5,
                            stack: '离线',
                            data: [600, 320, 710, 740, 900, 300, 200]
                        },
                        {
                            name: 'GPS未定位',
                            type: 'bar',
                            stack: 'GPS未定位',
                            data: [200, 320, 110, 140, 900, 300, 200]
                        },
                        {
                            name: '电压采集失败',
                            type: 'bar',
                            stack: '电压采集失败',
                            data: [600, 720, 710, 740, 100, 100, 100]
                        }
                    ]
                };

                myChart.setOption(option);
            },
            // 重置
            "resetVehicleBizParamInfo": function() {
                var self = this;
                self.vehicleTypeInfo = {};
                self.vehiclePassType = {};
                self.vehicleInfo = {
                    "list": [],
                    "count": 0
                };
                for(var i = 0, len = self.vehicleTypeList.length; i < len; i++) {
                    if(self.vehicleTypeList[i]["type"] != 302 && self.vehicleTypeList[i]["type"] != 303) {
                        self.vehicleTypeInfo["_"+self.vehicleTypeList[i]["type"]] = {
                            "value": 0,
                            "name": self.vehicleTypeList[i]["name"],
                            "list": [],
                            "color": self.colorList[i]
                        }
                    }
                }

                for(var j = 0, jlen = self.terminalStatusList.length; j < jlen; j++) {
                    self.vehicleInfo["_"+self.terminalStatusList[j]["type"]] = 0
                }

                for(var k = 0, klen = self.vehiclePassTypeList.length; k < klen; k++) {
                    self.vehiclePassType["_"+self.vehiclePassTypeList[k]["type"]] = {
                        "value": 0,
                        "name": self.vehiclePassTypeList[k]["name"],
                        "list": [],
                        "color": self.colorList[k]
                    }
                }
            },
            // 实时防区信息
            "getCrossAreaList": function () {
                var self = this;
                // 如果是查询，则重新从第一页开始
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getCrossAreaList,
                    actionUrl: CONFIG.SERVICE.vehicleService,
                    dataObj: {
                        "pageNum": 1,
                        "pageSize": 100000,
                    },
                    beforeSendCallback: function () {
                        self.isloadDefen = true;
                    },
                    completeCallback: function () {
                        self.isloadDefen = false;
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                          
                            for (var i = 0, len = data.data.length; i < len; i++) {
                                self.vehiclePassType["_" + data.data[i]["crossTypeId"]]["value"] = self.vehiclePassType["_" + data.data[i]["crossTypeId"]]["value"] + 1;
                            }
                        }
                    }
                });
            },
            // 获取车辆信息
            "getAllVehicleList": function () {
                var self = this;
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getVehicleList,
                    actionUrl: CONFIG.SERVICE.vehicleService,
                    dataObj: {
                        id: "",
                        pageSize: 10000,
                    },
                    beforeSendCallback: function () {
                        self.isTableLoading = true;
                    },
                    completeCallback: function () {
                        self.isTableLoading = false;
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                            self.vehicleInfo.count = data.count;
                            self.vehicleInfo.list = data.data;
                            for (var i = 0, len = self.vehicleInfo.list.length; i < len; i++) {
                                self.vehicleInfo["_"+self.vehicleInfo.list[i]["vehicleStatus"]] = self.vehicleInfo["_"+self.vehicleInfo.list[i]["vehicleStatus"]] + 1;
                                self.vehicleTypeInfo["_"+self.vehicleInfo.list[i]["vehicleTypeId"]]["value"] = self.vehicleTypeInfo["_"+self.vehicleInfo.list[i]["vehicleTypeId"]]["value"] + 1;
                            }
                        }
                    }
                });
            },
            // 获取车辆不同天数的状态信息信息
            "getStatuVehicleList": function () {
                var self = this;
                self.statuDataList = [];
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getVehicleList,
                    actionUrl: CONFIG.SERVICE.vehicleService,
                    dataObj: {
                        id: "",
                        online: parseInt(self.statuPageInfo.online),
                        daySpan: parseInt(self.statuPageInfo.daySpan),
                        pageSize: 10000,
                    },
                    beforeSendCallback: function () {
                        self.isTableLoading = true;
                    },
                    completeCallback: function () {
                        self.isTableLoading = false;
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                            self.statuPageInfo.count = data.count;
                            self.statuDataList = data.data;
                        }
                    }
                });
            },
            // 跳转到地图页面
            "toMapPage": function (vehicleStatus) {
                var self = this;
                utility.setSessionStorage("fromInfo", {
                    type: "isSearch",
                    vehicleStatus: vehicleStatus
                });
                setTimeout(function () {
                    $(window.parent.document).find("#nav_Maps").bind("click");
                    $(window.parent.document).find("#nav_Maps").trigger("click");
                }, 200);
            },
            // 获取按运行状态的车辆分类占比统计数据
            "getVehicleStatusReport": function () {
                var self = this;
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getVehicleStatusReport,
                    actionUrl: CONFIG.SERVICE.getVehicleStatusReport,
                    successCallback: function (data) {
                        if (data.code == 200) {
                            console.log(data);
                        }
                    }
                });
            },
            // 获取按车辆类型的车辆使用情况统计数据接口
            "getVehicleRunReport": function () {
                var self = this;
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getVehicleRunReport,
                    actionUrl: CONFIG.SERVICE.getVehicleRunReport,
                    successCallback: function (data) {
                        if (data.code == 200) {
                            self.totalChartData = data.data;
                            self.setTotalEchart(); // 数据汇总
                        }
                    }
                });
            },
            // 获取按车辆类型的车辆分类占比统计数据接口
            "getVehicleCateReport": function () {
                var self = this;
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getVehicleCateReport,
                    actionUrl: CONFIG.SERVICE.getVehicleCateReport,
                    successCallback: function (data) {
                        if (data.code == 200) {
                            console.log(data);
                        }
                    }
                });
            },
            // 初始化
            "init": function() {
                var self = this;

                 // 重置常量数据
                self.resetVehicleBizParamInfo();

                // 车辆数据
                self.getAllVehicleList();

                // 获取按车辆类型的车辆使用情况统计数据接口
                self.getVehicleRunReport();

                self.getStatuVehicleList();
            }
        },
        "created": function () {
            var self = this;

            // 判断是否已经登录，如果没有登录，则直接退出到登录页面
            utility.isLogin(false);

            // 初始化数据
            self.init();

            setInterval(function() {
                self.init();
            }, 10000);

            // 当窗口变化时，重新调整高度
            $(window).resize(function () {
                clearTimeout(self.resizeTime);
                self.resizeTime = setTimeout(function () {
                    window.location.href = window.location.href;
                }, 500);
            });
        },
        "mounted": function () {
            var self = this;
            setTimeout(function () {
                self.isLoading = false;
                // self.setVehicleEchart(); // 车辆统计
            }, 5000);
        }
    });

}())
