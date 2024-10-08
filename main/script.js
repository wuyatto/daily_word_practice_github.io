import { wordList } from "./wordList.js";

let selectedWords = [];
let currentIndex = 0;
let correctAnswers = {};
let correctNumber = 0;
let bingo = true;

const submit = document.getElementById("submit");
const practiceView = document.getElementById('practice-view');
const inputLine = document.getElementById("input-line");
const feedback = document.getElementById("feedback");
const inputContainer = document.getElementById("input-container");

inputLine.addEventListener("focus", function () {
    inputLine.classList.add("focused");
});

inputLine.addEventListener("blur", function () {
    inputLine.classList.remove("focused");
});

inputLine.addEventListener("input", function () {
    // 定义字体大小的数组（从大到小）
    const fontSizes = [24, 18, 14];   // 分别表示正常、偏小、最小的字体大小
    const thresholds = [
        20,  // 第一分段的阈值
        27,  // 第二分段的阈值
    ];  // 阈值与字体大小数组相对应

    // 根据输入宽度判断应该使用哪一个字体大小
    if (inputLine.innerText.length <= thresholds[0]) {
        this.style.fontSize = fontSizes[0] + "px";  // 使用正常大小
    } else if (inputLine.innerText.length > thresholds[0] && inputLine.innerText.length <= thresholds[1]) {
        this.style.fontSize = fontSizes[1] + "px";  // 使用偏小大小
    } else if (inputLine.innerText.length > thresholds[1]) {
        this.style.fontSize = fontSizes[2] + "px";  // 使用最小字体
    }
});

// 初始化页面
function init() {
    practiceView.classList.remove('hidden');
    practiceView.classList.add('fade-in');

    getRandomWords();
    createCircles();
    displayWord();

    submit.addEventListener("click", function () {
        if (submit.textContent === "提交") {
            checkAnswer();
        }
        else if (submit.textContent === "下一个") {
            nextWord();
        } else if (submit.textContent === "继续练习") {
            location.reload();
        }
    });

    inputLine.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            checkAnswer();
        } else if (window.getComputedStyle(this).color === "rgb(255, 0, 0)") {
            this.innerText = "";
            this.style.color = "black";
            feedback.innerHTML = "";
        }
    });

    this.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            if (submit.textContent === "下一个") {
                nextWord();
            } else if (submit.textContent === "继续练习") {
                location.reload();
            }
        }
    }, true)
}

// 创建小圆圈
function createCircles() {
    const circlesContainer = document.getElementById('circles');
    for (let i = 0; i < selectedWords.length; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circlesContainer.appendChild(circle);
    }
}

// 更新小圆圈的状态
function updateCircles(index, singal) {
    const circles = document.querySelectorAll('.circle');

    circles[index].classList.remove('active');
    // current 5; check 6
    if (singal === 5) {
        circles[index].classList.add('active');
    } else if (singal === 6 && selectedWords[index] === '✔') {
        circles[index].classList.add('completed');
    }
}

// 获取URL参数
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 随机选择10道题目
function getRandomWords() {
    const maxNumber = parseInt(getQueryParameter('words')) || 10; // 默认为10道题目;
    const keys = Object.keys(wordList);
    while (selectedWords.length < maxNumber) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (!selectedWords.includes(randomKey)) {
            selectedWords.push(randomKey);
        }
    }
}

// 显示当前搭配的中文释义和本次练习的序号
function displayWord() {
    // 跳过已经正确的题目
    while (selectedWords[currentIndex] === "✔" && correctNumber !== selectedWords.length) {
        currentIndex = (currentIndex + 1) % selectedWords.length;
    }

    if (correctNumber !== selectedWords.length) {
        const chineseMeaning = wordList[selectedWords[currentIndex]];
        correctAnswers = selectedWords[currentIndex];
        document.getElementById("chinese-meaning").textContent = chineseMeaning;
        document.getElementById("word-counter").textContent = `${currentIndex + 1} / ${selectedWords.length}`;
        feedback.textContent = "";
        updateCircles(currentIndex, 5);     // current 5; check 6
    }
}

// 检查用户输入
function checkAnswer() {
    const input = inputLine.innerText.trim().toLowerCase();
    let correct = (input === correctAnswers);

    if (correct) {
        inputLine.setAttribute("contenteditable", "false");
        inputLine.style.color = "green";
    } else {
        // 移除抖动效果
        inputLine.classList.remove('shake');
        // 强制浏览器重绘
        void inputLine.offsetWidth;
        // 再次添加抖动效果
        inputLine.classList.add('shake');
        inputLine.style.color = "red";
    }
    inputLine.blur();

    if (correct) {
        if (bingo) {
            selectedWords[currentIndex] = "✔"; // 将正确的题目替换为 ✔
            correctNumber++;
        }

        if (correctNumber !== selectedWords.length) {
            submit.textContent = "下一个";
        } else {
            inputLine.blur();
            feedback.innerHTML = "恭喜你，成功通关！";
            feedback.style.color = "green";
            submit.textContent = "继续练习";
        }

        updateCircles(currentIndex, 6);     // current 5; check 6
    } else {
        bingo = false;
        feedback.innerHTML = `错误，请修正！<br>答案: ${correctAnswers}`;
        feedback.style.color = "red";
    }
}

function nextWord() {
    inputLine.style.fontSize = 24 + "px";
    // 添加淡出效果
    inputContainer.classList.add('fade-out');
    setTimeout(() => {
        inputLine.innerText = "";
        inputLine.setAttribute("contenteditable", "true");
        inputLine.style.color = "black";

        submit.textContent = "提交";
        currentIndex = (currentIndex + 1) % selectedWords.length;
        bingo = true;
        inputLine.focus();

        displayWord();
        inputContainer.classList.remove('fade-out');
        inputContainer.classList.add('fade-in');

        // 移除fade-in类，避免后续切换时影响动画
        setTimeout(() => inputContainer.classList.remove('fade-in'), 200);
    }, 200); // 等待淡出动画完成
}

window.onload = init;