let prompt_Final = ""; 
let finalAnswer = ""; // 最终的答案



const p5Final = new P5DeepSeek();

function askFinal() {
    globalQuestionSupplementInput1 = document.getElementById("questionSupplementInput1").value;
    globalQuestionSupplementInput2= document.getElementById("questionSupplementInput2").value;
    // 拼接 prompt 的值
    prompt_Final = `用户的疑惑：${globalQuestionInput},
    用户的问题1： ${question1},
    用户的问题2： ${question2},
    用户的问题回答1： ${globalQuestionSupplementInput1},
    用户的问题回答2： ${globalQuestionSupplementInput2},
    占卜得出的古籍原文：${answerInLibrary}`;

     p5Final.setSystemPrompt(`
        你是一名现代的《周易》卦象分析师，请根据：
            1.用户的疑惑，
            2.两个问用户的问题以及他们的回答，
            3.占卜得出的古籍原文，
        给出现代化的解释，解释优先解析古籍原文，用户问答仅做辅助，此外要引用参考书目的具体内容解释。
        参考书目为：朱熹《周易本义》，焦循《易学三书》、尚秉和《周易尚氏学》；
        注意返回的语句不要透露出你是ai回复及不要说明分析过程，而是神秘又亲切的解答，可参考风格：“此卦象征着谦虚谨慎的品德，表示需要在面对问题时保持低调、谦虚、踏实，不要轻易冒险，逐步推进。同时，谦卦也寓意着勇往直前，坚定前行的决心。谦卦的变爻大有卦，象征着成功和富贵荣华，暗示着你的职业规划需要注重实践和勇气，同时要保持谦虚、谨慎的态度。谦卦第五爻变为大有卦，表示小王应该积极努力，勇往直前，有信心迎接未来的挑战。同时，由于大有卦的意义为“富贵荣华”，也暗示着小王的职业规划应该注重实用性和赚钱能力，不仅要追求理想，还要注重实际效益。”
        请返回一个JSON格式的对象，包含1个key：
        请严格按照以下格式{"最终解释":}。
        `);
    p5Final.send(prompt_Final);
    ifWaiting3 = true; // 设置等待状态
    p5Final.onComplete = whenComplete3;
}

// 接收到GPT完整的消息时会调用的函数
function whenComplete3(text) {
    content = text.replace(/\n/g, ""); // 删去换行，以免格式错误
    const chineseCommaRegex = /(?<=":)\s*，|(?<=",)\s*(?=\s*[{])/g; // 可能误用中文逗号
    content = content.replace(chineseCommaRegex, ',');  
    content = content.match(/{[^{}]*}/); // 提取回答中的json格式
    jsonData = JSON.parse(content);
    finalAnswer = jsonData["最终解释"];
    console.log("最终解释:", finalAnswer);
    ifWaiting3 = false; // 重置等待状态
    displayLibraryAnswer();
    displayAnswer();
  }

  function displayAnswer() {
    // 获取页面中用于显示最终解释的元素
    const answerContainer1 = document.getElementById("finalAnswerContainer");

    // 检查是否有最终解释
    if (finalAnswer) {
        answerContainer1.innerText = `解释：${finalAnswer}`;
    } else {
        answerContainer1.innerText = "正在生成最终解释，请稍候...";
    }
}