// ========================================
// 游戏组件系统 - Components
// ========================================

/**
 * 音频管理组件
 */
class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.volume = 0.7;
        this.isMuted = false;
        this.audioCache = new Map();
    }

    // 预加载音频
    preloadAudio(audioPath) {
        if (!this.audioCache.has(audioPath)) {
            const audio = new Audio(audioPath);
            audio.preload = 'auto';
            this.audioCache.set(audioPath, audio);
        }
        return this.audioCache.get(audioPath);
    }

    // 播放音频
    async play(audioPath, options = {}) {
        try {
            // 停止当前播放的音频
            this.stop();

            const audio = this.preloadAudio(audioPath);
            audio.volume = this.isMuted ? 0 : (options.volume || this.volume);
            audio.currentTime = 0;

            this.currentAudio = audio;

            // 添加事件监听
            if (options.onEnded) {
                audio.addEventListener('ended', options.onEnded, { once: true });
            }

            await audio.play();
            return audio;
        } catch (error) {
            console.warn('音频播放失败:', audioPath, error);
            return null;
        }
    }

    // 停止播放
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    // 暂停播放
    pause() {
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
    }

    // 继续播放
    resume() {
        if (this.currentAudio) {
            this.currentAudio.play().catch(e => console.warn('继续播放失败:', e));
        }
    }

    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.isMuted ? 0 : this.volume;
        }
    }

    // 静音/取消静音
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.currentAudio) {
            this.currentAudio.volume = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }
}

/**
 * 动画效果组件
 */
class AnimationManager {
    constructor() {
        this.activeAnimations = new Set();
    }

