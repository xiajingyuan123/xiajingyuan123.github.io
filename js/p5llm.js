function addAxios() {
  let scriptTag = document.createElement("script");
  scriptTag.setAttribute("type", "text/javascript");
  scriptTag.src = "https://fastly.jsdelivr.net/npm/axios/dist/axios.min.js";
  document.head.appendChild(scriptTag);
}

addAxios();

class P5LLM {
  messages = [];
  maxMessage = 16;
  systemPrompt = "";
  onComplete = null;
  onStream = null;
  onError = null;

  clearAllMessage() {
    this.messages = [];
  }

  setMaxMessage(max) {
    try {
      max = parseInt(max);
    } catch (error) {
      return;
    }
    this.maxMessage = max;
  }

  setSystemPrompt(systemPrompt) {
    this.systemPrompt = systemPrompt;
  }

  // 发送前包装
  preSend() {
    // trim to max message
    if (this.maxMessage > 0) {
      if (this.messages.length > this.maxMessage) {
        this.messages.splice(1, this.messages.length - this.maxMessage);
      }
    }

    let exactMessages = [
      {
        role: "system",
        content: this.systemPrompt,
      },
      ...this.messages,
    ];

    return exactMessages;
  }

  promptCheck(userPrompt) {
    if (typeof userPrompt === "string") {
      this.messages.push({
        role: "user",
        content: userPrompt,
      });
    } else {
      this.messages = [...this.messages, ...userPrompt];
    }
  }

  send(userPrompt, stream) {
    if (stream) {
      this.stream(userPrompt);
    } else {
      this.dialog(userPrompt);
    }
  }

  dialog(userPrompt) {
    this.promptCheck(userPrompt);
  }

  stream(userPrompt) {
    // 请根据不同模型重写
    this.promptCheck(userPrompt);
  }
}

class P5Spark extends P5LLM {
  appID = "cd769f96";

  Spark() {}
  setModel(model) {}

  generateRandomAPPID() {
    const min = 10000;
    const max = 99999;
    const randomFourDigitNumber =
      Math.floor(Math.random() * (max - min + 1)) + min;
    return randomFourDigitNumber.toString();
  }

  async send(userPrompt, stream) {
    let spark = this; // 匿名函数里会丢失this
    super.dialog(userPrompt);

    let sendMessages = this.preSend();

    let toSend = {
      header: {
        app_id: this.appID,
        uid: this.generateRandomAPPID(),
      },
      parameter: {
        chat: {
          domain: "4.0Ultra",
          temperature: 0.5,
          max_tokens: 8192,
        },
      },
      payload: {
        message: {
          text: sendMessages,
        },
      },
    };

    try {
      let res = await axios.get("https://morethanchat.club/server/getSparkURL");
      const socket = new WebSocket(res.data);
      socket.storage = [];
      socket.onopen = function (event) {
        console.log("WebSocket连接已打开");
        socket.send(JSON.stringify(toSend));
      };
      socket.onmessage = function (event) {
        let jsonMessage = JSON.parse(event.data);
        console.log(jsonMessage);
        let content = jsonMessage.payload.choices.text[0].content;
        socket.storage.push(content);
        if (spark.onStream) {
          spark.onStream(content);
        }
      };
      socket.onclose = function (event) {
        const jointedString = socket.storage.join("");
        console.log(jointedString);
        spark.messages.push({
          role: "assistant",
          content: jointedString,
        });
        console.log("WebSocket连接已关闭", event.code, event.reason);
        console.log(spark.messages);
        if (spark.onComplete) {
          spark.onComplete(jointedString);
        }
      };
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }
}

class P5GLM extends P5LLM {
  // glm-4-0520、glm-4 、glm-4-air、glm-4-airx、 glm-4-flash
  model = "glm-4-air";
  temp = 0.5;
  P5GLM() {}

  setModel(model) {
    // 目前只有一个模型
    this.model = model;
  }

  setTemperature(t) {
    this.temp = t;
  }

  // 发送前包装
  preSend() {
    // trim to max message
    if (this.maxMessage > 0) {
      if (this.messages.length > this.maxMessage) {
        this.messages.splice(1, this.messages.length - this.maxMessage);
      }
    }

    let exactMessages = this.messages;

    if (this.systemPrompt || this.systemPrompt.length > 0) {
      exactMessages = [
        {
          role: "system",
          content: this.systemPrompt,
        },
        ...this.messages,
      ];
    }

    return exactMessages;
  }

