// ========================================
// 游戏工具函数库 - Utils
// ========================================

/**
 * 文件路径工具
 */
const PathUtils = {
    /**
     * 构建图片路径
     */
    buildImagePath(eraId, day, page) {
        return `assets/images/${eraId}/day${day}/page${page}.png`;
    },

    /**
     * 构建音频路径
     */
    buildAudioPath(eraId, day, page) {
        return `assets/audio/${eraId}/day${day}/page${page}.mp3`;
    },

    /**
     * 构建游戏音频路径
     */
    buildGameAudioPath(eraId, day, page, type, index = '') {
        // type: instruction, question, option
        return `assets/audio/${eraId}/day${day}/game${page}/${type}${index}.mp3`;
    },

    /**
     * 构建游戏图片路径
     */
    buildGameImagePath(eraId, day, page, type, index = '') {
        // type: explanation, hint
        return `assets/images/${eraId}/day${day}/game${page}/${type}${index}.png`;
    },

    /**
     * 检查文件是否存在
     */
    async checkFileExists(filePath) {
        try {
            const response = await fetch(filePath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    /**
     * 获取文件扩展名
     */
    getFileExtension(filePath) {
        return filePath.split('.').pop().toLowerCase();
    },

    /**
     * 验证文件类型
     */
    isValidImageFile(filePath) {
        const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        return validExtensions.includes(this.getFileExtension(filePath));
    },

    /**
     * 验证音频文件类型
     */
    isValidAudioFile(filePath) {
        const validExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
        return validExtensions.includes(this.getFileExtension(filePath));
    }
};

/**
 * DOM操作工具
 */
const DOMUtils = {
    /**
     * 创建元素
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.styles) {
            Object.entries(options.styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    },

    /**
     * 批量添加事件监听器
     */
    addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    },

    /**
     * 移除所有子元素
     */
    clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * 显示/隐藏元素
     */
    show(element, display = 'block') {
        element.style.display = display;
    },

    hide(element) {
        element.style.display = 'none';
    },

    /**
     * 切换元素显示状态
     */
    toggle(element, display = 'block') {
        if (element.style.display === 'none') {
            this.show(element, display);
        } else {
            this.hide(element);
        }
    },

    /**
     * 添加CSS类
     */
    addClass(element, className) {
        element.classList.add(className);
    },

    /**
     * 移除CSS类
     */
    removeClass(element, className) {
        element.classList.remove(className);
    },

    /**
     * 切换CSS类
     */
    toggleClass(element, className) {
        element.classList.toggle(className);
    },

    /**
     * 检查是否包含CSS类
     */
    hasClass(element, className) {
        return element.classList.contains(className);
    },

    /**
     * 查找元素
     */
    find(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * 查找所有匹配元素
     */
    findAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    /**
     * 获取元素位置信息
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    }
};

/**
 * 动画工具
 */
const AnimationUtils = {
    /**
     * 缓动函数
     */
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },

    /**
     * 简单动画函数
     */
    animate(options) {
        const {
            duration = 1000,
            timing = this.easing.easeOutQuad,
            draw,
            onComplete
        } = options;

        const start = performance.now();

        const animate = (time) => {
            let timeFraction = (time - start) / duration;
            
            if (timeFraction > 1) timeFraction = 1;
            
            const progress = timing(timeFraction);
            draw(progress);
            
            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * 数值插值动画
     */
    animateValue(from, to, duration, callback, easing = this.easing.easeOutQuad) {
        this.animate({
            duration,
            timing: easing,
            draw: (progress) => {
                const current = from + (to - from) * progress;
                callback(current);
            }
        });
    },

    /**
     * 元素淡入
     */
    fadeIn(element, duration = 500, onComplete) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        this.animateValue(0, 1, duration, (opacity) => {
            element.style.opacity = opacity;
        }, this.easing.easeOutQuad);
        
        if (onComplete) {
            setTimeout(onComplete, duration);
        }
    },

    /**
     * 元素淡出
     */
    fadeOut(element, duration = 500, onComplete) {
        this.animateValue(1, 0, duration, (opacity) => {
            element.style.opacity = opacity;
        }, this.easing.easeInQuad);
        
        setTimeout(() => {
            element.style.display = 'none';
            if (onComplete) onComplete();
        }, duration);
    },

    /**
     * 滑动显示
     */
    slideDown(element, duration = 500, onComplete) {
        element.style.display = 'block';
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        
        const targetHeight = element.scrollHeight;
        
        this.animateValue(0, targetHeight, duration, (height) => {
            element.style.height = height + 'px';
        }, this.easing.easeOutQuad);
        
        setTimeout(() => {
            element.style.height = 'auto';
            element.style.overflow = 'visible';
            if (onComplete) onComplete();
        }, duration);
    },

    /**
     * 滑动隐藏
     */
    slideUp(element, duration = 500, onComplete) {
        const currentHeight = element.offsetHeight;
        element.style.height = currentHeight + 'px';
        element.style.overflow = 'hidden';