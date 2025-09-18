// app/index.js
// 使用一個標記來防止重複初始化
let isInitialized = false;

// 在檔案最上方引入 CSS 和圖片
import './css/common.css';
import './css/index.css';
import richWomanImg from './assest/13.png';

// 儲存主頁狀態
let indexState = {
    merchantId: null,
    isLoading: false,
};

async function initializeIndex() {
    if (isInitialized) {
        console.log('Index already initialized');
        return;
    }

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    isInitialized = true;
    console.log('Initializing index...');

    // 從 URL 或 localStorage 獲取 merchantId
    const urlMerchantId = getQueryParam('merchantId');
    const merchantId = urlMerchantId || localStorage.getItem('merchantId');

    if (merchantId === 'null' || merchantId === null) {
        console.error('No merchant ID found, redirecting to login');
        redirectToLogin();
        return;
    }

    indexState.merchantId = merchantId;

    // 顯示 merchant ID
    displayMerchantId(merchantId);

    // 設置圖片
    setupImages();

    // 綁定事件監聽器
    bindEventListeners();

    // 儲存到 localStorage
    localStorage.setItem('merchantId', merchantId);

    console.log('Index initialized successfully');
}

function displayMerchantId(merchantId) {
    const merchantIdElement = document.getElementById('merchantId');
    if (merchantIdElement) {
        merchantIdElement.textContent = merchantId;
        merchantIdElement.classList.remove('loading');
    }
}

function setupImages() {
    // 設置卡片圖片
    const cardImages = document.querySelectorAll('.card-icon img');
    cardImages.forEach(img => {
        img.src = richWomanImg;
    });
}

function bindEventListeners() {
    // 綠界斗內條卡片點擊事件
    const donateCard = document.getElementById('donateCard');
    if (donateCard) {
        donateCard.addEventListener('click', handleDonateCardClick);
    }

    // 斗內活動卡片點擊事件
    const eventCard = document.getElementById('eventCard');
    if (eventCard) {
        eventCard.addEventListener('click', handleEventCardClick);
    }

    // 登出按鈕
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 設定按鈕
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', handleSettings);
    }
}

function handleDonateCardClick() {
    if (!indexState.merchantId) {
        showError('商店代號不存在，請重新登入');
        return;
    }

    console.log(
        'Navigating to donate-list with merchantId:',
        indexState.merchantId
    );
    const donateUrl = `donate-list.html?merchantId=${encodeURIComponent(indexState.merchantId)}`;
    window.open(donateUrl, '_blank');
}

function handleEventCardClick() {
    if (!indexState.merchantId) {
        showError('商店代號不存在，請重新登入');
        return;
    }

    console.log(
        'Navigating to event-list with merchantId:',
        indexState.merchantId
    );
    const eventUrl = `event-list.html?merchantId=${encodeURIComponent(indexState.merchantId)}`;
    window.location.href = eventUrl;
}

function handleLogout() {
    // 清除儲存的資料
    localStorage.removeItem('merchantId');

    // 顯示確認訊息
    if (confirm('確定要登出嗎？')) {
        redirectToLogin();
    }
}

function handleSettings() {
    console.log('Navigating to settings');
    window.location.href = 'ecpay-setting.html';
}

function redirectToLogin() {
    console.log('Redirecting to login');
    window.location.href = 'login.html';
}

function showError(message) {
    // 創建臨時錯誤訊息元素
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ffebee;
        color: #c62828;
        padding: 15px 20px;
        border-radius: 6px;
        border-left: 4px solid #c62828;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease-out;
    `;

    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(errorElement);

    // 3秒後自動移除
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 3000);
}

// 添加卡片點擊效果
function addCardClickEffect(element) {
    element.addEventListener('mousedown', () => {
        element.style.transform = 'translateY(-3px) scale(0.98)';
    });

    element.addEventListener('mouseup', () => {
        element.style.transform = 'translateY(-5px) scale(1)';
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0) scale(1)';
    });
}

// 頁面載入完成時初始化
document.addEventListener(
    'DOMContentLoaded',
    () => {
        initializeIndex();

        // 為卡片添加點擊效果
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            addCardClickEffect(card);
        });
    },
    { once: true }
);

// 處理頁面可見性變化
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && indexState.merchantId) {
        console.log('Page became visible, refreshing merchant info');
        displayMerchantId(indexState.merchantId);
    }
});

// 處理瀏覽器返回事件
window.addEventListener('popstate', event => {
    console.log('Browser back/forward detected');
    // 重新初始化以確保狀態正確
    isInitialized = false;
    initializeIndex();
});

// 防止意外離開頁面（開發時可移除）
window.addEventListener('beforeunload', event => {
    if (indexState.merchantId) {
        // 在開發環境下可以註解掉這行
        // event.preventDefault();
        // event.returnValue = '';
    }
});

// 導出一些有用的函數供其他模組使用
window.indexUtils = {
    getMerchantId: () => indexState.merchantId,
    navigateToDonate: handleDonateCardClick,
    navigateToEvent: handleEventCardClick,
    logout: handleLogout,
};
