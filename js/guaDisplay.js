function displayGua() {
    const guaContainers = [
        document.getElementById("guaContainer"),       // Page5
        document.getElementById("guaContainerPage6")   // Page6
    ];

    guaContainers.forEach(guaContainer => {
        if (!guaContainer) return; // 防止获取不到某个容器时报错
        guaContainer.innerHTML = ""; // 清空内容
        guaContainer.style.display = "flex";
        guaContainer.style.justifyContent = "center"; // 水平居中
        guaContainer.style.alignItems = "center";
        guaContainer.style.gap = "40px"; // 统一间距

        // 创建原始卦
        const originalGuaWrapper = document.createElement("div");
        originalGuaWrapper.style.display = "flex";
        originalGuaWrapper.style.flexDirection = "column";
        originalGuaWrapper.style.alignItems = "center";

        const originalGua = createGua(originalResults);
        const originalText = document.createElement("div");
        originalText.innerText = originalGuaName; // 设置卦象名称
        originalText.className = "gua-name";

        originalGuaWrapper.appendChild(originalGua);
        originalGuaWrapper.appendChild(originalText);
        guaContainer.appendChild(originalGuaWrapper);

        // 如果发生爻变，添加变卦和箭头
        if (yaoChangedOverall) {
            const arrow = createArrow();
            guaContainer.appendChild(arrow);

            const changedGuaWrapper = document.createElement("div");
            changedGuaWrapper.style.display = "flex";
            changedGuaWrapper.style.flexDirection = "column";
            changedGuaWrapper.style.alignItems = "center";

            const changedGua = createGua(changedResults);
            const changedText = document.createElement("div");
            changedText.innerText = changedGuaName;
            changedText.className = "gua-name";

            changedGuaWrapper.appendChild(changedGua);
            changedGuaWrapper.appendChild(changedText);
            guaContainer.appendChild(changedGuaWrapper);
        }
    });
}


// 创建一个完整的卦象
function createGua(resultsArray) {
    const gua = document.createElement("div");
    gua.className = "gua";

    for (let i = 0; i < resultsArray.length; i++) {
        const line = createLine(resultsArray[i]); // 根据每一行的结果创建线条
        gua.appendChild(line);
    }

    return gua;
}

// 创建一条线（长线或短线）
function createLine(resultArray) {
    const line = document.createElement("div");
    line.className = "gua-line";

    // 判断数组中 1 和 0 的数量
    const ones = resultArray.filter(num => num === 1).length;
    const zeros = resultArray.filter(num => num === 0).length;

    if (ones > zeros) {
        line.classList.add("long-line"); // 长线
    } else {
        line.classList.add("short-line"); // 短线
    }

    return line;
}

// 创建箭头
function createArrow() {
    const arrow = document.createElement("div");
    arrow.className = "gua-arrow";
    arrow.innerText = "  →   "; // 使用箭头符号
    return arrow;
}
