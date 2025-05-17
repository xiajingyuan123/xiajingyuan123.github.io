let globalQuestionInput = "";
function goToFirstPage() {
  location.reload(); // 重新加载页面
}

function initRippleEffect() {
  const canvas = document.getElementById("rippleCanvas");
  if (!canvas) {
      console.error("Canvas not found!");
      return;
  }
  
  const ctx = canvas.getContext("2d");
  
  // 修改 canvas 尺寸调整函数
  function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      // 使用 DPI 缩放来确保清晰度
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // 调整绘图上下文以匹配 DPI
      ctx.scale(dpr, dpr);
      
      // 设置 canvas 的显示尺寸
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
  }
  
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  let ripples = [];
    
    // 修改事件监听，改为监听 startPage 的点击
    document.getElementById('startPage').addEventListener("click", (event) => {
        // 如果点击的是按钮，则不创建水波纹
        if (event.target.classList.contains('btn')) {
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log('Click detected at:', x, y); // 添加调试信息
        ripples.push({ x, y, radius: 0, alpha: 1 });
    });
  
  // 修改绘制水波纹函数
  function drawRipples() {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      ripples.forEach((ripple, index) => {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(122, 237, 225, ${ripple.alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // 更新水波纹
          ripple.radius += 3; // 增加扩散速度
          ripple.alpha -= 0.01; // 降低透明度衰减速度
      });
      
      // 移除已消失的水波纹
      ripples = ripples.filter(ripple => ripple.alpha > 0);
      
      requestAnimationFrame(drawRipples);
  }

  drawRipples();
}

// 在 DOMContentLoaded 事件中初始化水波纹效果
document.addEventListener("DOMContentLoaded", initRippleEffect);

function goToSecondPage(){
    document.getElementById("startPage").classList.remove("active");
    document.getElementById("questionInputPage").classList.add("active");
}

function goToTrirdPage() {
  
  document.getElementById("questionSupplement1").innerText = question1;
  document.getElementById("questionSupplement2").innerText = question2;
  document.getElementById("questionInputPage").classList.remove("active");
  document.getElementById("addInputPage").classList.add("active");
}

function goToFourthPage() {
  document.getElementById("addInputPage").classList.remove("active");
  document.getElementById("coinAnimationPage").classList.add("active");

}

function goToFifthPage() {
  document.getElementById("coinAnimationPage").classList.remove("active");
  document.getElementById("guaPage").classList.add("active");
  displayGua();
}

function goToSixthPage() {
  document.getElementById("guaPage").classList.remove("active");
  document.getElementById("explainationPage").classList.add("active");
  displayGua();
}

function showSecondQuestion() {
  // 隐藏第一个问题及其输入框和按钮
  document.getElementById("questionSupplement1").style.display = "none";
  document.getElementById("questionSupplementInput1").style.display = "none";
  document.getElementById("confirmFirstQuestion").style.display = "none";

  // 显示第二个问题及其输入框和按钮
  document.getElementById("questionSupplement2").style.display = "block";
  document.getElementById("questionSupplementInput2").style.display = "block";
  document.getElementById("confirmSecondQuestion").style.display = "block";
}
