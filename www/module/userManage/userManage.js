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
            "isShowReset": false,
            "isShowDetail": false,
            "isModalLoading": true,
            "modalTitle": "",
            "tableHeight": (function () {
                var containerHeight = $(".tableContainer").height();
                return containerHeight - 100;
            }()),
            "index": 0,
            "selectItem": null,
            "itemInfo": {
                "id": "", // 员工ID，修改员工信息时必传
                "userCode": "", // 用户帐号名
                "userPwd": "", // 用户密码. 说明： 1、	创建时不设置则默认为123456; 2、修改用户时不设置则不修改原有密码
                "companyId": "", //所属公司ID，手动从公司列表选择
                "userSeq": "", // 员工工号
                "userName": "", // 员工姓名
                "sex": "", // 员工性别
                "birthday": "", // 员工生日
                "mobile": "", // 员工手机号
                "telephone": "", // 员工办公电话号
                "email": "", // 员工邮箱
                "remark": "", // 员工备注
                "status": "", // 员工帐号状态，默认值911表示正常： 911：正常 912：冻结 913：作废                
                "idNo": "", // 身份证号
                "address": "", // 员工家庭住址
                "isCompanyAdmin": "", // 是否公司管理员
                "createUserId": userInfo["id"], // 创建用户ID，新增时必传
                "modifyUserId": userInfo["id"], // 修改用户ID，修改时必传
            },
            "pageInfo": {
                "id": 0,
                "count": 0,
                "pageNum": 1,
                "pageSize": 20,
                "userCode": "", // 查询关键字（角色名称）
                "userName": "", // 查询关键字（用户名称）
                "companyId": "", // 公司ID
            },
            "columnsList": [
                {
                    "type": "index",
                    "width": 60,
                    "align": "center"
                },
                {
                    "title": { "CN": "所属公司", "EN": "Company", "TW": "所屬公司" }[language["language"]],
                    "key": "company"
                },
                {
                    "title": { "CN": "账号", "EN": "Account", "TW": "帳號" }[language["language"]],
                    "key": "userCode"
                },
                {
                    "title": { "CN": "姓名", "EN": "Name", "TW": "姓名" }[language["language"]],
                    "key": "userName"
                },
                {
                    "title": { "CN": "手机号", "EN": "cellPhone No.", "TW": "手機號" }[language["language"]],
                    "key": "mobile"
                },
                {
                    "title": "是否公司管理员",
                    "key": "isCompanyAdmin"
                },
                {
                    "title": { "CN": "员工工号", "EN": "Staff Number", "TW": "員工工號" }[language["language"]],
                    "key": "userSeq"
                },
                {
                    "title": { "CN": "状态", "EN": "State", "TW": "狀態" }[language["language"]],
                    "key": "state"
                },
                {
                    "title": { "CN": "备注", "EN": "Remarks", "TW": "備註" }[language["language"]],
                    "key": "remark"
                },
                {
                    "title": { "CN": "操作", "EN": "Operation", "TW": "操作" }[language["language"]],
                    "key": "operation",
                    "width": 180,
                    "render": function (h, params) {
                        return h("div", [
                            h("Button", {
                                "props": {
                                    "type": "primary",
                                    "size": "small",
                                },
                                "style": {
                                    "marginRight": '5px'
                                },
                                "on": {
                                    "click": function () {
                                        pageVue.index = params.index;
                                        pageVue.selectItem = params.row;
                                        pageVue.showDetail();
                                    }
                                }
                            }, { "CN": "详情", "EN": "Detail", "TW": "詳情" }[language["language"]]),
                            h("Button", {
                                "props": {
                                    "type": "warning",
                                    "size": "small",
                                },
                                "style": {
                                    "marginRight": '5px'
                                },
                                "on": {
                                    "click": function () {
                                        pageVue.index = params.index;
                                        pageVue.selectItem = params.row;
                                        pageVue.editItem();
                                    }
                                }
                            }, { "CN": "编辑", "EN": "Edite", "TW": "編輯" }[language["language"]]),
                            h("Button", {
                                "props": {
                                    "type": "error",
                                    "size": "small",
                                },
                                "on": {
                                    "click": function () {
                                        pageVue.index = params.index;
                                        pageVue.selectItem = params.row;
                                        pageVue.delItem();
                                    }
                                }
                            }, { "CN": "删除", "EN": "Delete", "TW": "刪除" }[language["language"]])
                        ]);
                    }
                }
            ],
            "tableRowList": [],
            "superiorCompanyList": [],
            "userList": [],
            "companyList": [],
            "sexTypeList": bizParam["sexType"],
            "userStatusTypeList": bizParam["userStatusType"],
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
            //新增
            "addItem": function () {
                var self = this;
                self.isShowModal = true;
                self.isModalLoading = true;
                self.modalTitle = { "CN": "新增", "EN": "Add", "TW": "新增" }[self.language];
                self.itemInfo = {
                    "id": "", // 员工ID，修改员工信息时必传
                    "userCode": "", // 用户帐号名
                    "userPwd": "", // 用户密码. 说明： 1、	创建时不设置则默认为123456; 2、修改用户时不设置则不修改原有密码
                    "companyId": "", //所属公司ID，手动从公司列表选择
                    "userSeq": "", // 员工工号
                    "userName": "", // 员工姓名
                    "sex": "", // 员工性别
                    "birthday": "", // 员工生日
                    "mobile": "", // 员工手机号
                    "telephone": "", // 员工办公电话号
                    "email": "", // 员工邮箱
                    "remark": "", // 员工备注
                    "status": "", // 员工帐号状态，默认值911表示正常： 911：正常 912：冻结 913：作废                
                    "idNo": "", // 身份证号
                    "address": "", // 员工家庭住址
                    "isCompanyAdmin": "", // 员工家庭住址
                    "createUserId": userInfo["id"], // 创建用户ID，新增时必传
                    "modifyUserId": userInfo["id"], // 修改用户ID，修改时必传
                };
            },
            // 修改
            "editItem": function () {
                var self = this;
                utility.showMessageTip(self, function () {
                    self.itemInfo = self.userList[self.index];
                    self.itemInfo.userName = decodeURI(self.itemInfo.userName);
                    self.itemInfo.remark = decodeURI(self.itemInfo.remark);
                    self.itemInfo.address = decodeURI(self.itemInfo.address);
                    console.log(self.itemInfo);
                    self.isShowModal = true;
                    self.modalTitle = { "CN": "修改", "EN": "Edit", "TW": "修改" }[self.language];
                });
            },
            // 修改
            "showDetail": function () {
                var self = this;
                utility.showMessageTip(self, function () {
                    self.itemInfo = self.userList[self.index];
                    self.itemInfo.userName = decodeURI(self.itemInfo.userName);
                    self.itemInfo.remark = decodeURI(self.itemInfo.remark);
                    self.itemInfo.address = decodeURI(self.itemInfo.address);
                    self.itemInfo.sexName = (function () {
                        var sex = "";
                        for (var s = 0, slen = self.sexTypeList.length; s < slen; s++) {
                            if (self.sexTypeList[s]["type"] == self.itemInfo["sex"]) {
                                sex = self.sexTypeList[s]["name"];
                                break;
                            }
                        }
                        return sex
                    }());
                    self.itemInfo.statusName = (function () {
                        var statu = "";
                        for (var s = 0, slen = self.userStatusTypeList.length; s < slen; s++) {
                            if (self.userStatusTypeList[s]["type"] == self.itemInfo["status"]) {
                                statu = self.userStatusTypeList[s]["name"];
                                break;
                            }
                        }
                        return statu
                    }());
                    self.isShowDetail = true;
                });
            },
            // 删除
            "delItem": function () {
                var self = this;
                self.$Modal.confirm({
                    "title": "确定删除？",
                    "content": "<p>账号："+ self.userList[self.index]["userCode"]+"</p><p>用户："+ self.userList[self.index]["userName"]+"</p>",
                    "width": 300,
                    "onOk": function() {
                        self.itemInfo = self.userList[self.index];
                        utility.showMessageTip(self, function () {
                            utility.interactWithServer({
                                url: CONFIG.HOST + CONFIG.SERVICE.userService + "?action=" + CONFIG.ACTION.delUser + "&ids=" + self.itemInfo.id + "&modifyUserId=" + userInfo["id"],
                                actionUrl: CONFIG.SERVICE.userService,
                                beforeSendCallback: function () {
                                    self.isTableLoading = true;
                                },
                                completeCallback: function () {
                                    self.isTableLoading = false;
                                },
                                successCallback: function (data) {
                                    if (data.code == 200) {
                                        self.getUserList(true);
                                    } else {
                                        self.$Message.error(data.message);
                                    }
                                }
                            });
                        });
                    }
                });
            },
            // 页数改变时的回调
            "pageSizeChange": function (value) {
                var self = this;
                self.pageInfo.pageNum = parseInt(value, 10);
                setTimeout(function () {
                    self.getUserList(false);
                }, 200);
            },
            // 切换每页条数时的回调
            "pageRowChange": function (value) {
                var self = this;
                self.pageInfo.pageSize = parseInt(value, 10);
                setTimeout(function () {
                    self.getUserList(false);
                }, 200);
            },
            // 当选择的行发生变化时 
            "setCurrentRowData": function (item, index) {
                var self = this;
                if (!!item) {
                    self.index = index;
                    self.selectItem = item;
                }
            },
            // 提交信息到服務器
            "uploadDataToServer": function () {
                var self = this;
                var dateInfo = utility.getDateDetailInfo(self.itemInfo.birthday);
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.userService + "?action=" + CONFIG.ACTION.saveUser,
                    actionUrl: CONFIG.SERVICE.userService,
                    dataObj: {
                        "id": self.itemInfo.id, // 员工ID，修改员工信息时必传
                        "userCode": self.itemInfo.userCode, // 用户帐号名
                        "userPwd": self.itemInfo.userPwd, // 用户密码. 说明： 1、	创建时不设置则默认为123456; 2、修改用户时不设置则不修改原有密码
                        "companyId": self.itemInfo.companyId, //所属公司ID，手动从公司列表选择
                        "userSeq": self.itemInfo.userSeq, // 员工工号
                        "userName": encodeURI(self.itemInfo.userName), // 员工姓名
                        "sex": self.itemInfo.sex, // 员工性别
                        "birthday": dateInfo.year + '-' + dateInfo.month + "-" + dateInfo.date, // 员工生日
                        "mobile": self.itemInfo.mobile, // 员工手机号
                        "telephone": self.itemInfo.telephone, // 员工办公电话号
                        "email": self.itemInfo.email, // 员工邮箱
                        "remark": encodeURI(self.itemInfo.remark), // 员工备注
                        "status": self.itemInfo.status, // 员工帐号状态，默认值911表示正常： 911：正常 912：冻结 913：作废                
                        "idNo": self.itemInfo.idNo, // 身份证号
                        "address": encodeURI(self.itemInfo.address), // 员工家庭住址
                        "isCompanyAdmin": self.itemInfo.isCompanyAdmin || 0, // 是否公司管理员
                        "createUserId": userInfo["id"], // 创建用户ID，新增时必传
                        "modifyUserId": userInfo["id"], // 修改用户ID，修改时必传
                    },
                    completeCallback: function () {
                        self.isModalLoading = false;
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                            self.getUserList(true);
                            self.isShowModal = false;
                        } else {
                            self.$Message.error(data.message);
                        }
                    }
                });
            },
            // 从获取回来的列表中，格式化出显示在表格上的内容
            "formatTableList": function () {
                var self = this;

                for (var i = 0, len = self.userList.length; i < len; i++) {
                    self.tableRowList.push({
                        "userCode": self.userList[i]["userCode"], //"账号",
                        "userName": decodeURI(self.userList[i]["userName"]), //"员工姓名",
                        "userSeq": self.userList[i]["userSeq"], //"员工工号",
                        "mobile": self.userList[i]["mobile"], //"固话",
                        "telephone": self.userList[i]["telephone"], //"手机号",
                        "company": decodeURI(self.userList[i]["companyName"]), //"所属公司",
                        "isCompanyAdmin": !!self.userList[i]["isCompanyAdmin"]?"是":"否", // 是否公司管理员,
                        "remark": decodeURI(self.userList[i]["remark"]), //"备注",
                        "sex": (function () {
                            var sex = "";
                            for (var s = 0, slen = self.sexTypeList.length; s < slen; s++) {
                                if (self.sexTypeList[s]["type"] == self.userList[i]["sex"]) {
                                    sex = self.sexTypeList[s]["name"];
                                    break;
                                }
                            }
                            return sex
                        }()), //"性别",
                        "state": (function () {
                            var statu = "";
                            for (var s = 0, slen = self.userStatusTypeList.length; s < slen; s++) {
                                if (self.userStatusTypeList[s]["type"] == self.userList[i]["status"]) {
                                    statu = self.userStatusTypeList[s]["name"];
                                    break;
                                }
                            }
                            return statu
                        }()),
                    });
                }
            },
            // 获取用户信息
            "getUserList": function (bool) {
                var self = this;
                // 如果是查询，则重新从第一页开始
                self.tableRowList = [];
                if (bool == true) {
                    self.pageInfo.pageNum = 0;
                }
                utility.interactWithServer({
                    url: CONFIG.HOST + CONFIG.SERVICE.userService + "?action=" + CONFIG.ACTION.getUserList,
                    actionUrl: CONFIG.SERVICE.userService,
                    dataObj: self.pageInfo,
                    beforeSendCallback: function () {
                        self.isTableLoading = true;
                    },
                    completeCallback: function () {
                        self.isTableLoading = false;
                    },
                    successCallback: function (data) {
                        if (data.code == 200) {
                            self.userList = data.data;
                            self.pageInfo.count = data.count;

                            // 格式化表格数据
                            self.formatTableList();
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
            },
        },
        "created": function () {
            var self = this;

            // 判断是否已经登录，如果没有登录，则直接退出到登录页面
            utility.isLogin(false);

            setTimeout(function () {
                self.getUserList(false);
                self.getCompanyList();
            }, 500);
        }
    });

}())