  async dialog(userPrompt) {
    super.dialog(userPrompt);
    let sendMessages = this.preSend();
    let content;

    try {
      let res = await axios({
        method: "post",
        url: "https://morethanchat.club/server/dialogGLM",
        data: {
          model: this.model,
          messages: sendMessages,
        },
        temperature: this.temp,
      });

      console.log(res);
      content = res.data.choices[0].message.content;
      this.messages.push({
        role: "assistant",
        content: content,
      });

      if (this.onComplete) {
        this.onComplete(content);
      }

      return content;
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  async stream(userPrompt) {
    super.stream(userPrompt);
    let sendMessages = this.preSend();
    let agent = this;

    let toSend = {
      model: this.model,
      messages: sendMessages,
    };

    let fullContent = "";

    const socket = new WebSocket("wss://morethanchat.club/server/streamGLM");

    try {
      socket.onopen = function (event) {
        console.log("WebSocket连接已打开");
        socket.send(JSON.stringify(toSend));
      };
      socket.onmessage = function (event) {
        console.log(event.data);
        if (agent.onStream) {
          agent.onStream(event.data);
          fullContent += event.data;
        }
      };
      socket.onclose = function (event) {
        if (agent.onComplete) {
          agent.onComplete(fullContent);
        }
        console.log("WebSocket连接已关闭", event.code, event.reason);
      };
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }
}

class P5GLM4V extends P5LLM {
  model = "glm-4v";
  temp = 0.5;
  P5GLM() {}

  setModel(model) {
    // 目前只有一个模型
    this.model = model;
  }

  setTemperature(t) {
    this.temp = t;
  }

  promptCheck(userPrompt) {
    if (typeof userPrompt === "string") {
      // 正则表达式匹配以 'http:' 开头，以 '.jpg' 或 '.png' 结尾的 URL
      const imageRegex = /https?:\/\/[^\s]+\.(jpg|png)/i;
      let imageUrl = "";
      let remainingText = userPrompt;

      // 检查是否有匹配的 URL
      if (imageRegex.test(userPrompt)) {
        // 找到第一个匹配的 URL
        imageUrl = userPrompt.match(imageRegex)[0];
        // 移除 URL 部分，保留剩余的文本
        remainingText = userPrompt.replace(imageRegex, "");
      }

      // 构建新的消息对象
      const newMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: remainingText.trim(), // 去除可能的前后空格
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      };

      // 推送新的消息对象到 messages 数组
      this.messages.push(newMessage);
    } else {
      this.messages = [...this.messages, ...userPrompt];
    }
    console.log(this.messages);
  }

  async dialog(userPrompt) {
    super.dialog(userPrompt);
    let sendMessages = this.preSend();
    console.log(sendMessages);
    let content;

    try {
      let res = await axios({
        method: "post",
        url: "https://morethanchat.club/server/dialogGLM",
        data: {
          model: this.model,
          messages: sendMessages,
        },
        temperature: this.temp,
      });

      console.log(res);
      content = res.data.choices[0].message.content;
      this.messages.push({
        role: "assistant",
        content: content,
      });

      if (this.onComplete) {
        this.onComplete(content);
      }

      return content;
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  async stream(userPrompt) {
    super.stream(userPrompt);
    let sendMessages = this.preSend();
    let agent = this;

    let toSend = {
      model: this.model,
      messages: sendMessages,
    };

    let fullContent = "";

    const socket = new WebSocket("wss://morethanchat.club/server/streamGLM");

    try {
      socket.onopen = function (event) {
        console.log("WebSocket连接已打开");
        socket.send(JSON.stringify(toSend));
      };
      socket.onmessage = function (event) {
        console.log(event.data);
        if (agent.onStream) {
          agent.onStream(event.data);
          fullContent += event.data;
        }
      };
      socket.onclose = function (event) {
        if (agent.onComplete) {
          agent.onComplete(fullContent);
        }
        console.log("WebSocket连接已关闭", event.code, event.reason);
      };
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }
}

class P5GPT extends P5LLM {
  model = "gpt-3.5-turbo";
  P5GPT() {}

  setModel(model) {
    if (model === 4) {
      this.model = "gpt-4";
    } else {
      this.model = "gpt-3.5-turbo";
    }
  }

  async embedding(input) {
    try {
      let res = await axios({
        method: "post",
        url: "https://morethanchat.club/server/embeddingGPT",
        data: {
          input: input,
        },
      });

      let content = res.data["data"][0]["embedding"];

      if (this.onComplete) {
        this.onComplete(content);
      }

      return content;
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  async dialog(userPrompt) {
    super.dialog(userPrompt);
    let sendMessages = this.preSend();
    let content;
    try {
      let res = await axios({
        method: "post",
        url: "https://morethanchat.club/server/dialogGPT",
        data: {
          model: this.model,
          messages: sendMessages,
        },
      });

      console.log(res);
      content = res.data.choices[0].message.content;
      this.messages.push({
        role: "assistant",
        content: content,
      });

      if (this.onComplete) {
        this.onComplete(content);
      }

      return content;
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  stream(userPrompt) {
    super.stream(userPrompt);
    let sendMessages = this.preSend();
    let agent = this;

    const socket = new WebSocket("wss://morethanchat.club/server/streamGPT");

    let toSend = {
      model: this.model,
      messages: sendMessages,
    };

    let fullContent = "";

    try {
      socket.onopen = function (event) {
        console.log("WebSocket连接已打开");
        socket.send(JSON.stringify(toSend));
      };
      socket.onmessage = function (event) {
        console.log(event.data);
        if (agent.onStream) {
          agent.onStream(event.data);
          fullContent += event.data;
        }
      };
      socket.onclose = function (event) {
        if (agent.onComplete) {
          agent.onComplete(fullContent);
        }
        console.log("WebSocket连接已关闭", event.code, event.reason);
      };
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }
}

class P5Dify extends P5LLM {
  constructor() {
    super();
    this.apiKey = ""; // API密钥
    this.url = ""; // 动态设置的API URL
    this.proxyUrl = "https://morethanchat.club/server/dialogDIFY"; // 后端代理的URL
    this.data = {
      query: "", // 用户问题
      inputs: {}, // 自定义输入
      conversation_id: "", // 保留已有的 conversation_id
      response_mode: "blocking", // 阻塞模式
      user: this.user || "default_user", // 默认用户标识
    };
  }

  // 设置DIFY API URL
  setUrl(url) {
    this.url = url;
  }

  // 设置API密钥
  setKey(key) {
    this.apiKey = key;
  }

  clearAllMessage() {
    this.messages = [];
    this.data.conversation_id = "";
  }
  // 发送请求并返回响应数据

  dialog(userInput) {
    this.data.query = userInput;
    super.dialog(userInput);

    return new Promise(async (resolve, reject) => {
      // 构造发往后端的请求体
      const requestData = {
        url: this.url, // DIFY API 的 URL
        key: this.apiKey, // API 密钥
        request: this.data, // 请求体
      };

      try {
        // 通过后端代理发送请求并返回结果
        let response = await axios({
          method: "post",
          url: this.proxyUrl, // 发送到后端代理接口
          headers: {
            "Content-Type": "application/json",
          },
          data: requestData, // 将封装好的数据发送到后端
        });

        // 处理响应数据
        const data = response.data; // 获取后端返回的数据

        if (data?.data?.outputs) {
          let result = data.data.outputs.text || "No result found"; // 提取 text 字段
          resolve(result); // 返回结果
        } else if (data && data.answer) {
          // 保存 conversation_id 以便后续请求继续对话
          if (data.conversation_id) {
            this.data.conversation_id = data.conversation_id;
          }

          let content = data.answer;

          this.messages.push({
            role: "assistant",
            content: content,
          });

          if (this.onComplete) {
            this.onComplete(content);
          }

          resolve(data.answer); // 处理聊天助手 API 响应
        } else {
          resolve("No outputs received"); // 默认情况
        }
      } catch (error) {
        // 捕获错误并返回错误信息
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
        reject(error); // 使用 Promise 返回错误
      }
    });
  }
}

class P5DeepSeek extends P5LLM {
  model = "deepseek-chat";

  setModel(model) {
    this.model = model;
  }

  async dialog(userPrompt) {
    super.dialog(userPrompt);
    let sendMessages = this.preSend();
    let content;

    try {
      let res = await axios({
        method: "post",
        url: "https://morethanchat.club/server/dialogDeepSeek",
        data: {
          model: this.model,
          messages: sendMessages,
        },
      });

      console.log(res);
      content = res.data.choices[0].message.content;
      this.messages.push({
        role: "assistant",
        content: content,
      });

      if (this.onComplete) {
        this.onComplete(content);
      }

      return content;
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  stream(userPrompt) {
    super.stream(userPrompt);
    let sendMessages = this.preSend();
    let agent = this;

    let toSend = {
      model: this.model,
      messages: sendMessages,
    };

    let fullContent = "";

    const socket = new WebSocket(
      "wss://morethanchat.club/server/streamDeepSeek"
    );

    try {
      socket.onopen = function (event) {
        console.log("WebSocket连接已打开");
        socket.send(JSON.stringify(toSend));
      };
      socket.onmessage = function (event) {
        console.log(event.data);
        if (agent.onStream) {
          agent.onStream(event.data);
          fullContent += event.data;
        }
      };
      socket.onclose = function (event) {
        if (agent.onComplete) {
          agent.onComplete(fullContent);
        }
        console.log("WebSocket连接已关闭", event.code, event.reason);
      };
    } catch (error) {
      console.error(error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }
}
