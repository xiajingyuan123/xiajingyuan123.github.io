//根据数组播放硬币投掷动画，按钮点击一次，使用一次数组，数组元素中1代表正面，0代表反面
let currentIndex = 0; // 当前数组索引，用于记录播放到第几个结果

function playCoinAnimation(resultsArray) {
    // 倒序播放数组
    const reversedResultsArray = resultsArray.slice().reverse(); // 创建倒序数组，不修改原数组

    // 检查是否还有未播放的结果
    if (currentIndex >= reversedResultsArray.length) {
        alert("所有硬币投掷动画已播放完毕！");
        return;
    }

    // 禁用投掷按钮，防止在动画播放期间重复点击
    const coinAnimationButton = document.getElementById("coinAnimationButton");
    coinAnimationButton.disabled = true;

    // 获取当前结果（3 个硬币的结果）
    const currentResult = reversedResultsArray[currentIndex];

    // 检查当前结果是否是一个有效的 3 元素数组
    if (!Array.isArray(currentResult) || currentResult.length !== 3) {
        console.error("当前结果不是一个有效的 3 元素数组:", currentResult);
        coinAnimationButton.disabled = false; // 如果出错，重新启用按钮
        return;
    }

    // 模拟硬币投掷动画
    for (let i = 0; i < currentResult.length; i++) {
        const coinElement = document.getElementById(`coin${i + 1}`); // 假设页面中有 3 个硬币的元素

        // 设置硬币为中间状态（例如显示“投掷中”）
        coinElement.innerText = "投掷中";
        coinElement.style.backgroundColor = "gray"; // 设置中间状态的颜色

        // 播放动画（可以扩展为更复杂的动画效果）
        coinElement.classList.add("flip-animation");

        // 在动画结束后显示最终结果
        setTimeout(() => {
            coinElement.classList.remove("flip-animation");

            // 根据结果显示正反面
            if (currentResult[i] === 1) {
                coinElement.innerText = "正面"; // 显示正面
                coinElement.style.backgroundColor = "gold"; // 设置正面样式
            } else {
                coinElement.innerText = "反面"; // 显示反面
                coinElement.style.backgroundColor = "silver"; // 设置反面样式
            }
        }, 1000); // 动画持续时间为 1 秒
    }

    // 更新索引，准备播放下一个结果
    currentIndex++;

    // 等待动画结束后重新启用按钮
    setTimeout(() => {
        coinAnimationButton.disabled = false;

        // 如果已经投掷了 6 次，隐藏投掷按钮并显示解卦按钮
        if (currentIndex >= 6) {
            coinAnimationButton.style.display = "none"; // 隐藏投掷按钮
            document.getElementById("displayGuaButton").style.display = "block"; // 显示解卦按钮
        }
    }, 1000); // 等待动画结束后启用按钮
}