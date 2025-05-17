// 创建音频对象
const bgm = new Audio('../audio/bgm.mp3');
const clickSound = new Audio('../audio/click.mp3');

// BGM设置
bgm.loop = true; // 循环播放
bgm.volume = 0.3; // 音量设置为30%

// 播放BGM
function playBGM() {
    bgm.play();
}

// 暂停BGM
function pauseBGM() {
    bgm.pause();
}

// 播放点击音效
function playClickSound() {
    clickSound.currentTime = 0; // 重置音频播放位置
    clickSound.play();
}