// ========================================
// 游戏数据管理系统 - Data
// ========================================

/**
 * 游戏数据管理器
 */
class GameDataManager {
    constructor() {
        this.gameData = null;
        this.userProgress = null;
        this.currentUser = null;
        this.cache = new Map();
        
        this.init();
    }

    async init() {
        await this.loadGameData();
        await this.loadUserProgress();
    }

    /**
     * 加载游戏基础数据
     */
    async loadGameData() {
        try {
            // 尝试从缓存加载
            if (this.cache.has('gameData')) {
                this.gameData = this.cache.get('gameData');
                return;
            }

            // 加载游戏配置数据
            this.gameData = {
                // 时代配置
                eras: [
                    {
                        id: 'ancient',
                        title: '古代文明',
                        icon: '🏛️',
                        description: '探索古代文明的奥秘',
                        unlocked: true,
                        totalDays: 7,
                        storyPath: 'assets/images/ancient',
                        audioPath: 'assets/audio/ancient'
                    },
                    {
                        id: 'medieval',
                        title: '中世纪',
                        icon: '🏰',
                        description: '体验中世纪的骑士精神',
                        unlocked: false, // 需要完成前一个时代才能解锁
                        totalDays: 7,
                        storyPath: 'assets/images/medieval',
                        audioPath: 'assets/audio/medieval'
                    },
                    {
                        id: 'renaissance',
                        title: '文艺复兴',
                        icon: '🎨',
                        description: '感受文艺复兴的辉煌',
                        unlocked: false,
                        totalDays: 7,
                        storyPath: 'assets/images/renaissance',
                        audioPath: 'assets/audio/renaissance'
                    },
                    {
                        id: 'industrial',
                        title: '工业革命',
                        icon: '⚙️',
                        description: '见证工业革命的变迁',
                        unlocked: false,
                        totalDays: 7,
                        storyPath: 'assets/images/industrial',
                        audioPath: 'assets/audio/industrial'
                    },
                    {
                        id: 'modern',
                        title: '现代时代',
                        icon: '🌆',
                        description: '迈向现代文明',
                        unlocked: false,
                        totalDays: 7,
                        storyPath: 'assets/images/modern',
                        audioPath: 'assets/audio/modern'
                    },
                    {
                        id: 'future',
                        title: '未来世界',
                        icon: '🚀',
                        description: '想象未来的可能',
                        unlocked: false,
                        totalDays: 7,
                        storyPath: 'assets/images/future',
                        audioPath: 'assets/audio/future'
                    }
                ],

                // 游戏配置
                gameConfig: {
                    pagesPerDay: 10, // 每天的绘本页数
                    gameInsertPages: [2, 3, 5, 8], // 在这些页面插入游戏
                    questionsPerGame: 5, // 每个游戏的题目数量
                    scorePerQuestion: 10, // 每题分数
                    passingScore: 60 // 及格分数百分比
                },

                // 默认题目模板
                defaultGameTemplate: {
                    type: 'multiple_choice',
                    instruction: 'instruction.mp3',
                    questions: []
                }
            };

            // 缓存数据
            this.cache.set('gameData', this.gameData);
            
        } catch (error) {
            console.error('加载游戏数据失败:', error);
            this.gameData = this.getDefaultGameData();
        }
    }

    /**
     * 加载用户进度数据
     */
    async loadUserProgress() {
        try {
            const savedProgress = localStorage.getItem('userProgress');
            if (savedProgress) {
                this.userProgress = JSON.parse(savedProgress);
            } else {
                this.userProgress = this.createDefaultUserProgress();
            }
        } catch (error) {
            console.error('加载用户进度失败:', error);
            this.userProgress = this.createDefaultUserProgress();
        }
    }

    /**
     * 创建默认用户进度
     */
    createDefaultUserProgress() {
        const progress = {
            currentUser: '',
            eras: {}
        };

        // 为每个时代创建默认进度
        this.gameData.eras.forEach(era => {
            progress.eras[era.id] = {
                unlocked: era.id === 'ancient', // 只有第一个时代默认解锁
                currentDay: 1,
                completedDays: 0,
                totalScore: 0,
                days: {}
            };

            // 为每一天创建进度记录
            for (let day = 1; day <= era.totalDays; day++) {
                progress.eras[era.id].days[day] = {
                    completed: false,
                    currentPage: 1,
                    gamesCompleted: 0,
                    scores: [],
                    totalScore: 0
                };
            }
        });

        return progress;
    }

