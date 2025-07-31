// ========================================
// 改进的打地鼠游戏模块
// ========================================

/**
 * 打地鼠游戏类
 */
class WhackMoleGame {
    constructor(container, gameData, callbacks = {}) {
        this.container = container;
        this.gameData = gameData;
        this.callbacks = callbacks;
        
        // 游戏状态
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = gameData.questions.length;
        this.isGameActive = false;
        this.timeLeft = 30; // 每题30秒
        this.timer = null;
        this.selectedMole = null;
        
        // 地鼠洞配置
        this.holes = [];
        this.holeCount = 6; // 6个洞
        this.moleShowTime = 10000; // 地鼠显示时间延长到10秒，让用户有足够时间查看
        this.currentMoles = []; // 当前显示的地鼠
        
        this.audioManager = new (window.GameComponents?.AudioManager || class { 
            play() { return Promise.resolve(); } 
            stop() {} 
        })();
        
        this.init();
    }

    init() {
        this.createGameUI();
        this.bindEvents();
        this.startGame();
    }

    createGameUI() {
        this.container.innerHTML = `
            <div class="whack-mole-game">
                <!-- 游戏头部信息 -->
                <div class="game-header">
                    <div class="game-info">
                        <div class="score-display">
                            <span class="score-label">得分:</span>
                            <span class="score-value" id="whackScore">0</span>
                        </div>
                        <div class="question-counter">
                            <span id="currentQ">1</span> / <span id="totalQ">${this.totalQuestions}</span>
                        </div>
                        <div class="time-display">
                            <span class="time-label">时间:</span>
                            <span class="time-value" id="timeLeft">30</span>s
                        </div>
                    </div>
                    <button class="exit-btn" id="exitGame">退出游戏</button>
                </div>

                <!-- 游戏说明阶段 -->
                <div class="instruction-panel" id="instructionPanel">
                    <div class="instruction-content">
                        <h2>🎯 打地鼠游戏</h2>
                        <p>找出与其他词语不同的那一个，快速点击它！</p>
                        <p class="tip-text">💡 提示：将鼠标移到词语上可以看到解释图片</p>
                        <div class="instruction-demo">
                            <div class="demo-holes">
                                <div class="demo-hole">
                                    <div class="demo-mole">苹果</div>
                                </div>
                                <div class="demo-hole">
                                    <div class="demo-mole different">香蕉</div>
                                </div>
                                <div class="demo-hole">
                                    <div class="demo-mole">苹果</div>
                                </div>
                            </div>
                            <p class="demo-text">⬆ 点击不同的词语（香蕉）</p>
                        </div>
                        <button class="start-btn" id="startWhackGame">开始游戏</button>
                    </div>
                </div>

                <!-- 游戏主体 -->
                <div class="game-board hidden" id="gameBoard">
                    <div class="question-display" id="questionDisplay">
                        <p class="question-text" id="questionText">找出不同的词语</p>
                        <button class="play-audio-btn" id="playQuestionAudio">🔊 播放题目</button>
                    </div>
                    
                    <div class="mole-field" id="moleField">
                        <!-- 地鼠洞将通过JavaScript生成 -->
                    </div>
                    
                    <div class="game-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="gameProgress" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <!-- 结果显示 -->
                <div class="result-panel hidden" id="resultPanel">
                    <div class="result-content">
                        <div class="result-icon" id="resultIcon">✅</div>
                        <h3 class="result-title" id="resultTitle">回答正确！</h3>
                        <div class="result-score">+10分</div>
                        <div class="next-question-timer">
                            <span id="nextTimer">3</span>秒后下一题
                        </div>
                    </div>
                </div>

                <!-- 游戏结束面板 -->
                <div class="game-end-panel hidden" id="gameEndPanel">
                    <div class="end-content">
                        <h2>🎉 游戏完成！</h2>
                        <div class="final-score">
                            <span class="score-label">最终得分:</span>
                            <span class="final-score-value" id="finalScore">0</span>
                        </div>
                        <div class="performance-rating" id="performanceRating">
                            <!-- 表现评价 -->
                        </div>
                        <button class="continue-btn" id="continueStory">继续故事</button>
                    </div>
                </div>

                <!-- 解释图片悬浮窗 -->
                <div class="explanation-tooltip" id="explanationTooltip">
                    <img id="explanationImage" src="" alt="解释图片">
                </div>
            </div>
        `;

        this.addGameStyles();
    }

