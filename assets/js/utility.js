/**
 * @auto: zhongwanshan
 * @date: 2015/09/28
 * @description: 所有与项目框架无头的通用方法
 */

window.utility = (function (utility) {

    // 获取查询字符串参数
    utility.getQueryParams = function (href) {
        // 取得查询字符串并去掉开头问号
        var qs = (!!href) ? href.slice(href.indexOf("?") + 1) : location.search.length > 0 ? location.search.substring(1) : '';
        // 保存数据的对像
        var args = {};

        // 取得每一项
        var items = qs.split('&');
        var item = null;
        var name = null;
        var value = null;

        // 将每一项添加到 args 对象中
        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i].split('=');
            name = item[0];
            value = item[1];
            args[name] = value;
        }

        return args;
    };

    // 设置 cookie
    utility.setcookie = function (name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    };

    // 获取 cookie
    utility.getcookie = function (name) {
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) {
            return (arr[2]);
        } else {
            return "";
        }
    };

    // 删除 cookie
    utility.delcookie = function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = this.getcookie(name);
        if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    };

    // 保存本地会话
    utility.setSessionStorage = function (key, sessionStorageObj) {
        window.sessionStorage.setItem(key, JSON.stringify(sessionStorageObj));
    };

    // 返回本地会话信息
    utility.getSessionStorage = function (key) {
        return JSON.parse(window.sessionStorage.getItem(key));
    };

    // 清空本地会话信息
    utility.cleanSessionStorage = function () {
        window.sessionStorage.clear();
    };

    // 保存本地存储信息
    utility.setLocalStorage = function (key, localStorageObj) {
        window.localStorage.setItem(key, JSON.stringify(localStorageObj));
    };

    // 返回本地存储信息
    utility.getLocalStorage = function (key) {
        return JSON.parse(window.localStorage.getItem(key));
    };

    // 清空本地存储信息
    utility.cleanLocalStorage = function () {
        window.localStorage.clear();
    };

    //验证输入是否为空
    utility.checkLen = function (str, len) {
        return str.length <= len ? true : false;
    };

    //验证是否中文姓名
    utility.checkName = function (str) {
        return str.match(/[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*/) ? true : false;
    };

    //验证手机号码格式是否为手机号码
    utility.checkPhone = function (str) {
        return str.match(/^(13|14|15|17|18)[0-9]{8}[0-9]$/) ? true : false;
    };

    // 验证密码格式
    utility.checkPass = function (str) {
        return str.match(/(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$)^[\w~!@#$%^&*?]{6,20}$/) ? true : false;
        // return str.match(/(?!^(\d+|((?=.*[A-Z])(?=.*[a-z]))|[~!@#$%^&*?]+)$)^[\w~!@#$%^&*?]{6,20}$/) ? true : false;
    };

    //验证是否是生日
    utility.checkNumber = function (str) {
        return str.match(/^(1[0-2]|0?[1-9])(0?[1-9]|[1-2][0-9]|3[0-1])$/) ? true : false;
    };

    // 验证身份证号码
    utility.checkIdentityNo = function (str) {
        var reg15 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
        var reg18 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
        var bool = false;

        if (str.length == 15 && str.match(reg15)) {
            bool = true;
        } else if (str.length == 18 && str.match(reg18)) {
            bool = true;
        }
        return bool;
    };

    // 验证是不是整数
    utility.checkIsNum = function (str) {
        return str.match(/^[0-9]\d*$/) ? true : false;
    };

    // 验证是不是整数
    utility.checkIntNum = function (str) {
        return str.match(/^[1-9]\d*$/) ? true : false;
    };

    // 验证银行卡号
    utility.checkBlankNum = function (str) {
        return str.match(/^(\d{16}|\d{19})$/) ? true : false;
    }

    // 获取详细时间信息
    utility.getDateDetailInfo = function (value) {
        var nowDate = !!value ? new Date(value) : new Date();
        var year = nowDate.getFullYear(); // 年
        var month = nowDate.getMonth(); // 月
        var date = nowDate.getDate(); // 日
        var day = nowDate.getDay(); // 星期
        var hour = nowDate.getHours(); // 时
        var min = nowDate.getMinutes(); // 分
        var second = nowDate.getSeconds(); // 秒
        var weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

        return {
            "year": year,
            "month": (month + 1) < 10 ? "0" + (month + 1) : (month + 1),
            "date": date < 10 ? ("0" + date) : date,
            "hour": hour < 10 ? ("0" + hour) : hour,
            "min": min < 10 ? ("0" + min) : min,
            "second": (second < 10) ? "0" + second : second,
            "weekDay": weekDay[day]
        };
    };

    utility.timeDiff = function (date1, date2) {
        var time1 = date1 ? new Date(date1.replace(/\-/g, "/")).getTime() : new Date().getTime();
        var time2 = date2 ? new Date(date2.replace(/\-/g, "/")).getTime() : new Date().getTime();
        var timediff = Math.abs(time1 - time2);
        var days = Math.floor(timediff / (24 * 3600 * 1000)); // //计算出相差天数

        var leave1 = timediff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000)); // //计算出小时数

        var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000));
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
        var seconds = Math.round(leave3 / 1000);

        return {
            "timeStamp": timediff,
            "isOver": time1 < time2,
            "day": days,
            "hour": hours,
            "minute": minutes,
            "second": seconds,
        }
    };

    // 把图片转换成
    utility.convertImgToBase64 = function (url, callback, outputFormat) {
        var canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d'),
            img = new Image;
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL(outputFormat || 'image/png');
            callback.call(this, dataURL);
            canvas = null;
        };

        img.src = url;
    };

    // 把本地获取的文件读取为dataUrl格式
    utility.readAsDataURL = function (options) {

        if (typeof FileReader == "undified") {
            alert("您老的浏览器不行了！");
        }

        var reader = new FileReader();
        reader.readAsDataURL(options.file);
        reader.onload = function (event) {
            options.readSuccess && options.readSuccess(this.result);
        };

        reader.oneror = function (event) {
            options.readError && options.readError();
        }
    };

    //  从服务器获取数据或提交数据到服务器
    utility.interactWithServer = function (options) {
        var timestamp = Date.parse(new Date());
        var userInfo = utility.getLocalStorage("userInfo");
        var isPhone = utility.getLocalStorage("isPhone");
        var language = {
            "CN": "cn",
            "EN": "en",
            "TW": "hk"
        };
        var languageVer = !!utility.getLocalStorage("language") ? language[utility.getLocalStorage("language")["language"]] : "cn";

        $.ajax({
            dataType: "json",
            url: options.url,
            async: options.async || true,
            type: options.method || "POST",
            timeout: options.timeout || 20000,
            contentType: options.contentType || "application/x-www-form-urlencoded",
            data: options.dataObj || {},
            headers: options.headers || {
                version: 100, // 默认100
                timestamp: timestamp,
                languageVer: languageVer, // cn：中文简体 en：英语 hk：中文繁体
                appType: options.appType || 2, // 请求来源类型：1:H5 2:WWW 3:android app 4: ios app
                actionUrl: options.actionUrl || "", // 使用接口URL(注意：不包含http://ip:port的服务器域名/IP+端口这部分)
                userId: !!userInfo ? userInfo["id"] : "",
                userToken: !!userInfo ? userInfo["userToken"] : "", // 登陆后会有，如无则为空字符串
                signStr: md5((!!userInfo ? userInfo["userToken"] : "") + (!!userInfo ? userInfo["id"] : "") + timestamp + "100").toUpperCase() // 算法：MD5(userToken + userid+ timestamp+languageVer +version)，安全Key由系统设定
            },
            beforeSend: function (data) {
                options.beforeSendCallback && options.beforeSendCallback(data);
            },
            complete: function (XMLHttpRequest, textStatus) {
                options.completeCallback && options.completeCallback(XMLHttpRequest, textStatus);
            },
            success: function (data) {
                var isParent = window.parent;
                if (data.code == 9003) {
                    clearTimeout(window.clearLogin);
                    window.clearLogin = setTimeout(function () {
                        alert("登录令牌失效,请重新登录!");
                        if (!!isPhone) {
                            window.location.href = "/airport/www/loginPhone.html";
                        } else {
                            if (!!isParent) {
                                if (window.parent.window.location.href.indexOf("indexMg") != -1) {
                                    window.parent.window.location.href = "/airport/www/indexMg.html";
                                } else {
                                    window.parent.window.location.href = "/airport/www/login.html";
                                }
                            } else {
                                if (window.location.href.indexOf("indexMg") != -1) {
                                    window.location.href = "/airport/www/indexMg.html";
                                } else {
                                    window.location.href = "/airport/www/login.html";
                                }
                            }
                        }

                    }, 500);
                }
                options.successCallback && options.successCallback(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(textStatus);
                options.errorCallback && options.errorCallback();
            }
        });
    };

    // 生成随机长度的数字
    utility.generateRandomNums = function (n) {
        var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        var res = "";
        for (var i = 0; i < n; i++) {
            var id = Math.ceil(Math.random() * 10);
            res += chars[id];
        }
        return res;
    };

    // 获取当前位置经度与纬度
    utility.getGeolocation = function (options) {
        if (!!window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                // console.log(position);
                options.callback && options.callback(lat, lng);
            }, function (error) {
                options.errorCallback && options.errorCallback();
            }, {
                enableHighAccuracy: true,
            });
        } else {
            options.errorCallback && options.errorCallback();
        }
    };

    // 判断是否已经登录，如果没有登录，则直接退出到登录页面
    utility.isLogin = function (isParent, isDemo) {
        var userInfo = utility.getLocalStorage("userInfo");

        // 判断是否有用户信息
        if (!userInfo) {
            alert("请先登录！");
            utility.setLocalStorage("userInfo", null);
            utility.setLocalStorage("userFuncList", null);
            
            if(typeof isDemo != 'undefined') {
                if (isParent == true) {
                    window.location.href = "/airport/www/indexMg.html";
                } else if (isParent == false) {
                    window.parent.window.location.href = "/airport/www/indexMg.html";
                }
            } else {
                if (isParent == true) {
                    window.location.href = "/airport/www/login.html";
                } else if (isParent == false) {
                    window.parent.window.location.href = "/airport/www/login.html";
                }
            }
        }
    };

    // 显示 messageTip
    utility.showMessageTip = function (self, callback) {
        if (!!!self.selectItem) {
            self.$Message.config({
                top: 180,
                duration: 3
            });
            self.$Message.error({
                "content": {
                    "CN": "请选择一条数据",
                    "EN": "Please select a Data",
                    "TW": "請選擇一條數據"
                } [self.language]
            });
            return;
        }
        self.isModalLoading = true;
        !!callback && callback();
    };

    // 转换成百度坐标
    utility.convertorByBaidu = function (coordinate, gcoord, BMap, callback) {
        var result = gcoord.transform([parseFloat(coordinate[0]), parseFloat(coordinate[1])], gcoord.WGS84, gcoord.BD09);
        var point = new BMap.Point(result[0], result[1]);

        !!callback && callback(point, result[0], result[1]);
        return result;
    };

    // 根据坐标获取详细地址
    utility.getAdressDetail = function (coordinate, BMap, callback) {
        var gc = new BMap.Geocoder();
        var point = new BMap.Point(coordinate[0], coordinate[1]);
        var address = "";
        gc.getLocation(point, function (rs) {
            if (rs.surroundingPois.length > 0) {
                address = rs.surroundingPois[0]["address"] + "(" + rs.surroundingPois[0]["title"] + ")";
            } else {
                address = rs.address;
            }
            !!callback && callback(address);
        });
    };

    return utility;

}(window.utility || {}));