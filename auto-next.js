// auto-next.js - 自动播放下一集模块

(function () {
    // 确保只执行一次
    if (window.AutoNextInitialized) return;
    window.AutoNextInitialized = true;

    // 获取下一集链接
    const getNextUrl = () => {
        try {
            if (window.parent && window.parent.MacPlayer && window.parent.MacPlayer.PlayLinkNext) {
                return window.parent.MacPlayer.PlayLinkNext;
            }
            return null;
        } catch (e) {
            console.warn("无法访问 parent.MacPlayer（可能是跨域）");
            return null;
        }
    };

    // 创建提示框
    function createTip() {
        const tip = document.createElement('div');
        tip.id = 'autoNextTip';
        Object.assign(tip.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '6px',
            zIndex: '99999',
            fontSize: '16px',
            transition: 'opacity 0.3s ease',
        });
        tip.textContent = '即将跳转下一集（5s）';
        document.body.appendChild(tip);
        return tip;
    }

    // 设置定时跳转
    function setupAutoNext(art) {
        const nextUrl = getNextUrl();
        if (!nextUrl) {
            console.log("没有下一集链接");
            return;
        }

        art.on('video:ended', function () {
            const tip = createTip();
            let count = 5;
            const countdown = setInterval(() => {
                count--;
                if (count > 0) {
                    tip.textContent = `即将跳转下一集（${count}s）`;
                } else {
                    clearInterval(countdown);
                    document.body.removeChild(tip);
                    try {
                        if (window.top && window.top.location.host === location.host) {
                            window.top.location.href = nextUrl;
                        } else {
                            window.location.href = nextUrl;
                        }
                    } catch (e) {
                        console.error("跨域跳转失败", e);
                        window.location.href = nextUrl;
                    }
                }
            }, 1000);
        });
    }

    // 等待 ArtPlayer 加载完成并注入自动下一集逻辑
    function waitForArtPlayer() {
        let attempts = 0;
        const maxAttempts = 30; // 最多等待 3 秒
        const interval = setInterval(() => {
            if (typeof Artplayer !== 'undefined' && window.art) {
                clearInterval(interval);
                setupAutoNext(window.art);
            } else if (attempts++ > maxAttempts) {
                clearInterval(interval);
                console.error("ArtPlayer 初始化超时");
            }
        }, 100);
    }

    // 启动监听
    waitForArtPlayer();

})();



