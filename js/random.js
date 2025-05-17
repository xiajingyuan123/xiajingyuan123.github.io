//重复六次以下操作
// 生成3位二进制数，如果3个数相同，则取相反的数（1变0，0变1）
let originalResults = new Array(6); // 保存爻变前的结果
let changedResults = new Array(6); // 保存爻变后的结果
let yaoChangedOverall = false; // 标记整个占卜是否发生爻变

function random() {
    var arr = new Array(3); // 创建一个长度为3的数组
    var yaoChanged = false; // 标记是否发生爻变
    var changedArr = []; // 爻变后的数组

    for (var i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 2); // 随机生成0或1
    }

    if (arr[0] == arr[1] && arr[1] == arr[2]) { // 如果三个数相同
        yaoChanged = true; // 标记发生爻变
        for (var i = 0; i < arr.length; i++) {
            changedArr[i] = arr[i] == 1 ? 0 : 1; // 生成爻变后的数组
        }
    } else {
        changedArr = arr.slice(); // 如果没有爻变，爻变后的数组与原始数组相同
    }

    return { originalArr: arr, changedArr, yaoChanged }; // 返回原始数组、爻变后的数组和爻变标记
}

function startDivination() {
    for (var i = 0; i < 6; i++) {
        var result = random(); // 调用 random 函数
        originalResults[i] = result.originalArr.slice(); // 保存爻变前的结果
        changedResults[i] = result.changedArr.slice(); // 保存爻变后的结果

        if (result.yaoChanged) {
            yaoChangedOverall = true; // 标记整个占卜发生爻变
        }
    }

    console.log("爻变前的结果:", originalResults); // 打印爻变前的结果
    console.log("爻变后的结果:", changedResults); // 打印爻变后的结果
    console.log("是否发生爻变:", yaoChangedOverall); // 打印是否发生爻变
}


