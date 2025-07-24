const STORAGE_KEY = 'study-app-data-v1';
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { categories: [] };
let currentCategory = null;
let currentItem = null;

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 科目一覧を描画
function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = '';

  data.categories.forEach(category => {
    const total = category.items.length;
    const done = category.items.filter(item => item.done).length;
    const progress = `${done}/${total}`;

    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.textContent = `${category.name} (${progress})`;

    // 通常タップと長押しの判定
    let longPressTimer;
    let longPressed = false;

    btn.addEventListener('pointerdown', () => {
      longPressed = false;
      longPressTimer = setTimeout(() => {
        longPressed = true;
        showCategoryActionMenu(category);
      }, 600);
    });

    btn.addEventListener('pointerup', () => {
      clearTimeout(longPressTimer);
      if (!longPressed) {
        openCategory(category);
      }
    });

    btn.addEventListener('pointerleave', () => {
      clearTimeout(longPressTimer);
    });

    list.appendChild(btn);
  });
}

function openCategory(category) {
  currentCategory = category;
  document.getElementById('screen1').classList.add('hidden');
  document.getElementById('screen2').classList.remove('hidden');
  const titleEl = document.getElementById('subject-title');
  if (titleEl) titleEl.textContent = currentCategory.name;
  renderItems();
}

function renderItems() {
  const list = document.getElementById('item-list');
  list.innerHTML = '';
  if (!currentCategory) return;

  currentCategory.items.forEach((item, index) => {
    const li = document.createElement('li');

    // スタンプアイコン
    const img = document.createElement('img');
    img.src = item.done ? 'icons/img02.svg' : 'icons/img01.svg';
    img.className = 'stamp-img';

    const toggleStamp = () => {
      item.done = !item.done;
      img.src = item.done ? 'icons/img02.svg' : 'icons/img01.svg';

      const sound = new Audio(item.done ? 'sounds/001.mp3' : 'sounds/002.mp3');
      sound.play();

      saveData();
      renderCategories();
    };

    img.addEventListener('pointerup', toggleStamp);

    const span = document.createElement('span');
    span.textContent = item.text;

    // ⋯メニューボタン
    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.textContent = '⋯';
    menuBtn.addEventListener('pointerup', () => {
      currentItem = { item, index };
      showItemActionMenu();
    });

    li.appendChild(img);
    li.appendChild(span);
    li.appendChild(menuBtn);
    list.appendChild(li);
  });

  renderCategories();
}

// 科目追加
document.getElementById('add-category').addEventListener('pointerup', () => {
  const name = prompt('科目名を入力してください:');
  if (!name) return;
  data.categories.push({ name, items: [] });
  saveData();
  renderCategories();
});

// 項目追加
document.getElementById('add-item').addEventListener('pointerup', () => {
  const text = prompt('項目名を入力してください:');
  if (!text || !currentCategory) return;
  currentCategory.items.push({ text, done: false });
  saveData();
  renderItems();
});

// 戻るボタン
document.getElementById('back-btn').addEventListener('pointerup', () => {
  currentCategory = null;
  document.getElementById('screen2').classList.add('hidden');
  document.getElementById('screen1').classList.remove('hidden');
  renderCategories();
});

// オーバーレイ処理
const overlay = document.getElementById('menu-overlay');

function showOverlay() {
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
  document.getElementById('action-menu').classList.add('hidden');
  document.getElementById('item-action-menu').classList.add('hidden');
}

// 背景タップで閉じる
overlay.addEventListener('pointerup', hideOverlay);

// 科目アクションメニュー
function showCategoryActionMenu(category) {
  showOverlay();
  const menu = document.getElementById('action-menu');
  menu.classList.remove('hidden');

  document.getElementById('rename-category').onclick = () => {
    const newName = prompt('新しい科目名を入力:');
    if (newName) {
      category.name = newName;
      saveData();
      renderCategories();
    }
    hideOverlay();
  };

  document.getElementById('delete-category').onclick = () => {
    if (confirm('削除しますか？')) {
      data.categories = data.categories.filter(c => c !== category);
      saveData();
      renderCategories();
    }
    hideOverlay();
  };

  document.getElementById('cancel-action').onclick = () => {
    hideOverlay();
  };
}

// 項目アクションメニュー
function showItemActionMenu() {
  showOverlay();
  const menu = document.getElementById('item-action-menu');
  menu.classList.remove('hidden');

  const { index } = currentItem;

  document.getElementById('move-up').onclick = () => {
    if (index > 0) {
      const arr = currentCategory.items;
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      saveData();
      renderItems();
    }
    hideOverlay();
  };

  document.getElementById('move-down').onclick = () => {
    const arr = currentCategory.items;
    if (index < arr.length - 1) {
      [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      saveData();
      renderItems();
    }
    hideOverlay();
  };

  document.getElementById('delete-item').onclick = () => {
    currentCategory.items.splice(index, 1);
    saveData();
    renderItems();
    hideOverlay();
  };

  document.getElementById('cancel-item-action').onclick = () => {
    hideOverlay();
  };
}

// データのエクスポート
document.getElementById('export-btn').addEventListener('pointerup', () => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
});

// データのインポート
document.getElementById('import-btn').addEventListener('pointerup', () => {
  document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      data = JSON.parse(reader.result);
      saveData();
      renderCategories();
      alert('インポートしました');
    } catch {
      alert('インポート失敗');
    }
  };
  reader.readAsText(file);
});

// 初期表示
renderCategories();
