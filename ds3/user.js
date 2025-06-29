//保存按钮
$("#btn_submit").click(function() {
    let parameter = $(this).data();
    let data = $("#fm").serialize();
    $.ajax({
        url: parameter['get'],
        type: "post",
        dataType: "json",
        data: data,
        success: function (r) {
            _EC.Pop.Msg(r.msg);
            if(r.code==1){
                setTimeout(function(){
                    window.location.reload();
                },1000);
            }
        },
    });
});
//邮箱/手机绑定
$('.btn-unbind').click(function(){
    let ac = $(this).attr('ac');
    if(ac!='email' && ac!='phone'){
        _EC.Pop.Msg("参数错误",2000,"error");
    }
    if(confirm('确认解除绑定吗？此操作不可恢复？')) {
        $.ajax({
            url: "/index.php/user/unbind",
            type: "post",
            dataType: "json",
            data: {ac: ac},
            success: function (r) {
                _EC.Pop.Msg(r.msg);
                if(r.code==1){
                    setTimeout(function(){
                        location.href="/index.php/user/info";
                    },1000);
                }
            },
        });
    }
});
//删除按钮显示
$(".user-btn-edit").click(function(){
    if ($(this).hasClass("check")){
        $(this).html('<i class="fa r3">&#xe571;</i>编辑');
        $(".user-cor-list-del").hide();
        $(this).removeClass("check");
    }else {
        $(this).html('<i class="fa r3">&#xe561;</i>取消');
        $(".user-cor-list-del").show();
        $(this).addClass("check");
    }
});
//删除视频 type4播放记录 type2收藏
function delData(ids,all,type){
    $.post("/index.php/user/ulog_del",{ids:ids,type:type,all:all},function(data) {
        if (data.code == '1') {
            _EC.Pop.Msg('删除成功',2000,"success");
            setTimeout(function(){
                location.reload();
            },1000);
        }else {
            _EC.Pop.Msg('删除失败',2000,"error");
        }
    }, 'json')
}
//清空
$(".user-btn-empty").click(function(){
    delData('',1,$(this).attr('data-type'));
});
//单个删除
$(".user-cor-list-del").click(function(){
    let data = $(this).data();
    delData(data['id'],0,data['type']);
});
//在线充值
$('#btn_submit_pay').click(function(){
    let price = $("input[name='price']").val();
    if(Number(price)<1){
        return;
    }
    if(confirm('确定要在线充值吗')) {
        $.ajax({
            url: "/index.php/user/buy",
            type: "post",
            dataType: "json",
            data: {price: price,flag:'pay'},
            beforeSend: function () {
                $("#btn_submit_pay").css("background","#fd6a6a").val("loading...");
            },
            success: function (r) {
                if (r.code == 1) {
                    location.href="/index.php/user/pay?order_code=" + r.data.order_code;
                }
                else{
                    _EC.Pop.Msg(r.msg);
                }
            },
            complete: function () {
                $("#btn_submit_pay").css("background","#fa4646").val("提交");
            }
        });
    }
});
$('#btn_submit_card').click(function(){
    var no = $('input[name="card_no"]').val();
    var pwd = $('input[name="card_pwd"]').val();
    if(no=='' || pwd==''){
        _EC.Pop.Msg('请输入充值卡号和密码',2000,"error");
        return;
    }
    if(confirm('确定要使用充值卡充值吗')) {
        $.ajax({
            url: "/index.php/user/buy",
            type: "post",
            dataType: "json",
            data: {card_no: no,card_pwd:pwd,flag:'card'},
            beforeSend: function () {
                $("#btn_submit_card").css("background","#fd6a6a").val("loading...");
            },
            success: function (r) {
                _EC.Pop.Msg(r.msg);
            },
            complete: function () {
                $("#btn_submit_card").css("background","#fa4646").val("提交");
            }
        });
    }
});
//用户组升级
$('.gen-price-box .button').click(function(){
    let that = $(this).data();
    if(confirm('确定要升级到【'+that['name']+'】吗,需要花费【'+that['points']+'】积分')) {
        $.ajax({
            url: "/index.php/user/upgrade",
            type: "post",
            dataType: "json",
            data: {group_id: that['id'],long:that['long']},
            beforeSend: function () {
                $(this).val("loading...");
            },
            success: function (r) {
                _EC.Pop.Msg(r.msg);
                if (r.code == 1) {
                    setTimeout(function(){
                        location.reload();
                    },1000);
                }
            },
            complete: function () {
                $(this).val("提交");
            }
        });
    }
});
//提现申请
$("#btn_submit_sq").click(function() {
    let cash_bank_name = $('input[name="cash_bank_name"]').val();
    if(cash_bank_name==''){
        _EC.Pop.Msg('请输入银行名称','',"error");
        return;
    }
    let cash_bank_no = $('input[name="cash_bank_no"]').val();
    if(cash_bank_no==''){
        _EC.Pop.Msg('请输入银行账户','',"error");
        return;
    }
    let cash_payee_name = $('input[name="cash_payee_name"]').val();
    if(cash_payee_name==''){
        _EC.Pop.Msg('请输入收款人姓名','',"error");
        return;
    }
    let cash_money = $('input[name="cash_money"]').val();
    if(cash_money==''){
        _EC.Pop.Msg('请输入提现金额','',"error");
        return;
    }
    let data = $("#fm").serialize();
    $.ajax({
        url: "/index.php/user/cash",
        type: "post",
        dataType: "json",
        data: data,
        beforeSend: function () {
            $("#btn_submit_sq").css("background","#fd6a6a").val("loading...");
        },
        success: function (r) {
            _EC.Pop.Msg(r.msg,2000);
            if(r.code==1){
                setTimeout(function(){
                    location.href="/index.php/user/cash";
                },1000);
            }
        },
        complete: function () {
            $("#btn_submit_sq").css("background","#fa4646").val("提交");
        }
    });
});
//邮箱、手机验证码获取
let countdown=60;
function settime(val) {
    if (countdown == 0) {
        val.removeAttribute("disabled");
        val.value="获取验证码";
        countdown = 60;
        return true;
    } else {
        val.setAttribute("disabled", true);
        val.value="重新发送(" + countdown + ")";
        countdown--;
    }
    setTimeout(function() {settime(val) },1000)
}
$('#btn_send_sms').click(function(){
    let ac = $('input[name="ac"]').val();
    let to = $('input[name="to"]').val();
    if(ac=='email') {
        let pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        let ex = pattern.test(to);
        if (!ex) {
            _EC.Pop.Msg('邮箱格式不正确',2000,"error");
            return;
        }
    }
    else if(ac=='phone') {
        let pattern=/^[1][0-9]{10}$/;
        let ex = pattern.test(to);
        if (!ex) {
            _EC.Pop.Msg('手机号格式不正确',2000,"error");
            return;
        }
    }
    else{
        _EC.Pop.Msg('参数错误',2000,"error");
        return;
    }
    settime(this);
    let data = $("#fm").serialize();
    $.ajax({
        url: "/index.php/user/reg_msg",
        type: "post",
        dataType: "json",
        data: data,
        success: function (r) {
            _EC.Pop.Msg(r.msg,2000,"error");
        },
    });
});
//登录注册找回密码
$('#btn_submit_ajax').click(function() {
    if ($('#user_name').val()  == '') {_EC.Pop.Msg('输入用户！',2000,"error");$("#user_name").focus(); return false; }
    if ($('#user_pwd').val()  == '') {_EC.Pop.Msg('请输入密码！',2000,"error");$("#user_pwd").focus(); return false; }
    if ($('#verify').val()  == '') {_EC.Pop.Msg('请输入验证码！',2000,"error");$("#verify").focus(); return false; }
    if($('#user_pwd2').length > 0 ){if($('#user_pwd').val() != $('#user_pwd2').val()){_EC.Pop.Msg('确认密码不一样',2000,"error");$("#verify").focus(); return false;}}
    let data = $(this).data();
    $.ajax({
        url: data['api'],
        type: "post",
        dataType: "json",
        data: $('#fm').serialize(),
        beforeSend: function () {
            $(this).addClass('grey');
        },
        success: function (r) {
            _EC.Pop.Msg(r.msg,2000,"error");
            if(r.code==1){
                location.href=data['re'];
            }
            else{
                $('.ds-verify-img').click();
            }
        },
        complete: function () {
            $(this).removeClass('grey');
        }
    });
});