    // 淡入效果
    fadeIn(element, duration = 500) {
        return new Promise((resolve) => {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            const animation = element.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: duration,
                easing: 'ease-out',
                fill: 'forwards'
            });

            this.activeAnimations.add(animation);
            
            animation.onfinish = () => {
                this.activeAnimations.delete(animation);
                element.style.opacity = '1';
                resolve();
            };
        });
    }

    // 淡出效果
    fadeOut(element, duration = 500) {
        return new Promise((resolve) => {
            const animation = element.animate([
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-20px)' }
            ], {
                duration: duration,
                easing: 'ease-in',
                fill: 'forwards'
            });

            this.activeAnimations.add(animation);
            
            animation.onfinish = () => {
                this.activeAnimations.delete(animation);
                element.style.display = 'none';
                resolve();
            };
        });
    }

    // 加分动画
    showScoreAnimation(element, score, color = '#4CAF50') {
        const scoreElement = document.createElement('div');
        scoreElement.textContent = `+${score}`;
        scoreElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
            color: ${color};
            pointer-events: none;
            z-index: 1000;
        `;
        
        element.appendChild(scoreElement);

        const animation = scoreElement.animate([
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 1, transform: 'translate(-50%, -70%) scale(1.2)' },
            { opacity: 0, transform: 'translate(-50%, -90%) scale(0.8)' }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        this.activeAnimations.add(animation);

        animation.onfinish = () => {
            this.activeAnimations.delete(animation);
            scoreElement.remove();
        };
    }

    // 选项高亮动画
    highlightOption(element, isCorrect = true) {
        const color = isCorrect ? '#4CAF50' : '#F44336';
        const animation = element.animate([
            { backgroundColor: 'transparent', transform: 'scale(1)' },
            { backgroundColor: color, transform: 'scale(1.05)' },
            { backgroundColor: 'transparent', transform: 'scale(1)' }
        ], {
            duration: 800,
            easing: 'ease-in-out'
        });

        this.activeAnimations.add(animation);
        animation.onfinish = () => this.activeAnimations.delete(animation);
        
        return animation;
    }

    // 进度条动画
    animateProgressBar(progressBar, targetWidth) {
        const animation = progressBar.animate([
            { width: progressBar.style.width || '0%' },
            { width: targetWidth + '%' }
        ], {
            duration: 500,
            easing: 'ease-out',
            fill: 'forwards'
        });

        this.activeAnimations.add(animation);
        animation.onfinish = () => {
            this.activeAnimations.delete(animation);
            progressBar.style.width = targetWidth + '%';
        };

        return animation;
    }

    // 清除所有动画
    clearAllAnimations() {
        this.activeAnimations.forEach(animation => {
            animation.cancel();
        });
        this.activeAnimations.clear();
    }
}

/**
 * 游戏界面组件
 */
class GameInterface {
    constructor(container, gameData, callbacks = {}) {
        this.container = container;
        this.gameData = gameData;
        this.callbacks = callbacks;
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = gameData.questions ? gameData.questions.length : 0;
        this.selectedOption = null;
        
        this.audioManager = new AudioManager();
        this.animationManager = new AnimationManager();
        
        this.init();
    }

    init() {
        this.createGameUI();
        this.startGame();
    }

    createGameUI() {
        this.container.innerHTML = `
            <div class="game-interface">
                <!-- 游戏头部 -->
                <div class="game-header">
                    <div class="game-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="gameProgressFill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">
                            <span id="currentQuestionNum">1</span> / <span id="totalQuestionsNum">${this.totalQuestions}</span>
                        </span>
                    </div>
                    <div class="game-score">
                        <span class="score-label">得分: </span>
                        <span class="score-value" id="scoreValue">0</span>
                    </div>
                    <button class="sound-toggle" id="soundToggle">🔊</button>
                </div>

                <!-- 游戏主体 -->
                <div class="game-body" id="gameBody">
                    <!-- 指导语阶段 -->
                    <div class="instruction-stage" id="instructionStage">
                        <div class="instruction-content">
                            <h2>🎯 游戏说明</h2>
                            <p>请仔细听题目，然后选择正确的选项</p>
                            <button class="start-game-btn" id="startGameBtn">开始游戏</button>
                        </div>
                    </div>

                    <!-- 游戏进行阶段 -->
                    <div class="question-stage hidden" id="questionStage">
                        <div class="question-content">
                            <div class="question-audio">
                                <button class="play-question-btn" id="playQuestionBtn">🎵 播放题目</button>
                            </div>
                            <div class="question-options" id="questionOptions">
                                <!-- 选项将动态生成 -->
                            </div>
                            <button class="submit-answer-btn hidden" id="submitAnswerBtn">提交答案</button>
                        </div>
                    </div>

                    <!-- 反馈阶段 -->
                    <div class="feedback-stage hidden" id="feedbackStage">
                        <div class="feedback-content">
                            <div class="feedback-icon" id="feedbackIcon">✅</div>
                            <div class="feedback-text" id="feedbackText">回答正确!</div>
                            <div class="feedback-explanation" id="feedbackExplanation">
                                <!-- 解释图片或文字 -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 游戏底部 -->
                <div class="game-footer">
                    <button class="exit-game-btn" id="exitGameBtn">退出游戏</button>
                </div>
            </div>
        `;

        this.addGameStyles();
        this.bindGameEvents();
    }

    addGameStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-interface {
                width: 100%;
                height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                flex-direction: column;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            }

            .game-header {
                background: rgba(255, 255, 255, 0.95);
                padding: 15px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .game-progress {
                flex: 1;
                max-width: 300px;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .progress-bar {
                flex: 1;
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .progress-text {
                font-size: 14px;
                color: #666;
                white-space: nowrap;
            }

            .game-score {
                font-size: 18px;
                font-weight: bold;
                color: #333;
            }

            .score-value {
                color: #4CAF50;
            }

            .sound-toggle {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .sound-toggle:hover {
                background: rgba(0,0,0,0.1);
            }

            .game-body {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .instruction-stage, .question-stage, .feedback-stage {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 600px;
                width: 100%;
            }

            .instruction-content h2 {
                color: #333;
                margin-bottom: 20px;
                font-size: 28px;
            }

            .instruction-content p {
                color: #666;
                font-size: 18px;
                margin-bottom: 30px;
            }

            .start-game-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .start-game-btn:hover {
                transform: translateY(-2px);
            }

            .play-question-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 15px 25px;
                border-radius: 15px;
                font-size: 16px;
                cursor: pointer;
                margin-bottom: 30px;
                transition: all 0.2s;
            }

            .play-question-btn:hover {
                background: #1976D2;
                transform: scale(1.05);
            }

            .question-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }

            .option-btn {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                padding: 20px;
                border-radius: 15px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }

            .option-btn:hover {
                border-color: #667eea;
                transform: translateY(-2px);
            }

            .option-btn.selected {
                border-color: #667eea;
                background: rgba(102, 126, 234, 0.1);
            }

            .submit-answer-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 15px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .submit-answer-btn:hover {
                background: #45a049;
            }

            .feedback-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }

            .feedback-text {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }

            .feedback-text.correct {
                color: #4CAF50;
            }

            .feedback-text.incorrect {
                color: #F44336;
            }

            .feedback-explanation {
                margin-top: 20px;
            }

            .explanation-image {
                max-width: 200px;
                border-radius: 10px;
            }

            .game-footer {
                padding: 20px;
                text-align: center;
            }

            .exit-game-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .exit-game-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .hidden {
                display: none !important;
            }

            @media (max-width: 768px) {
                .game-header {
                    padding: 10px 15px;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .instruction-stage, .question-stage, .feedback-stage {
                    padding: 20px;
                    margin: 10px;
                }

                .question-options {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindGameEvents() {
        // 开始游戏
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.playInstructionAudio();
        });

        // 播放题目
        document.getElementById('playQuestionBtn').addEventListener('click', () => {
            this.playCurrentQuestion();
        });

        // 提交答案
        document.getElementById('submitAnswerBtn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // 音频开关
        document.getElementById('soundToggle').addEventListener('click', () => {
            const isMuted = this.audioManager.toggleMute();
            document.getElementById('soundToggle').textContent = isMuted ? '🔇' : '🔊';
        });

        // 退出游戏
        document.getElementById('exitGameBtn').addEventListener('click', () => {
            if (this.callbacks.onExit) {
                this.callbacks.onExit();
            }
        });
    }

    async startGame() {
        // 播放指导语音频
        if (this.gameData.instruction) {
            await this.audioManager.play(this.gameData.instruction);
        }
    }

    async playInstructionAudio() {
        if (this.gameData.instruction) {
            await this.audioManager.play(this.gameData.instruction, {
                onEnded: () => {
                    this.showQuestionStage();
                }
            });
        } else {
            this.showQuestionStage();
        }
    }

    showQuestionStage() {
        document.getElementById('instructionStage').classList.add('hidden');
        document.getElementById('questionStage').classList.remove('hidden');
        this.loadCurrentQuestion();
    }

    loadCurrentQuestion() {
        const question = this.gameData.questions[this.currentQuestion];
        const optionsContainer = document.getElementById('questionOptions');
        
        // 清空之前的选项
        optionsContainer.innerHTML = '';
        this.selectedOption = null;
        
        // 更新进度
        this.updateProgress();
        
        // 创建选项按钮
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option.text;
            optionBtn.setAttribute('data-index', index);
            
            optionBtn.addEventListener('click', () => {
                this.selectOption(index, optionBtn);
            });
            
            optionsContainer.appendChild(optionBtn);
        });
        
        // 自动播放题目
        setTimeout(() => {
            this.playCurrentQuestion();
        }, 500);
    }

    async playCurrentQuestion() {
        const question = this.gameData.questions[this.currentQuestion];
        if (question.questionAudio) {
            await this.audioManager.play(question.questionAudio);
        }
    }

    selectOption(index, buttonElement) {
        // 移除之前选中的样式
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 添加选中样式
        buttonElement.classList.add('selected');
        this.selectedOption = index;
        
        // 播放选项音频
        const question = this.gameData.questions[this.currentQuestion];
        const selectedOptionData = question.options[index];
        if (selectedOptionData.audio) {
            this.audioManager.play(selectedOptionData.audio);
        }
        
        // 显示提交按钮
        document.getElementById('submitAnswerBtn').classList.remove('hidden');
    }

    async submitAnswer() {
        if (this.selectedOption === null) return;
        
        const question = this.gameData.questions[this.currentQuestion];
        const isCorrect = this.selectedOption === question.correctAnswer;
        
        // 显示反馈
        this.showFeedback(isCorrect);
        
        // 更新分数
        if (isCorrect) {
            this.score += 10;
            this.updateScore();
        }
        
        // 2秒后进入下一题
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    showFeedback(isCorrect) {
        const question = this.gameData.questions[this.currentQuestion];
        
        // 隐藏问题阶段，显示反馈阶段
        document.getElementById('questionStage').classList.add('hidden');
        document.getElementById('feedbackStage').classList.remove('hidden');
        
        // 设置反馈内容
        const feedbackIcon = document.getElementById('feedbackIcon');
        const feedbackText = document.getElementById('feedbackText');
        const feedbackExplanation = document.getElementById('feedbackExplanation');
        
        if (isCorrect) {
            feedbackIcon.textContent = '✅';
            feedbackText.textContent = '回答正确！';
            feedbackText.className = 'feedback-text correct';
            
            // 显示加分动画
            this.animationManager.showScoreAnimation(feedbackIcon.parentElement, 10);
        } else {
            feedbackIcon.textContent = '❌';
            feedbackText.textContent = '回答错误';
            feedbackText.className = 'feedback-text incorrect';
        }
        
        // 显示解释（如果有）
        if (question.explanation) {
            const explanationImg = document.createElement('img');
            explanationImg.src = question.explanation;
            explanationImg.className = 'explanation-image';
            explanationImg.alt = '题目解释';
            feedbackExplanation.innerHTML = '';
            feedbackExplanation.appendChild(explanationImg);
        }
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            // 游戏结束
            this.endGame();
        } else {
            // 继续下一题
            document.getElementById('feedbackStage').classList.add('hidden');
            document.getElementById('questionStage').classList.remove('hidden');
            this.loadCurrentQuestion();
        }
    }

    endGame() {
        // 游戏结束，返回绘本
        if (this.callbacks.onComplete) {
            this.callbacks.onComplete({
                score: this.score,
                totalQuestions: this.totalQuestions,
                correctAnswers: Math.floor(this.score / 10)
            });
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        const progressFill = document.getElementById('gameProgressFill');
        const currentQuestionNum = document.getElementById('currentQuestionNum');
        
        this.animationManager.animateProgressBar(progressFill, progress);
        currentQuestionNum.textContent = this.currentQuestion + 1;
    }

    updateScore() {
        const scoreElement = document.getElementById('scoreValue');
        scoreElement.textContent = this.score;
        
        // 分数动画
        scoreElement.animate([
            { transform: 'scale(1)', color: '#4CAF50' },
            { transform: 'scale(1.2)', color: '#4CAF50' },
            { transform: 'scale(1)', color: '#4CAF50' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    }

    // 清理资源
    destroy() {
        this.audioManager.stop();
        this.animationManager.clearAllAnimations();
    }
}

/**
 * 绘本阅读组件
 */
class StorybookReader {
    constructor(container, storybookData, callbacks = {}) {
        this.container = container;
        this.storybookData = storybookData;
        this.callbacks = callbacks;
        this.currentPage = 1;
        this.totalPages = storybookData.pages.length;
        this.audioManager = new AudioManager();
        
        this.init();
    }

    init() {
        this.loadPage(this.currentPage);
        this.setupKeyboardControls();
    }

    loadPage(pageNumber) {
        const page = this.storybookData.pages[pageNumber - 1];
        if (!page) return;

        // 更新图片
        const pageImage = document.getElementById('pageImage');
        pageImage.src = page.image;
        
        // 更新页面指示器
        document.getElementById('currentPage').textContent = pageNumber;
        document.getElementById('totalPages').textContent = this.totalPages;
        
        // 更新按钮状态
        document.getElementById('prevBtn').disabled = pageNumber === 1;
        document.getElementById('nextBtn').disabled = pageNumber === this.totalPages;
        
        // 播放音频
        if (page.audio) {
            this.audioManager.play(page.audio);
        }
        
        // 检查游戏插入点
        if (page.hasGame) {
            setTimeout(() => {
                this.showGamePrompt(page);
            }, 2000);
        }
    }

    showGamePrompt(page) {
        const gamePrompt = document.createElement('div');
        gamePrompt.className = 'game-prompt';
        gamePrompt.innerHTML = `
            <div class="game-prompt-content">
                <h3>🎮 小游戏时间！</h3>
                <p>准备好挑战了吗？</p>
                <button class="start-mini-game-btn" onclick="this.parentElement.parentElement.remove()">开始游戏</button>
                <button class="skip-game-btn" onclick="this.parentElement.parentElement.remove()">跳过</button>
            </div>
        `;
        
        // 添加样式
        gamePrompt.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = gamePrompt.querySelector('.game-prompt-content');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
        `;
        
        // 绑定事件
        const startBtn = gamePrompt.querySelector('.start-mini-game-btn');
        startBtn.addEventListener('click', () => {
            gamePrompt.remove();
            if (this.callbacks.onStartGame) {
                this.callbacks.onStartGame(page.gameData);
            }
        });
        
        const skipBtn = gamePrompt.querySelector('.skip-game-btn');
        skipBtn.addEventListener('click', () => {
            gamePrompt.remove();
        });
        
        document.body.appendChild(gamePrompt);
    }

    changePage(direction) {
        const newPage = this.currentPage + direction;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.loadPage(this.currentPage);
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.changePage(-1);
            } else if (e.key === 'ArrowRight') {
                this.changePage(1);
            }
        });
    }

    destroy() {
        this.audioManager.stop();
    }
}

// 导出组件
window.GameComponents = {
    AudioManager,
    AnimationManager,
    GameInterface,
    StorybookReader
};