    /**
     * 获取特定绘本的数据
     */
    async getStorybookData(eraId, day) {
        const cacheKey = `storybook_${eraId}_${day}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const era = this.gameData.eras.find(e => e.id === eraId);
        if (!era) {
            throw new Error(`未找到时代: ${eraId}`);
        }

        const storybookData = {
            eraId: eraId,
            day: day,
            title: `${era.title} - 第${day}天`,
            pages: []
        };

        // 生成页面数据
        for (let page = 1; page <= this.gameData.gameConfig.pagesPerDay; page++) {
            const pageData = {
                pageNumber: page,
                image: `${era.storyPath}/day${day}/page${page}.png`,
                audio: `${era.audioPath}/day${day}/page${page}.mp3`,
                hasGame: this.gameData.gameConfig.gameInsertPages.includes(page),
                gameData: null
            };

            // 如果这一页有游戏，加载游戏数据
            if (pageData.hasGame) {
                pageData.gameData = await this.getGameData(eraId, day, page);
            }

            storybookData.pages.push(pageData);
        }

        // 缓存数据
        this.cache.set(cacheKey, storybookData);
        return storybookData;
    }

    /**
     * 获取游戏数据
     */
    async getGameData(eraId, day, page) {
        const cacheKey = `game_${eraId}_${day}_${page}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const era = this.gameData.eras.find(e => e.id === eraId);
        const gameData = {
            type: 'homophone_selection', // 同音字选择游戏
            instruction: `${era.audioPath}/day${day}/game${page}/instruction.mp3`,
            questions: []
        };

        // 生成示例题目数据
        for (let i = 1; i <= this.gameData.gameConfig.questionsPerGame; i++) {
            const question = {
                id: i,
                questionAudio: `${era.audioPath}/day${day}/game${page}/question${i}.mp3`,
                options: [
                    {
                        text: '选项A',
                        audio: `${era.audioPath}/day${day}/game${page}/option${i}_1.mp3`
                    },
                    {
                        text: '选项B', 
                        audio: `${era.audioPath}/day${day}/game${page}/option${i}_2.mp3`
                    },
                    {
                        text: '选项C',
                        audio: `${era.audioPath}/day${day}/game${page}/option${i}_3.mp3`
                    },
                    {
                        text: '选项D',
                        audio: `${era.audioPath}/day${day}/game${page}/option${i}_4.mp3`
                    }
                ],
                correctAnswer: 0, // 正确答案索引
                explanation: `${era.storyPath}/day${day}/game${page}/explanation${i}.png`
            };

            gameData.questions.push(question);
        }

        // 缓存数据
        this.cache.set(cacheKey, gameData);
        return gameData;
    }

    /**
     * 更新用户进度
     */
    updateUserProgress(eraId, day, progressData) {
        if (!this.userProgress.eras[eraId]) {
            return false;
        }

        const eraProgress = this.userProgress.eras[eraId];
        const dayProgress = eraProgress.days[day];

        // 更新日进度
        if (progressData.currentPage !== undefined) {
            dayProgress.currentPage = progressData.currentPage;
        }

        if (progressData.gameScore !== undefined) {
            dayProgress.scores.push(progressData.gameScore);
            dayProgress.totalScore += progressData.gameScore;
            dayProgress.gamesCompleted++;
        }

        if (progressData.completed !== undefined) {
            dayProgress.completed = progressData.completed;
            
            if (progressData.completed) {
                eraProgress.completedDays = Math.max(eraProgress.completedDays, day);
                eraProgress.currentDay = Math.min(day + 1, this.gameData.eras.find(e => e.id === eraId).totalDays);
                
                // 检查是否需要解锁下一个时代
                this.checkUnlockNextEra(eraId);
            }
        }

        // 保存到本地存储
        this.saveUserProgress();
        return true;
    }

    /**
     * 检查是否解锁下一个时代
     */
    checkUnlockNextEra(currentEraId) {
        const currentEraIndex = this.gameData.eras.findIndex(e => e.id === currentEraId);
        const currentEra = this.gameData.eras[currentEraIndex];
        const currentProgress = this.userProgress.eras[currentEraId];

        // 如果当前时代完成度达到要求，解锁下一个时代
        if (currentProgress.completedDays >= currentEra.totalDays) {
            const nextEra = this.gameData.eras[currentEraIndex + 1];
            if (nextEra && !this.userProgress.eras[nextEra.id].unlocked) {
                this.userProgress.eras[nextEra.id].unlocked = true;
                this.saveUserProgress();
                
                // 触发解锁事件
                this.dispatchEvent('eraUnlocked', { eraId: nextEra.id });
            }
        }
    }

