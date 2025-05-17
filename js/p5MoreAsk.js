// 创建更多询问llm
const p5MoreAsk = new P5DeepSeek();
let ifWaiting = false;
let question1 = "";
let question2 = "";
let prompt = "";

// 根据用户输入的问题，以及爻变的结果，生成两个新的问题，帮助后续更好的推算卦象
function askp5MoreAsk() {
    // 检查是否正在等待
    if (ifWaiting) {
        alert("正在处理，请稍候...");
        return;
    }

    // 拼接 prompt 的值
    globalQuestionInput = document.getElementById("questionInput").value;
    if (globalQuestionInput === "") {
        alert("Please enter a question.");
        return;
    }

    // 禁用按钮
    const askButton = document.getElementById("askButton");
    askButton.disabled = true;

    prompt = `用户的问题：${globalQuestionInput}；占卜得出的卦象原文：${answerInLibrary}；`;
    p5MoreAsk.setSystemPrompt(`
        请根据用户问题以及占卜得出的卦象原文，追问两个问题(只有2个问号），
        提问的逻辑是：尝试将卦象原文中出现的元素（如水火等）映射到用户提问的现实具体元素上。如果用户原本问题里已有可对应上的元素，则追问问题为核实其细节；如果没有能对应上的，则追问问题为询问用户现实可能对应的元素是什么。
        如果用户问题过于模糊，则追问问题要给出优秀的提问范例让用户将问题具体化，
        注意在问题中说人话，且不要透漏出你知晓卦象原文！
        用JSON格式回答问题，两个key为"问题1"和"问题2"。
        请严格按照以下格式{"问题1":,"问题2":}。`);
    p5MoreAsk.send(prompt);
    ifWaiting = true; // 设置等待状态
    p5MoreAsk.onComplete = whenComplete;
}

// 接收到GPT完整的消息时会调用的函数
function whenComplete(text) {
    content = text.replace(/\n/g, ""); // 删去换行，以免格式错误
    const chineseCommaRegex = /(?<=":)\s*，|(?<=",)\s*(?=\s*[{])/g; // 可能误用中文逗号
    content = content.replace(chineseCommaRegex, ',');
    content = content.match(/{[^{}]*}/); // 提取回答中的json格式
    jsonData = JSON.parse(content);
    question1 = jsonData["问题1"];
    question2 = jsonData["问题2"];
    console.log("问题1:", question1);
    console.log("问题2:", question2);
    ifWaiting = false; // 重置等待状态

    // 启用按钮
    const askButton = document.getElementById("askButton");
    askButton.disabled = false;

    goToTrirdPage(); // 跳转到第三页
}