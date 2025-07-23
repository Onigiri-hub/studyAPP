// ローカルストレージキー
const STORAGE_KEY = 'study-app-data-v1';

// アプリデータ
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  categories: []
};

let currentCategory = null;
let currentItem = null;

// データ保存
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 科目一覧を描画
function renderCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = '';

  data.categories.forEach(category => {
    // 進捗を計算
    const total = category.items.length;
    const done = category.items.filter(item => item.done).length;
    const progress = `${done}/${total}`;

    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.textContent = `${category.name} (${progress})`;

    // クリックで画面2へ遷移
    btn.addEventListener('click', () => {
      currentCategory = category;
      // 画面切り替え
      document.getElementById('screen1').classList.add('hidden');
      document.getElementById('screen2').classList.remove('hidden');

      // subject-title を安全に更新
      const titleEl = document.getElementById('subject-title');
      if (titleEl) {
        titleEl.textContent = currentCategory.name;
      }

      renderItems();
    });

    // 長押し・右クリックでアクションメニュー
    btn.addEventListener('contextmenu', e => {
      e.preventDefault();
      showCategoryActionMenu(category);
    });

    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      longPressTimeout = setTimeout(() => {
        showCategoryActionMenu(category);
      }, 600);
    });

    btn.addEventListener('touchend', e => {
      clearTimeout(longPressTimeout);
    });

    list.appendChild(btn);
  });
}

// 項目リストを描画
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

    // スタンプ切り替え（クリック/タップ）
    const toggleStamp = () => {
      item.done = !item.done;
      img.src = item.done ? 'icons/img02.svg' : 'icons/img01.svg';

      // 音を鳴らす
      const sound = new Audio(item.done ? 'sounds/001.mp3' : 'sounds/002.mp3');
      sound.play();

      saveData();
      renderCategories();
    };

    img.addEventListener('click', toggleStamp);
    img.addEventListener('touchstart', e => {
      e.preventDefault();
      toggleStamp();
    });

    const span = document.createElement('span');
    span.textContent = item.text;

    // ⋯メニューボタン
    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.textContent = '⋯';
    menuBtn.addEventListener('click', () => {
      currentItem = { item, index };
      showItemActionMenu();
    });

    li.appendChild(img);
    li.appendChild(span);
    li.appendChild(menuBtn);
    list.appendChild(li);
  });

  renderCategories(); // 進捗を更新
}

// 科目追加
document.getElementById('add-category').addEventListener('click', () => {
  const name = prompt('科目名を入力してください:');
  if (!name) return;

  data.categories.push({ name, items: [] });
  saveData();
  renderCategories();
});

// 項目追加
document.getElementById('add-item').addEventListener('click', () => {
  const text = prompt('項目名を入力してください:');
  if (!text || !currentCategory) return;

  currentCategory.items.push({ text, done: false });
  saveData();
  renderItems();
});

// 戻るボタン
document.getElementById('back-btn').addEventListener('click', () => {
  currentCategory = null;
  document.getElementById('screen2').classList.add('hidden');
  document.getElementById('screen1').classList.remove('hidden');
  renderCategories();
});

// 科目メニュー表示
function showCategoryActionMenu(category) {
  const menu = document.getElementById('action-menu');
  menu.classList.remove('hidden');

  document.getElementById('rename-category').onclick = () => {
    const newName = prompt('新しい科目名を入力:');
    if (newName) {
      category.name = newName;
      saveData();
      renderCategories();
    }
    menu.classList.add('hidden');
  };

  document.getElementById('delete-category').onclick = () => {
    if (confirm('削除しますか？')) {
      data.categories = data.categories.filter(c => c !== category);
      saveData();
      renderCategories();
    }
    menu.classList.add('hidden');
  };

  document.getElementById('cancel-action').onclick = () => {
    menu.classList.add('hidden');
  };
}

// 項目メニュー表示（上へ・下へ・削除）
function showItemActionMenu() {
  const menu = document.getElementById('item-action-menu');
  menu.classList.remove('hidden');

  const { item, index } = currentItem;

  document.getElementById('move-up').onclick = () => {
    if (index > 0) {
      const arr = currentCategory.items;
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      saveData();
      renderItems();
    }
    menu.classList.add('hidden');
  };

  document.getElementById('move-down').onclick = () => {
    const arr = currentCategory.items;
    if (index < arr.length - 1) {
      [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      saveData();
      renderItems();
    }
    menu.classList.add('hidden');
  };

  document.getElementById('delete-item').onclick = () => {
    currentCategory.items.splice(index, 1);
    saveData();
    renderItems();
    menu.classList.add('hidden');
  };

  document.getElementById('cancel-item-action').onclick = () => {
    menu.classList.add('hidden');
  };
}

// エクスポート
document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
});

// インポート
document.getElementById('import-btn').addEventListener('click', () => {
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
