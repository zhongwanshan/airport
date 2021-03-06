(function () {
    var language = utility.getLocalStorage("language");
    var userInfo = utility.getLocalStorage("userInfo");
    var bizParam = utility.getLocalStorage("bizParam");
    var pageVue = new Vue({
        "el": "#js-vue",
        "data": {
            "language": !!language ? language["language"] : "CN",
            "isTableLoading": true,
            "isShowModal": false,
            "isShowTerminal": false,
            "isModalLoading": true,
            "modalTitle": "",
            "tableHeight": (function () {
                var containerHeight = $(".tableContainer").height();
                return containerHeight - 100;
            }()),
            "vehiclePassType": bizParam["vehiclePassType"],// 穿越类型
            "pageInfo": {
                "areaId": "",
                "areaName": "",
                "areaCode": "",
                "vehicleId": "",
                "companyId": "",
                "vehicleName": "",
                "vehicleCode": "",
                "crossTypeId": "",
            },
            "page": {
                "count": 0,
                "pageSize": 20,
                "pageNum": 0,
            },
            "columnsList": [
                {
                    "type": "index",
                    "width": 60,
                    "title": "序号",
                    "align": "center"
                },
                {
                    "title": { "CN": "防区名称", "EN": "Defense Name", "TW": "防區名稱" }[language["language"]],
                    "key": "areaName"
                },
                // {
                //     "title": { "CN": "防区编码", "EN": "Defense Code", "TW": "防區編碼" }[language["language"]],
                //     "key": "areaCode"
                // },
                {
                    "title": { "CN": "车辆名称", "EN": "Vehicle Name", "TW": "車輛名稱" }[language["language"]],
                    "key": "vehicleName"
                },
                {
                    "title": { "CN": "车辆编码", "EN": "Vehicle Type", "TW": "車輛編碼" }[language["language"]],
                    "key": "vehicleCode"
                },
                {
                    "title": { "CN": "防区类型", "EN": "Defense Type", "TW": "防區類型" }[language["language"]],
                    "key": "crossTypeName",
                    "align": "center"
                },
                {
                    "title": { "CN": "行驶速度", "EN": "Speed", "TW": "行駛速度" }[language["language"]],
                    "key": "speed",
                    "sortable": true,
                    "render": function(h, params){
                        return h("div", [
                            h("span", {}, params.row.speed+"（公里/小时）"),
                        ]);
                    }
                },
                {
                    "title": { "CN": "时间", "EN": "Time", "TW": "時間" }[language["language"]],
                    "key": "crossTime",
                    "width": 160,
                },
                {
                    "title": "坐标",
                    "key": "currPosition",
                    "width": 160,
                    "render": function (h, params) {
                        var coordinates = JSON.parse(pageVue.dataList[params.index]["currPosition"])["coordinates"].join(",");
                        return h("div", coordinates);
                    }
                },
                {
                    "title": "地址",
                    "key": "lastAddress",
                    "width": 300
                }
            ],
            "dataList": [],
            "companyList": []
        },
        "methods": {
            // 刷新
            "refresh": function () {
                var self = this;
                window.location.href = window.location.href;
                if (self.isTableLoading == false) {
                    self.isTableLoading = true;
                    setTimeout(function () {
                        self.isTableLoading = false;
                    }, 3000);
                }
            },
            // 页数改变时的回调
            "pageSizeChange": function (value) {
                var self = this;
                self.page.pageNum = parseInt(value, 10);
                setTimeout(function () {
                    self.getCrossAreaList(false);
                }, 200);
            },
            // 切换每页条数时的回调
            "pageRowChange": function (value) {
                var self = this;
                self.page.pageSize = parseInt(value, 10);
                setTimeout(function () {
                    self.getCrossAreaList(true);
                }, 200);
            },
            // 获取车辆信息
            "getCrossAreaList": function (bool) {
                var self = this;
                // 如果是查询，则重新从第一页开始
                self.dataList = [];
                if (bool == true) {
                    self.page.pageNum = 0;
                    self.page.count = 0;
                }
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.vehicleService + "?action=" + CONFIG.ACTION.getCrossAreaList,
                    actionUrl: CONFIG.SERVICE.vehicleService,
                    dataObj: {
                        "areaId": self.pageInfo.areaId,
                        "pageNum": self.page.pageNum,
                        "pageSize": self.page.pageSize,
                        "areaCode": self.pageInfo.areaCode,
                        "vehicleId": self.pageInfo.vehicleId,
                        "companyId": self.pageInfo.companyId,
                        "vehicleCode": self.pageInfo.vehicleCode,
                        "crossTypeId": self.pageInfo.crossTypeId,
                        "areaName": encodeURI(self.pageInfo.areaName),
                        "vehicleName": encodeURI(self.pageInfo.vehicleName),
                    },
                    beforeSendCallback: function () {
                        self.isTableLoading = true;
                    },
                    completeCallback: function () {
                        self.isTableLoading = false;
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                            var list = [];

                            self.page.count = data.count;
                            for (var i = 0, len = data.data.length; i < len; i++) {
                                list.push(data.data[i]);
                                list[i]["lastAddress"] = "";
                            }
                            self.dataList = list;

                            for (var a = 0; a < data.data.length; a++) {
                                (function (a) {
                                    if (!!data.data[a].currPosition) {
                                        var position = JSON.parse(data.data[a].currPosition)["coordinates"];
                                        if (position[0] != 0 && position[1] != 0) {
                                            utility.convertorByBaidu(position, gcoord, BMap, function (point, lng, lat) {
                                                utility.getAdressDetail([lng, lat], BMap, function (address) {
                                                    self.dataList[a]["lastAddress"] = address;
                                                });
                                            });
                                        } else {
                                            self.dataList[a]["lastAddress"] = "--";
                                        }
                                    } else {
                                        self.dataList[a]["lastAddress"] = "--";
                                    }
                                }(a));
                            }
                        }
                    }
                });
            },
            // 获取公司列表
            "getCompanyList": function () {
                var self = this;
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.companyService + "?action=" + CONFIG.ACTION.getCompanyList,
                    actionUrl: CONFIG.SERVICE.companyService,
                    dataObj: {
                        id: 0,
                        pageSize: 10000,
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                            self.companyList = data.data;
                        }
                    }
                });
            }
        },
        "created": function () {
            var self = this;

            // 判断是否已经登录，如果没有登录，则直接退出到登录页面
            utility.isLogin(false);

            setTimeout(function () {
                self.getCompanyList();
                self.getCrossAreaList(true);

                self.$watch('pageInfo', function () {
                    self.getCrossAreaList(true);
                }, {
                    deep: true
                });
            }, 500);
        }
    });

}())
