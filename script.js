// ===== データ保存と読み込み =====
let categories = JSON.parse(localStorage.getItem('categories') || '[]');
let currentCategoryId = null;

function saveData() {
  localStorage.setItem('categories', JSON.stringify(categories));
}

function loadData() {
  categories = JSON.parse(localStorage.getItem('categories') || '[]');
}

// ===== 画面描画 =====
function updateProgress() {
  categories.forEach(cat => {
    const completed = cat.items.filter(item => item.stamped).length;
    const total = cat.items.length;
    cat.progress = `${completed}/${total}`;
  });
}

function renderCategories() {
  updateProgress();
  const list = document.getElementById('category-list');
  list.innerHTML = '';

  categories.forEach((cat, index) => {
    const div = document.createElement('div');
    div.className = 'category-item';

    // 進捗計算
    const completed = cat.items.filter(item => item.stamped).length;
    const total = cat.items.length;
    const percent = total === 0 ? 0 : (completed / total) * 100;

    // 進捗円グラフ（SVG）
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const hue = 80 + (210 - 80) * (percent / 100); // 黄緑→青
    const circleWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    circleWrapper.setAttribute('class', 'progress-circle');
    circleWrapper.setAttribute('viewBox', '0 0 40 40');

    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', '20');
    bgCircle.setAttribute('cy', '20');
    bgCircle.setAttribute('r', radius);
    bgCircle.setAttribute('stroke', '#eee');
    bgCircle.setAttribute('stroke-width', '4');
    bgCircle.setAttribute('fill', 'none');

    const fgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    fgCircle.setAttribute('cx', '20');
    fgCircle.setAttribute('cy', '20');
    fgCircle.setAttribute('r', radius);
    fgCircle.setAttribute('stroke', `hsl(${hue}, 80%, 50%)`);
    fgCircle.setAttribute('stroke-width', '4');
    fgCircle.setAttribute('fill', 'none');
    fgCircle.setAttribute('stroke-dasharray', circumference);
    fgCircle.setAttribute('stroke-dashoffset', circumference);
    fgCircle.style.transition = 'stroke-dashoffset 0.5s ease, stroke 0.5s ease';

    circleWrapper.appendChild(bgCircle);
    circleWrapper.appendChild(fgCircle);

    // アニメーションで進捗を反映
    requestAnimationFrame(() => {
      fgCircle.setAttribute('stroke-dashoffset', circumference * (1 - percent / 100));
    });


    const name = document.createElement('span');
    name.textContent = cat.name;
    name.className = 'category-name';

    const progress = document.createElement('span');
    progress.className = 'category-progress';
    progress.textContent = cat.progress;

    const menuBtn = document.createElement('button');
    menuBtn.textContent = '⋯'; // 横並び
    menuBtn.className = 'menu-btn';
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // バブリングを防ぐ
      showCategoryActionMenu(cat.id, index);
    });

    div.appendChild(circleWrapper); // 左側に円グラフ
    div.appendChild(name);
    div.appendChild(progress);
    div.appendChild(menuBtn);
    
    
    // メニュー以外をタップしたときのみ画面2に遷移
    div.addEventListener('pointerup', (e) => {
      if (e.target.classList.contains('menu-btn')) return;
      openCategory(cat.id);
    });

    list.appendChild(div);
  });
}

function renderItems() {
  const list = document.getElementById('item-list');
  list.innerHTML = '';
  const category = categories.find(c => c.id === currentCategoryId);
  if (!category) return;

  category.items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'item';

    const stamp = document.createElement('img');
    stamp.src = item.stamped ? 'icons/img02.svg' : 'icons/img01.svg';
    stamp.className = 'stamp-icon';
    stamp.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      item.stamped = !item.stamped;
      stamp.src = item.stamped ? 'icons/img02.svg' : 'icons/img01.svg';
      saveData();
      renderCategories();
      playSound(item.stamped ? 'sounds/001.mp3' : 'sounds/002.mp3');
    });

    const text = document.createElement('span');
    text.textContent = item.text;
    text.className = 'item-text';

    const menuBtn = document.createElement('button');
    menuBtn.textContent = '⋯'; // 横並び
    menuBtn.className = 'item-menu-btn';
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showItemActionMenu(index);
    });

    div.appendChild(stamp);
    div.appendChild(text);
    div.appendChild(menuBtn);
    list.appendChild(div);
  });
  saveData();
}

// ===== 科目関連操作 =====
function addCategory() {
  const name = prompt('科目名を入力してください');
  if (name) {
    const newCategory = { id: Date.now(), name, items: [], progress: '0/0' };
    categories.push(newCategory);
    saveData();
    renderCategories();
  }
}

function moveCategoryUp(index) {
  if (index > 0) {
    [categories[index - 1], categories[index]] = [categories[index], categories[index - 1]];
    saveData();
    renderCategories();
  }
}

function moveCategoryDown(index) {
  if (index < categories.length - 1) {
    [categories[index + 1], categories[index]] = [categories[index], categories[index + 1]];
    saveData();
    renderCategories();
  }
}

function deleteCategory(id) {
  if (confirm('この科目を削除してもよろしいですか？')) {
    categories = categories.filter(c => c.id !== id);
    saveData();
    renderCategories();
  }
}

function renameCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  const newName = prompt('新しい科目名を入力してください', cat.name);
  if (newName) {
    cat.name = newName;
    saveData();
    renderCategories();
  }
}

function openCategory(id) {
  currentCategoryId = id;
  const category = categories.find(c => c.id === id);
  if (!category) return;
  document.getElementById('subject-title').textContent = category.name;
  document.getElementById('screen1').classList.add('hidden');
  document.getElementById('screen2').classList.remove('hidden');
  renderItems();
}

function goBack() {
  document.getElementById('screen2').classList.add('hidden');
  document.getElementById('screen1').classList.remove('hidden');
  saveData();
  renderCategories();
}

// ===== 項目関連操作 =====
function addItem() {
  const text = prompt('項目名を入力してください');
  if (text) {
    const category = categories.find(c => c.id === currentCategoryId);
    if (!category) return;
    category.items.push({ text, stamped: false });
    saveData();
    renderItems();
    renderCategories();
  }
}

function moveItemUp(index) {
  const category = categories.find(c => c.id === currentCategoryId);
  if (category && index > 0) {
    [category.items[index - 1], category.items[index]] = [category.items[index], category.items[index - 1]];
    saveData();
    renderItems();
  }
}

function moveItemDown(index) {
  const category = categories.find(c => c.id === currentCategoryId);
  if (category && index < category.items.length - 1) {
    [category.items[index + 1], category.items[index]] = [category.items[index], category.items[index + 1]];
    saveData();
    renderItems();
  }
}

function deleteItem(index) {
  if (confirm('この項目を削除してもよろしいですか？')) {
    const category = categories.find(c => c.id === currentCategoryId);
    if (category) {
      category.items.splice(index, 1);
      saveData();
      renderItems();
      renderCategories();
    }
  }
}

function renameItem(index) {
  const category = categories.find(c => c.id === currentCategoryId);
  if (!category) return;
  const newName = prompt('新しい項目名を入力してください', category.items[index].text);
  if (newName) {
    category.items[index].text = newName;
    saveData();
    renderItems();
  }
}


// ===== メニュー表示 =====
function showCategoryActionMenu(id, index) {
  const menu = document.getElementById('category-action-menu');
  menu.classList.add('show'); // 下から表示
  disableBackgroundInteraction(true);

  document.getElementById('move-category-up-btn').onclick = () => {
    moveCategoryUp(index);
    closeMenus();
  };
  document.getElementById('move-category-down-btn').onclick = () => {
    moveCategoryDown(index);
    closeMenus();
  };
  document.getElementById('rename-category-btn').onclick = () => {
    renameCategory(id);
    closeMenus();
  };
  document.getElementById('delete-category-btn').onclick = () => {
    deleteCategory(id);
    closeMenus();
  };
  document.getElementById('cancel-category-btn').onclick = () => {
    closeMenus();
  };
}

function showItemActionMenu(index) {
  const menu = document.getElementById('item-action-menu');
  menu.classList.add('show'); // 下から表示
  disableBackgroundInteraction(true);

  document.getElementById('move-up-btn').onclick = () => {
    moveItemUp(index);
    closeMenus();
  };
  document.getElementById('move-down-btn').onclick = () => {
    moveItemDown(index);
    closeMenus();
  };
  document.getElementById('rename-item-btn').onclick = () => {
    renameItem(index);
    closeMenus();
  };
  document.getElementById('delete-item-btn').onclick = () => {
    deleteItem(index);
    closeMenus();
  };
  document.getElementById('cancel-item-btn').onclick = () => {
    closeMenus();
  };
}

// メニューを閉じる
function closeMenus() {
  document.querySelectorAll('.action-menu').forEach(menu => {
    menu.classList.remove('show');
  });
  disableBackgroundInteraction(false);
}

// メニュー外クリックで閉じる
document.addEventListener('pointerdown', (e) => {
  const menus = document.querySelectorAll('.action-menu');
  if (![...menus].some(menu => menu.contains(e.target))) {
    closeMenus();
  }
});


// メニューが開いている間の背景操作無効化
function disableBackgroundInteraction(disable) {
  const root = document.body;
  root.style.pointerEvents = disable ? 'none' : 'auto';
  const menus = document.querySelectorAll('.action-menu');
  menus.forEach(menu => menu.style.pointerEvents = 'auto');
}

// ===== 効果音 =====
function playSound(src) {
  const audio = new Audio(src);
  audio.play();
}

// ===== インポート／エクスポート =====
function exportData() {
  const blob = new Blob([JSON.stringify(categories)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      categories = JSON.parse(reader.result);
      saveData();
      renderCategories();
    };
    reader.readAsText(file);
  });
  input.click();
}

// ===== イベント登録 =====
document.getElementById('add-category-btn').addEventListener('click', addCategory);
document.getElementById('add-item-btn').addEventListener('click', addItem);
document.getElementById('back-btn').addEventListener('click', goBack);
document.getElementById('export-btn').addEventListener('click', exportData);
document.getElementById('import-btn').addEventListener('click', importData);

// メニュー外クリックで閉じる
document.addEventListener('pointerdown', (e) => {
  const menus = document.querySelectorAll('.action-menu');
  if (![...menus].some(menu => menu.contains(e.target))) {
    closeMenus(); // 新しい関数
  }
});


loadData();
renderCategories();