    /**
     * 获取时代列表（包含进度信息）
     */
    getErasWithProgress() {
        return this.gameData.eras.map(era => {
            const progress = this.userProgress.eras[era.id];
            return {
                ...era,
                unlocked: progress.unlocked,
                progress: progress.completedDays,
                currentDay: progress.currentDay,
                totalScore: progress.totalScore
            };
        });
    }

    /**
     * 获取用户统计信息
     */
    getUserStats() {
        let totalDaysCompleted = 0;
        let totalScore = 0;
        let unlockedEras = 0;

        Object.values(this.userProgress.eras).forEach(era => {
            totalDaysCompleted += era.completedDays;
            totalScore += era.totalScore;
            if (era.unlocked) unlockedEras++;
        });

        return {
            totalDaysCompleted,
            totalScore,
            unlockedEras,
            totalEras: this.gameData.eras.length,
            currentUser: this.userProgress.currentUser
        };
    }

    /**
     * 设置当前用户
     */
    setCurrentUser(username) {
        this.currentUser = username;
        this.userProgress.currentUser = username;
        this.saveUserProgress();
    }

    /**
     * 保存用户进度到本地存储
     */
    saveUserProgress() {
        try {
            localStorage.setItem('userProgress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('保存用户进度失败:', error);
        }
    }

    /**
     * 重置用户进度
     */
    resetUserProgress() {
        this.userProgress = this.createDefaultUserProgress();
        this.saveUserProgress();
    }

    /**
     * 导出用户数据
     */
    exportUserData() {
        return {
            userProgress: this.userProgress,
            stats: this.getUserStats(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * 导入用户数据
     */
    importUserData(userData) {
        try {
            if (userData.userProgress) {
                this.userProgress = userData.userProgress;
                this.saveUserProgress();
                return true;
            }
        } catch (error) {
            console.error('导入用户数据失败:', error);
        }
        return false;
    }

    /**
     * 获取默认游戏数据（备用）
     */
    getDefaultGameData() {
        return {
            eras: [
                {
                    id: 'ancient',
                    title: '古代文明',
                    icon: '🏛️',
                    description: '探索古代文明的奥秘',
                    unlocked: true,
                    totalDays: 7
                }
            ],
            gameConfig: {
                pagesPerDay: 10,
                gameInsertPages: [2, 3, 5],
                questionsPerGame: 5,
                scorePerQuestion: 10,
                passingScore: 60
            }
        };
    }

    /**
     * 事件分发
     */
    dispatchEvent(eventType, data) {
        const event = new CustomEvent(`gameData:${eventType}`, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * 配置管理器
 */
class ConfigManager {
    constructor() {
        this.config = this.getDefaultConfig();
        this.loadConfig();
    }

    getDefaultConfig() {
        return {
            // 音频设置
            audio: {
                masterVolume: 0.7,
                enableSFX: true,
                enableBGM: true,
                enableVoice: true
            },

            // 显示设置
            display: {
                fullscreen: false,
                showSubtitles: false,
                animationSpeed: 'normal', // slow, normal, fast
                theme: 'default'
            },

            // 游戏设置
            gameplay: {
                autoPlay: true,
                skipIntro: false,
                difficulty: 'normal', // easy, normal, hard
                enableHints: true
            },

            // 可访问性设置
            accessibility: {
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                screenReaderSupport: false
            }
        };
    }

    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('gameConfig');
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            }
        } catch (error) {
            console.error('加载配置失败:', error);
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('gameConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('保存配置失败:', error);
        }
    }

    get(section, key) {
        if (key) {
            return this.config[section]?.[key];
        }
        return this.config[section];
    }

    set(section, key, value) {
        if (!this.config[section]) {
            this.config[section] = {};
        }
        
        if (typeof key === 'object') {
            // 批量设置
            this.config[section] = { ...this.config[section], ...key };
        } else {
            // 单个设置
            this.config[section][key] = value;
        }
        
        this.saveConfig();
        this.dispatchConfigChange(section, key, value);
    }

    dispatchConfigChange(section, key, value) {
        const event = new CustomEvent('configChanged', {
            detail: { section, key, value, config: this.config }
        });
        document.dispatchEvent(event);
    }

    reset() {
        this.config = this.getDefaultConfig();
        this.saveConfig();
    }
}

// 创建全局实例
window.GameData = {
    manager: new GameDataManager(),
    config: new ConfigManager()
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameDataManager, ConfigManager };
}