    addGameStyles() {
        // 检查样式是否已添加
        if (document.getElementById('whack-mole-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'whack-mole-styles';
        style.textContent = `
            .whack-mole-game {
                width: 100%;
                height: 100vh;
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
            }

            .game-header {
                background: rgba(255, 255, 255, 0.95);
                padding: 15px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .game-info {
                display: flex;
                gap: 30px;
                align-items: center;
            }

            .score-display, .question-counter, .time-display {
                font-size: 18px;
                font-weight: bold;
            }

            .score-value {
                color: #00b894;
            }

            .time-value {
                color: #e17055;
            }

            .exit-btn {
                background: #e17055;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .exit-btn:hover {
                background: #d63031;
                transform: translateY(-2px);
            }

            /* 说明面板 */
            .instruction-panel {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .instruction-content {
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }

            .instruction-content h2 {
                color: #2d3436;
                margin-bottom: 20px;
                font-size: 28px;
            }

            .instruction-content p {
                color: #636e72;
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.5;
            }

            .tip-text {
                color: #74b9ff !important;
                font-weight: bold;
                font-size: 14px !important;
                margin-bottom: 30px !important;
            }

            .instruction-demo {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
            }

            .demo-holes {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
            }

            .demo-hole {
                width: 80px;
                height: 60px;
                background: #8d4004;
                border-radius: 50%;
                position: relative;
                border: 3px solid #5d2a02;
            }

            .demo-mole {
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                background: #fed330;
                color: #2d3436;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid #f39c12;
                animation: demoMoleBounce 1s ease-in-out infinite;
            }

            .demo-mole.different {
                background: #fd79a8;
                border-color: #e84393;
                animation: demoMoleHighlight 1s ease-in-out infinite;
            }

            .demo-text {
                color: #74b9ff;
                font-weight: bold;
                margin: 0;
            }

            @keyframes demoMoleBounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-5px); }
            }

            @keyframes demoMoleHighlight {
                0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
                50% { transform: translateX(-50%) translateY(-5px) scale(1.1); }
            }

            .start-btn {
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }

            .start-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(116, 185, 255, 0.3);
            }

            /* 游戏主体 */
            .game-board {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 20px;
            }

            .question-display {
                text-align: center;
                margin-bottom: 20px;
            }

            .question-text {
                color: white;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .play-audio-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .play-audio-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            /* 地鼠区域 */
            .mole-field {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 20px;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }

            .mole-hole {
                position: relative;
                background: #8d4004;
                border-radius: 50%;
                border: 5px solid #5d2a02;
                cursor: pointer;
                transition: all 0.2s;
                min-height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .mole-hole:hover {
                transform: scale(1.05);
            }

            /* 修改：地鼠始终显示 */
            .mole {
                background: #fed330;
                color: #2d3436;
                padding: 12px 16px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                border: 3px solid #f39c12;
                cursor: pointer;
                transition: all 0.3s;
                user-select: none;
                min-width: 80px;
                text-align: center;
                /* 移除位置动画，让地鼠始终显示 */
                position: static;
                animation: moleIdle 2s ease-in-out infinite;
            }

            .mole:hover {
                transform: scale(1.1);
                background: #fdcb6e;
            }

            .mole.different {
                background: #fd79a8;
                border-color: #e84393;
                animation: moleIdle 2s ease-in-out infinite, molePulse 1s ease-in-out infinite;
            }

            .mole.correct {
                background: #00b894;
                border-color: #00a085;
                animation: correctHit 0.5s ease-out;
            }

            .mole.wrong {
                background: #e17055;
                border-color: #d63031;
                animation: wrongHit 0.5s ease-out;
            }

            /* 修改动画：地鼠待机动画 */
            @keyframes moleIdle {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }

            @keyframes molePulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(253, 121, 168, 0.7); }
                50% { box-shadow: 0 0 0 10px rgba(253, 121, 168, 0); }
            }

            @keyframes correctHit {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); background: #00b894; }
                100% { transform: scale(0); opacity: 0; }
            }

            @keyframes wrongHit {
                0% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.1) rotate(-5deg); }
                75% { transform: scale(1.1) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }

            .game-progress {
                margin-top: 20px;
                padding: 0 20px;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00b894, #55efc4);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            /* 解释图片悬浮窗 */
            .explanation-tooltip {
                position: absolute;
                background: white;
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 10000;
                max-width: 200px;
            }

            .explanation-tooltip.show {
                opacity: 1;
            }

            .explanation-tooltip img {
                width: 100%;
                height: auto;
                border-radius: 5px;
                display: block;
            }

            .explanation-tooltip.no-image {
                background: white;
                width: 150px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                font-size: 14px;
            }

            .explanation-tooltip.no-image::before {
                content: '暂无图片';
            }

            /* 结果面板 */
            .result-panel {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .result-content {
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                animation: resultAppear 0.5s ease-out;
            }

            .result-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }

            .result-title {
                font-size: 24px;
                margin-bottom: 15px;
                color: #2d3436;
            }

            .result-score {
                font-size: 32px;
                font-weight: bold;
                color: #00b894;
                margin-bottom: 20px;
            }

            .next-question-timer {
                font-size: 16px;
                color: #636e72;
            }

            @keyframes resultAppear {
                0% { 
                    opacity: 0;
                    transform: scale(0.5) translateY(-50px);
                }
                100% { 
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* 游戏结束面板 */
            .game-end-panel {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .end-content {
                background: white;
                padding: 50px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                animation: endPanelAppear 0.8s ease-out;
            }

            .end-content h2 {
                color: #2d3436;
                margin-bottom: 30px;
                font-size: 32px;
            }

            .final-score {
                font-size: 24px;
                margin-bottom: 20px;
            }

            .final-score-value {
                color: #00b894;
                font-weight: bold;
                font-size: 36px;
            }

            .performance-rating {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
                font-size: 18px;
                color: #2d3436;
            }

            .continue-btn {
                background: linear-gradient(135deg, #00b894 0%, #55efc4 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }

            .continue-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0, 184, 148, 0.3);
            }

            @keyframes endPanelAppear {
                0% { 
                    opacity: 0;
                    transform: scale(0.3) rotate(-10deg);
                }
                100% { 
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
            }

            .hidden {
                display: none !important;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .game-header {
                    padding: 10px 15px;
                    flex-wrap: wrap;
                }

                .game-info {
                    gap: 15px;
                    font-size: 16px;
                }

                .mole-field {
                    gap: 15px;
                    padding: 15px;
                }

                .mole-hole {
                    min-height: 100px;
                }

                .mole {
                    padding: 8px 12px;
                    font-size: 14px;
                    min-width: 60px;
                }

                .instruction-content {
                    padding: 30px 20px;
                    margin: 10px;
                }

                .end-content {
                    padding: 30px 20px;
                    margin: 10px;
                }

                .explanation-tooltip {
                    max-width: 150px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // 开始游戏
        document.getElementById('startWhackGame').addEventListener('click', () => {
            this.showGameBoard();
        });

        // 播放题目音频
        document.getElementById('playQuestionAudio').addEventListener('click', () => {
            this.playQuestionAudio();
        });

        // 退出游戏
        document.getElementById('exitGame').addEventListener('click', () => {
            if (this.callbacks.onExit) {
                this.callbacks.onExit();
            }
        });

        // 继续故事
        document.getElementById('continueStory').addEventListener('click', () => {
            if (this.callbacks.onComplete) {
                this.callbacks.onComplete({
                    score: this.score,
                    totalQuestions: this.totalQuestions,
                    correctAnswers: this.score / 10
                });
            }
        });
    }

    showGameBoard() {
        document.getElementById('instructionPanel').classList.add('hidden');
        document.getElementById('gameBoard').classList.remove('hidden');
        
        this.createMoleHoles();
        this.loadQuestion();
    }

    createMoleHoles() {
        const moleField = document.getElementById('moleField');
        moleField.innerHTML = '';
        
        this.holes = [];
        
        for (let i = 0; i < this.holeCount; i++) {
            const hole = document.createElement('div');
            hole.className = 'mole-hole';
            hole.setAttribute('data-hole-index', i);
            
            hole.addEventListener('click', (e) => {
                this.handleMoleClick(e, i);
            });
            
            moleField.appendChild(hole);
            this.holes.push(hole);
        }
    }

    async loadQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
            return;
        }

        const question = this.gameData.questions[this.currentQuestion];
        
        // 更新UI
        document.getElementById('currentQ').textContent = this.currentQuestion + 1;
        document.getElementById('questionText').textContent = question.prompt || '找出不同的词语';
        
        // 更新进度
        const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        document.getElementById('gameProgress').style.width = progress + '%';
        
        // 清空所有地鼠洞
        this.clearAllMoles();
        
        // 播放题目音频
        if (question.questionAudio) {
            await this.audioManager.play(question.questionAudio);
        }
        
        // 短暂延迟后显示地鼠
        setTimeout(() => {
            this.showMoles(question);
            this.startQuestionTimer();
        }, 500);
    }

    showMoles(question) {
        this.clearAllMoles();
        this.currentMoles = [];
        
        // 随机选择要显示地鼠的洞
        const availableHoles = [...Array(this.holeCount).keys()];
        const selectedHoles = [];
        
        // 至少显示和选项数量相同的地鼠
        const molesToShow = Math.min(question.words.length, this.holeCount);
        
        for (let i = 0; i < molesToShow; i++) {
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            selectedHoles.push(availableHoles.splice(randomIndex, 1)[0]);
        }
        
        // 在选中的洞里显示地鼠
        selectedHoles.forEach((holeIndex, wordIndex) => {
            if (wordIndex < question.words.length) {
                this.showMoleInHole(holeIndex, question.words[wordIndex], wordIndex === question.correctAnswer);
            }
        });
    }

    showMoleInHole(holeIndex, word, isCorrect) {
        const hole = this.holes[holeIndex];
        const mole = document.createElement('div');
        mole.className = `mole ${isCorrect ? 'different' : ''}`;
        mole.textContent = word.text;
        mole.setAttribute('data-correct', isCorrect);
        mole.setAttribute('data-hole', holeIndex);
        
        // 添加鼠标悬浮事件显示解释图片
        this.addMoleHoverEvents(mole, word);
        
        // 不再播放音频，改为显示图片
        // if (word.audio) {
        //     setTimeout(() => {
        //         this.audioManager.play(word.audio);
        //     }, Math.random() * 1000);
        // }
        
        hole.appendChild(mole);
        this.currentMoles.push({ hole: holeIndex, mole, isCorrect });
        
        // 地鼠不再自动消失，一直显示
        // setTimeout(() => {
        //     if (mole.parentNode && !mole.classList.contains('correct') && !mole.classList.contains('wrong')) {
        //         mole.remove();
        //     }
        // }, this.moleShowTime);
    }

    addMoleHoverEvents(mole, word) {
        const tooltip = document.getElementById('explanationTooltip');
        const img = document.getElementById('explanationImage');
        
        mole.addEventListener('mouseenter', (e) => {
            if (!this.isGameActive) return;
            
            // 构建解释图片路径
            const eraId = this.gameData.eraId || 'ancient';
            const day = this.gameData.day || 1;
            const page = this.gameData.page || 2;
            const imagePath = `assets/images/${eraId}/day${day}/game${page}/explanation_${word.text}.png`;
            
            // 显示悬浮窗
            this.showTooltip(e, imagePath);
        });
        
        mole.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        mole.addEventListener('mousemove', (e) => {
            if (!this.isGameActive) return;
            this.updateTooltipPosition(e);
        });
    }

    showTooltip(event, imagePath) {
        const tooltip = document.getElementById('explanationTooltip');
        const img = document.getElementById('explanationImage');
        
        // 重置样式
        tooltip.classList.remove('no-image');
        img.style.display = 'block';
        
        // 设置图片路径
        img.src = imagePath;
        
        // 处理图片加载错误
        img.onerror = () => {
            img.style.display = 'none';
            tooltip.classList.add('no-image');
        };
        
        img.onload = () => {
            tooltip.classList.remove('no-image');
            img.style.display = 'block';
        };
        
        // 显示悬浮窗
        this.updateTooltipPosition(event);
        tooltip.classList.add('show');
    }

    hideTooltip() {
        const tooltip = document.getElementById('explanationTooltip');
        tooltip.classList.remove('show');
    }

    updateTooltipPosition(event) {
        const tooltip = document.getElementById('explanationTooltip');
        const rect = this.container.getBoundingClientRect();
        
        let x = event.clientX - rect.left + 15;
        let y = event.clientY - rect.top - 10;
        
        // 防止悬浮窗超出游戏区域
        const tooltipWidth = 200; // 最大宽度
        const tooltipHeight = 150; // 估计高度
        
        if (x + tooltipWidth > this.container.offsetWidth) {
            x = event.clientX - rect.left - tooltipWidth - 15;
        }
        
        if (y < 0) {
            y = event.clientY - rect.top + 25;
        }
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    handleMoleClick(event, holeIndex) {
        const mole = event.target.closest('.mole');
        if (!mole || !this.isGameActive) return;
        
        const isCorrect = mole.getAttribute('data-correct') === 'true';
        
        this.selectedMole = { mole, isCorrect, holeIndex };
        
        // 隐藏悬浮窗
        this.hideTooltip();
        
        // 停止计时器
        this.stopQuestionTimer();
        
        // 处理答案
        this.handleAnswer(isCorrect, mole);
    }

    handleAnswer(isCorrect, moleElement) {
        this.isGameActive = false;
        
        // 显示动画
        if (isCorrect) {
            moleElement.classList.add('correct');
            this.score += 10;
            this.updateScore();
            this.showResult(true, '+10分');
        } else {
            moleElement.classList.add('wrong');
            this.showResult(false, '答错了');
        }
        
        // 隐藏其他地鼠
        this.currentMoles.forEach(moleData => {
            if (moleData.mole !== moleElement && moleData.mole.parentNode) {
                moleData.mole.style.opacity = '0.3';
            }
        });
        
        // 2秒后进入下一题
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    showResult(isCorrect, message) {
        const resultPanel = document.getElementById('resultPanel');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultScore = resultPanel.querySelector('.result-score');
        
        resultIcon.textContent = isCorrect ? '✅' : '❌';
        resultTitle.textContent = isCorrect ? '回答正确！' : '回答错误';
        resultScore.textContent = message;
        resultScore.style.color = isCorrect ? '#00b894' : '#e17055';
        
        resultPanel.classList.remove('hidden');
        
        // 倒计时
        let countdown = 3;
        const timer = document.getElementById('nextTimer');
        timer.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            timer.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        setTimeout(() => {
            resultPanel.classList.add('hidden');
        }, 2000);
    }

    startQuestionTimer() {
        this.timeLeft = 30;
        this.isGameActive = true;
        this.updateTimeDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimeDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    stopQuestionTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isGameActive = false;
    }

    handleTimeout() {
        this.stopQuestionTimer();
        this.hideTooltip(); // 隐藏可能显示的悬浮窗
        this.showResult(false, '时间到！');
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    nextQuestion() {
        this.currentQuestion++;
        this.clearAllMoles();
        this.hideTooltip(); // 确保隐藏悬浮窗
        
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
        } else {
            this.loadQuestion();
        }
    }

    async playQuestionAudio() {
        const question = this.gameData.questions[this.currentQuestion];
        if (question.questionAudio) {
            await this.audioManager.play(question.questionAudio);
        }
    }

    clearAllMoles() {
        this.holes.forEach(hole => {
            const moles = hole.querySelectorAll('.mole');
            moles.forEach(mole => mole.remove());
        });
        this.currentMoles = [];
    }

    updateScore() {
        document.getElementById('whackScore').textContent = this.score;
    }

    updateTimeDisplay() {
        const timeElement = document.getElementById('timeLeft');
        timeElement.textContent = this.timeLeft;
        
        // 时间不足10秒时变红
        if (this.timeLeft <= 10) {
            timeElement.style.color = '#e17055';
            timeElement.style.fontWeight = 'bold';
        } else {
            timeElement.style.color = '#2d3436';
            timeElement.style.fontWeight = 'normal';
        }
    }

    endGame() {
        this.stopQuestionTimer();
        this.hideTooltip(); // 确保隐藏悬浮窗
        
        // 计算表现评价
        const correctRate = (this.score / 10) / this.totalQuestions;
        let rating = '';
        let ratingColor = '';
        
        if (correctRate >= 0.9) {
            rating = '🏆 完美表现！';
            ratingColor = '#f39c12';
        } else if (correctRate >= 0.7) {
            rating = '⭐ 表现优秀！';
            ratingColor = '#00b894';
        } else if (correctRate >= 0.5) {
            rating = '👍 继续努力！';
            ratingColor = '#74b9ff';
        } else {
            rating = '💪 多多练习！';
            ratingColor = '#fd79a8';
        }
        
        // 显示最终结果
        document.getElementById('finalScore').textContent = this.score;
        const ratingElement = document.getElementById('performanceRating');
        ratingElement.textContent = rating;
        ratingElement.style.color = ratingColor;
        
        document.getElementById('gameEndPanel').classList.remove('hidden');
    }

    destroy() {
        this.stopQuestionTimer();
        this.hideTooltip();
        this.audioManager.stop();
        this.clearAllMoles();
    }

    async startGame() {
        // 播放指导语音频
        if (this.gameData.instruction) {
            await this.audioManager.play(this.gameData.instruction);
        }
    }
}

// ========================================
// 游戏数据模块 - 三个Demo游戏（改进版）
// ========================================

/**
 * 游戏数据生成器
 */
class GameDataGenerator {
    static generateWhackMoleGame(gameId, eraId, day, page) {
        const games = {
            // 游戏1: 水果分类
            game1: {
                id: 'whack_mole_fruits',
                type: 'whack_mole',
                title: '同音不同字',
                eraId: eraId,
                day: day,
                page: page,
                instruction: `assets/audio/${eraId}/day${day}/game${page}/instruction.mp3`,
                questions: [
                    {
                        id: 1,
                        prompt: '那個遮住的字跟其他字意思不一樣呢？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '鉛*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*得了', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*必 ', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '忍*住', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 2,
                        prompt: '那個遮住的字跟其他字意思不一樣呢？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '鉛*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*得了', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*必 ', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '忍*住', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 3,
                        prompt: '那個遮住的字跟其他字意思不一樣呢？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '鉛*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*得了', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*必 ', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '忍*住', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 4,
                        prompt: '那個遮住的字跟其他字意思不一樣呢？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '鉛*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*得了', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*必 ', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '忍*住', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 5,
                       prompt: '那個遮住的字跟其他字意思不一樣呢？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '鉛*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*得了', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*必 ', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '忍*住', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    }
                ]
            },

            // 游戏2: 动物分类
            game2: {
                id: 'whack_mole_animals',
                type: 'whack_mole',
                title: '不同結構',
                eraId: eraId,
                day: day,
                page: page,
                instruction: `assets/audio/${eraId}/day${day}/game${page}/instruction.mp3`,
                questions: [
                    {
                        id: 1,
                        prompt: '請找出相同結構的詞語？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '心煩', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '山羊', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '心虛', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '肉麻', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 2,
                        prompt: '請找出相同結構的詞語？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '心煩', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '山羊', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '心虛', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '肉麻', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 3,
                        prompt: '請找出相同結構的詞語？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '心煩', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '山羊', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '心虛', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '肉麻', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 4,
                        prompt: '請找出相同結構的詞語？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '心煩', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '山羊', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '心虛', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '肉麻', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    },
                    {
                        id: 5,
                        prompt: '請找出相同結構的詞語？',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '心煩', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '山羊', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '心虛', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_汽车.png` },
                            { text: '肉麻', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_橙子.png` }
                        ],
                        correctAnswer: 1 // 汽车
                    }
                ]
            },

            // 游戏3: 颜色分类
            game3: {
                id: 'whack_mole_colors',
                type: 'whack_mole',
                title: '同字不同義',
                eraId: eraId,
                day: day,
                page: page,
                instruction: `assets/audio/${eraId}/day${day}/game${page}/instruction.mp3`,
                questions: [
                    {
                        id: 1,
                        prompt: '請判斷遮住的字中那個跟其遮住的字意義不一樣',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '樓*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_草莓.png` },
                            { text: '*級', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*點', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*替', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_樱桃.png` }
                        ],
                        correctAnswer: 3 // 香蕉
                    },
                    {
                        id: 2,
                        prompt: '請判斷遮住的字中那個跟其遮住的字意義不一樣',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '樓*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_草莓.png` },
                            { text: '*級', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*點', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*替', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_樱桃.png` }
                        ],
                        correctAnswer: 3 // 香蕉
                    },
                    {
                        id: 3,
                        prompt: '請判斷遮住的字中那個跟其遮住的字意義不一樣',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '樓*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_草莓.png` },
                            { text: '*級', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*點', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*替', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_樱桃.png` }
                        ],
                        correctAnswer: 3 // 香蕉
                    },
                    {
                        id: 4,
                        prompt: '請判斷遮住的字中那個跟其遮住的字意義不一樣',
                        questionAudio: `assets/audio/${eraId}/day${day}/game${page}/question1.mp3`,
                        words: [
                            { text: '樓*', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_草莓.png` },
                            { text: '*級', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_苹果.png` },
                            { text: '*點', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_香蕉.png` },
                            { text: '*替', explanation: `assets/images/${eraId}/day${day}/game${page}/explanation_樱桃.png` }
                        ],
                        correctAnswer: 3 // 香蕉
                    }
                ]
            }
        };

        return games[gameId] || games.game1;
    }

    static getGameByPage(eraId, day, page) {
        // 根据页面决定使用哪个游戏
        const gameMapping = {
            2: 'game1', // 第2页用水果游戏
            3: 'game2', // 第3页用动物游戏
            5: 'game3'  // 第5页用颜色游戏
        };
        
        const gameId = gameMapping[page] || 'game1';
        return this.generateWhackMoleGame(gameId, eraId, day, page);
    }
}

// 导出到全局
window.WhackMoleGame = WhackMoleGame;
window.GameDataGenerator = GameDataGenerator;