// --- データの保存と読み込み ---
let categories = JSON.parse(localStorage.getItem("categories") || "[]");
let items = JSON.parse(localStorage.getItem("items") || "[]");
let currentCategory = null;

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}
function saveItems() {
  localStorage.setItem("items", JSON.stringify(items));
}

// --- 科目一覧の描画（画面1） ---
function renderCategories() {
  const container = document.getElementById("category-list");
  container.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.classList.add("category-btn");

    // 進捗計算
    const total = items.filter(i => i.category === cat).length;
    const done = items.filter(i => i.category === cat && i.stamped).length;
    const progress = total > 0 ? `${done}/${total}` : "0/0";

    btn.textContent = `${cat} (${progress})`;
    btn.dataset.category = cat;

    // 通常クリックでカテゴリを開く
    btn.addEventListener("click", () => openCategory(cat));

    // 右クリックでモーダル表示
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openActionMenu(cat);
    });

    // スマホ長押しでモーダル表示
    let pressTimer;
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        openActionMenu(cat);
      }, 800);
    });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));

    container.appendChild(btn);
  });
}

// --- 項目リストの描画（画面2） ---
function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  items.forEach((item, index) => {
    if (item.category !== currentCategory) return;

    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.index = index;

    const stamp = document.createElement("div");
    stamp.classList.add("stamp");
    if (item.stamped) stamp.classList.add("stamped");

    // スタンプのON/OFF
    stamp.addEventListener("click", (e) => {
      e.stopPropagation();
      items[index].stamped = !items[index].stamped;
      saveItems();
      stamp.classList.add("glow-anim");
      setTimeout(() => stamp.classList.remove("glow-anim"), 500);
      renderItems();
    });

    const text = document.createElement("span");
    text.textContent = item.name;

    // 項目削除（右クリック・長押し）
    const triggerDelete = () => {
      if (confirm(`「${items[index].name}」を削除しますか？`)) {
        items.splice(index, 1);
        saveItems();
        renderItems();
      }
    };

    li.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      triggerDelete();
    });

    let pressTimer;
    li.addEventListener("touchstart", (e) => {
      e.preventDefault();
      pressTimer = setTimeout(triggerDelete, 800);
    });
    li.addEventListener("touchend", () => clearTimeout(pressTimer));

    // 並べ替え用ドラッグ＆ドロップ
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if (dragging && dragging !== li) {
        const list = document.getElementById("item-list");
        const children = Array.from(list.children);
        const currentIndex = children.indexOf(li);
        const draggingIndex = children.indexOf(dragging);
        if (currentIndex > draggingIndex) {
          list.insertBefore(dragging, li.nextSibling);
        } else {
          list.insertBefore(dragging, li);
        }
      }
    });
    li.addEventListener("drop", () => {
      const list = document.getElementById("item-list");
      const newOrder = Array.from(list.children).map(child => {
        const idx = parseInt(child.dataset.index, 10);
        return items[idx];
      });
      items = newOrder;
      saveItems();
      renderItems();
    });

    li.appendChild(stamp);
    li.appendChild(text);
    list.appendChild(li);
  });
}

// --- 画面遷移 ---
function openCategory(cat) {
  currentCategory = cat;
  document.getElementById("screen1").classList.add("hidden");
  document.getElementById("screen2").classList.remove("hidden");
  renderItems();
}
function goBack() {
  currentCategory = null;
  document.getElementById("screen2").classList.add("hidden");
  document.getElementById("screen1").classList.remove("hidden");
  renderCategories();
}
window.addEventListener("popstate", () => {
  if (currentCategory) {
    goBack();
  }
});

// --- 科目追加 ---
document.getElementById("add-category").addEventListener("click", () => {
  const name = prompt("新しい科目名を入力してください:");
  if (name) {
    categories.push(name);
    saveCategories();
    renderCategories();
  }
});

// --- 項目追加 ---
document.getElementById("add-item").addEventListener("click", () => {
  const name = prompt("新しい項目名を入力してください:");
  if (name) {
    items.push({ name, category: currentCategory, stamped: false });
    saveItems();
    renderItems();
  }
});

// --- モーダル（削除・名前変更） ---
let currentCategoryForAction = null;

function openActionMenu(cat) {
  currentCategoryForAction = cat;
  document.getElementById("action-menu").classList.remove("hidden");
}
function closeActionMenu() {
  document.getElementById("action-menu").classList.add("hidden");
}

// メニューのボタン処理
document.getElementById("rename-btn").addEventListener("click", () => {
  const cat = currentCategoryForAction;
  const newName = prompt(`「${cat}」の新しい名前を入力してください:`, cat);
  if (newName && newName !== cat) {
    categories = categories.map(c => (c === cat ? newName : c));
    items = items.map(i => (i.category === cat ? { ...i, category: newName } : i));
    saveCategories();
    saveItems();
    renderCategories();
  }
  closeActionMenu();
});

document.getElementById("delete-btn").addEventListener("click", () => {
  const cat = currentCategoryForAction;
  if (confirm(`「${cat}」を削除しますか？`)) {
    categories = categories.filter(c => c !== cat);
    items = items.filter(i => i.category !== cat);
    saveCategories();
    saveItems();
    renderCategories();
  }
  closeActionMenu();
});

document.getElementById("cancel-btn").addEventListener("click", closeActionMenu);
document.getElementById("action-menu").addEventListener("click", (e) => {
  if (e.target.id === "action-menu") closeActionMenu();
});

// --- 初期化 ---
renderCategories();
