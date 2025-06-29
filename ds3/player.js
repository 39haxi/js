/***
 *
 * 音乐盒子 v1.1
 * 短视主题附带源码-作者Q：602524950
 *
 * ////感谢以下开源项目////
 * 后端采用：https://github.com/mengkunsoft/MKOnlineMusicPlayer/wiki
 * 前端参考：https://mkblog.cn/
 * 播放器采用：http://www.jplayer.org/
 *
 * 力推一个源码网站 maccmsbox.com  不登录 不用留言 不用花钱模板直接下载
 *
 * ***/
$(function(){
    addListbar("loading");
    $.ajax({
        url: ecData.api,
        type: "post",
        dataType: "json",
        data: {'id': ecData.listId, "type": "playlist","source":ecData.source},
        success: function (r) {
            ecData.list = r;
            for (let i = 0; i < r.length; i++) {
                let tmpMusic = r[i];
                addItem(i + 1, tmpMusic.name, tmpMusic.artist[0], tmpMusic.album);
            }
            playUrl(r[0], 0);
        }
    });
    $("#list-foot").remove();
    $(".ec-next").click(function(){
        nextMusic()
    })
    $(".ec-previous").click(function(){
        prevMusic()
    })
    $(".jp-progress").click(function(){
        $("#jp_audio_0")[0].addEventListener('timeupdate', updateProgress);
    })
    $(document).on('click', '.list-item', function() {
        let no = Number($(this).attr('data-id'));
        if(ecData.dislist === "so") {
            let tmpMusic = ecData.so[no];
            for(let i=0; i<ecData.list.length; i++) {
                if(ecData.list[i].id == tmpMusic.id && ecData.list[i].source == tmpMusic.source) {
                    playList(i)
                    return true;
                }
            }
            ecData.list.splice(ecData.playid + 1, 0, tmpMusic);
            ecData.soid = no;
            playList(ecData.playid+1);
        }else{
            playList(no);
        }
    });
    $("#btn-area .btn").click(function(){
        let data_id = $(this).attr("data-action");
        switch(data_id) {
            case "search":
                $("#skill").show();
                $(document).on('click', '.box-bg2', function() {
                    $(this).parent().hide();
                });
                $(this).addClass("active").siblings().removeClass("active");
                $("#musicList").addClass('active').siblings().removeClass('active');
                break;
            case "sheet":
                $(this).addClass("active").siblings().removeClass("active");
                $("#musicSong").addClass('active').siblings().removeClass('active');
                break;
            case "playing":
                ecData.dislist = 'list';
                $(this).addClass("active").siblings().removeClass("active");
                $("#musicList").addClass('active').siblings().removeClass('active');
                $(".music-player-table-box").html("");
                for (let i = 0; i < ecData.list.length; i++) {
                    let tmpMusic = ecData.list[i];
                    addItem(i + 1, tmpMusic.name, tmpMusic.artist[0], tmpMusic.album);
                }
                update();
                break;
            case "player":
                $(this).addClass("active").siblings().removeClass("active");
                $("#musicLyric").addClass('active').siblings().removeClass('active');
                break;
        }
    })
    $("#musicSong .music-box-w").click(function(){
        let data = $(this).data();
        $.ajax({
            url: ecData.api,
            type: "post",
            dataType: "json",
            data: {'id': data.id, "type": "playlist","source":data.type},
            success: function (r) {
                if(r.length < 10){
                    _EC.Pop.Msg('数据获取失败',2000,"error");
                }
                $("#btn-area .btn").eq(1).addClass("active").siblings().removeClass("active");
                $("#musicList").addClass("active");
                $("#musicSong").removeClass("active");
                $(".music-player-table-box").html("");
                ecData.list = r;
                for (let i = 0; i < r.length; i++) {
                    let tmpMusic = r[i];
                    addItem(i + 1, tmpMusic.name, tmpMusic.artist[0], tmpMusic.album);
                }
                ecData.playid=0;
                playUrl(r[0],0,2);
                $(".list-item").eq(ecData.playid).addClass("play-icon");
            },
            error: function() {
                _EC.Pop.Msg('请求失败',2000,"error");
            }
        });
    });
    // 循环顺序的处理
    $(".jp-order").click(function(){
        orderChange();
    });
});
function top_head(){
    let box = $(".music-player-table-box");
    let h = box.height()/2;
    let t = $(".play-icon").position().top;
    if(t > (box.height()-60)){
        box.scrollTop((box.scrollTop()+t)-h);
    }
}
function addItem(no, name, auth, album){
    var html = '<li class="list-item" data-id="' + (no - 1) + '"><ul class="music-player-table-name">' +
        '    <li><span><i>' + no + '</i>' + name + '</span></li>' +
        '    <li>' + auth + '</li>' +
        '    <li>' + album + '</li>' +
        '</ul></li>';
    $(".music-player-table-box").append(html);
}
function playUrl(data,id,t) {
    $.ajax({
        url: ecData.api,
        type: "post",
        dataType: "json",
        data: {'id':data['id'],"type":"url",'source':data['source']},
        success: function (r) {
            if(data.source == "netease") {
                if(r.url === "") {
                    r.url = "https://music.163.com/song/media/outer/url?id=" + data.id + ".mp3";
                } else {
                    r.url = r.url.replace(/m7c.music./g, "m7.music.");
                    r.url = r.url.replace(/m8c.music./g, "m8.music.");
                }
            }
            if(r.url === "") {
                ecData['list'][id]['url']  = "err";
            } else {
                ecData['list'][id]['url']  = r.url;
            }
            $(".jp-share").attr("href",r.url);
            $(".fn-share-input").val(r.url);
            if(id >= 1 || t===2){
                play(r.url);
            }else{
                jplayer(r.url);
            }
            ajaxLyric(data);
            changeCover(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            _EC.Pop.Msg('歌曲链接获取失败 - ' + XMLHttpRequest.status,2000,"error");
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });
}
function play(url){
    $("#jp_audio_0").attr('src',url);
    $(".jp-layer-url").jPlayer("play");
}
function audioErr() {
    if(ecData.errCount > 10) {
        _EC.Pop.Msg('似乎出了点问题~播放已停止',2000,"error");
        ecData.errCount = 0;
        $(".jp-layer-url").jPlayer("pause");
    } else {
        ecData.errCount++;
        _EC.Pop.Msg('当前歌曲播放失败，自动播放下一首',2000,"error");
        nextMusic();
    }
}
// 循环顺序
function orderChange() {
    let orderDiv = $(".jp-order");
    switch(ecData.order) {
        case 1:     // 单曲循环 -> 列表循环
            orderDiv.html("&#xe586;");
            orderDiv.attr("title", "列表循环");
            _EC.Pop.Msg("列表循环",2000);
            ecData.order = 2;
            break;
        case 3:     // 随机播放 -> 单曲循环
            orderDiv.html("&#xe585;");
            orderDiv.attr("title", "单曲循环");
            _EC.Pop.Msg("单曲循环",2000);
            ecData.order = 1;
            break;
        default:    // 列表循环(其它) -> 随机播放
            orderDiv.html("&#xe587;");
            orderDiv.attr("title", "随机播放");
            _EC.Pop.Msg("随机播放",2000);
            ecData.order = 3;
    }
}
function prevMusic() {
    playList(ecData.playid - 1);
}
function nextMusic() {
    switch (ecData.order ? ecData.order : 1) {
        case 1:
            playList(ecData.playid + 1);
            break;
        case 3:
            if (ecData.list && ecData.list.length) {
                let id = parseInt(Math.random() * ecData.list.length);
                playList(id);
            }
            break;
        default:
            playList(ecData.playid + 1);
            break;
    }
}
function playList(id) {
    if(ecData.list.length <= 0) return true;
    if(id >= ecData.list.length) id = 0;
    if(id < 0) id = ecData.list.length - 1;
    ecData.playid = id;
    if(ecData['list'][id].url == null || ecData['list'][id].url == "") {
        playUrl(ecData['list'][id],id);
    }else{
        play(ecData['list'][id].url);
        ajaxLyric(ecData['list'][id]);
    }
    up();
    top_head();
}
function jplayer(url){
    $(".jp-layer-url").jPlayer({
        ready: function (event) {
            $(this).jPlayer("setMedia", {
                mp3: url,
            });
        },
        error: function(event){
            audioErr();
        },
        supplied: "mp3,m4a",
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        autoPlay: true,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true,
        ended: function () {
            if(ecData.order && ecData.order === 1) {
                playList(ecData.playid);
            } else {
                nextMusic();
            }
        }
    });
    up();
    $("#jp_audio_0")[0].addEventListener('timeupdate', updateProgress);
}
//更新播放图标
function update(){
    $(".play-icon").removeClass("play-icon");
    if(ecData.dislist === "so") {
        if(ecData.soid == null){
        }else{
            $(".list-item").eq(ecData.soid).addClass("play-icon");
            ecData.soid = null;
        }
    }else{
        $(".list-item").eq(ecData.playid).addClass("play-icon");
    }
}
//更新歌曲信息
function up(){
    update();
    let data = ecData.list[ecData.playid];
    let html = '<p>歌曲名：'+data.name+'</p><p>歌手：'+data.artist+'</p><p>专辑：'+data.album+'</p>';
    $(".jp-infos").html(data.name+' -&nbsp;'+data.artist);
    $(".song-info-name").html(html);
    $(".song-info-pic").attr("src", data.pic);
    $(".process-info .pic").attr('src', data.pic);
}
// 歌曲时间变动回调函数
function updateProgress(){
    let currentTim = $("#jp_audio_0")[0].currentTime
    scrollLyric(currentTim);
}
$("#btn-area").eq(0).click(function(){
    updateProgress()
});
// 在歌词区显示提示语（如歌词加载中、无歌词等）
function lyricTip(str) {
    $("#lyric").html("<li class='lyric-tip'>"+str+"</li>");
}
// 歌曲加载完后的回调函数
// 参数：歌词源文件
function lyricCallback(str, id) {
    ecData.lyric = parseLyric(str);
    if(ecData.lyric === '') {
        lyricTip('没有歌词');
        return false;
    }
    let lyricArea = $("#lyric");
    lyricArea.html('');
    lyricArea.scrollTop(0);
    ecData.lastLyric = -1;
    var i = 0;
    for(var k in ecData.lyric){
        var txt = ecData.lyric[k];
        if(!txt) txt = "&nbsp;";
        var li = $("<li data-no='"+i+"' class='lrc-item'>"+txt+"</li>");
        lyricArea.append(li);
        i++;
    }
}
// 强制刷新当前时间点的歌词
// 参数：当前播放时间（单位：秒）
function refreshLyric(time) {
    if(ecData.lyric === '') return false;
    time = parseInt(time);
    var i = 0;
    for(var k in ecData.lyric){
        if(k >= time) break;
        i = k;
    }
    scrollLyric(i);
}
// 滚动歌词到指定句
// 参数：当前播放时间（单位：秒）
function scrollLyric(time) {
    if(ecData.lyric === '') return false;
    time = parseInt(time);
    if(ecData.lyric === undefined || ecData.lyric[time] === undefined) return false;  // 当前时间点没有歌词
    if(ecData.lastLyric == time) return true;
    var i = 0;
    for(var k in ecData.lyric){
        if(k == time) break;
        i ++;
    }
    let lyricArea = $("#lyric");
    ecData.lastLyric = time;
    $(".play-ing").removeClass("play-ing");
    $(".lrc-item[data-no='" + i + "']").addClass("play-ing");
    var scroll = (lyricArea.children().height() * i) - ($(".lyric").height() / 2);
    lyricArea.stop().animate({scrollTop: scroll}, 1000);
}
// 解析歌词
// 这一函数来自 https://github.com/TivonJJ/html5-music-player
// 参数：原始歌词文件
function parseLyric(lrc) {
    if(lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');
        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}
// ajax加载歌词
// 参数：音乐ID，回调函数
function ajaxLyric(music) {
    lyricTip('歌词加载中...');
    if(!music.lyric_id) callback('');
    $.ajax({
        url: ecData.api,
        type: "post",
        dataType: "json",
        data: {'id':music.lyric_id,"type":"lyric",'source':music.source},
        success: function (r) {
            if (r.lyric) {
                lyricCallback(r.lyric, music.lyric_id);
            } else {
                lyricCallback('', music.lyric_id);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            _EC.Pop.Msg('歌词读取失败 - ' + XMLHttpRequest.status,2000,"error");
            console.error(XMLHttpRequest + textStatus + errorThrown);
            lyricCallback('', music.lyric_id);
        }
    });
}
function changeCover(music) {
    let img = music.pic;
    if(!img) {
        ajaxPic(music, changeCover);
        return;
    }
    $(".song-info-pic").attr("src", img);
    $(".process-info .pic").attr('src', img);
}
function ajaxPic(music, callback)
{
    $.ajax({
        url: ecData.api,
        type: "post",
        dataType: "json",
        data: {'id':music.pic_id,"type":"pic",'source':music.source},
        success: function (r) {
            music.pic = r.url;
            callback(music);
            return true;
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            _EC.Pop.Msg('歌曲封面获取失败 - ' + XMLHttpRequest.status,2000,"error");
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });
}
// 搜索功能
function searchSubmit() {
    let wd = $("#search-wd").val();
    if(!wd) {
        _EC.Pop.Msg('搜索内容不能为空',2000,"error");
        $("#search-wd").focus();
        return false;
    }
    ecData.source = $("#music-source input[name='source']:checked").val();
    $("#skill").hide();
    ecData.loadPage = 1;
    ecData.wd = wd;
    ajaxSearch();
    return false;
}
function ajaxSearch() {
    if(ecData.wd === ""){
        _EC.Pop.Msg('搜索内容不能为空',2000,"error");
        return false;
    }
    $.ajax({
        type: "post",
        url: ecData.api,
        data: {'limit':20,"type":"search",'source':ecData.source,"page":ecData.loadPage,"name":ecData.wd},
        dataType : "json",
        success: function(jsonData){
            if(ecData.loadPage == 1){
                if(jsonData.length === 0)
                {
                    _EC.Pop.Msg('没有找到相关歌曲',2000,"error");
                    return false;
                }
                ecData.so = [];
                $(".music-player-table-box").html('');
            } else {
                $("#list-foot").remove();
            }
            if(jsonData.length === 0)
            {
                addListbar("nomore");
                return false;
            }
            var tempItem = [], no = ecData.so.length;
            for (var i = 0; i < jsonData.length; i++) {
                no ++;
                tempItem =  {
                    id: jsonData[i].id,
                    name: jsonData[i].name,
                    artist: jsonData[i].artist[0],
                    album: jsonData[i].album,
                    source: jsonData[i].source,
                    url_id: jsonData[i].url_id,
                    pic_id: jsonData[i].pic_id,
                    lyric_id: jsonData[i].lyric_id,
                    pic: null,
                    url: null
                };
                ecData.so.push(tempItem);
                addItem(no, tempItem.name, tempItem.artist, tempItem.album);
            }
            ecData.dislist = "so";
            ecData.loadPage ++;
            if(no < 20) {
                addListbar("nomore");
            } else {
                addListbar("more");
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            _EC.Pop.Msg('搜索结果获取失败 - ' + XMLHttpRequest.status,2000,"error");
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }
    });
}
$(document).on("click",".list-load", function() {
    $(".list-load").removeClass('list-load');
    $(".list-load").html('加载中...');
    ajaxSearch();
});
// 加载列表中的提示条
function addListbar(types) {
    var html
    switch(types) {
        case "more":
            html = '<div class="text-center list-load" title="点击加载更多数据" id="list-foot">点击加载更多...</div>';
            break;
        case "nomore":
            html = '<div class="text-center" id="list-foot">全都加载完了</div>';
            break;
        case "loading":
            html = '<div class="text-center" id="list-foot">播放列表加载中...</div>';
            break;
        case "nodata":
            html = '<div class="text-center" id="list-foot">可能是个假列表，什么也没有</div>';
            break;
    }
    $(".music-player-table-box").append(html);
}