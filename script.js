// script.js (v11) - DOMContentLoaded 内で安全に初期化

let categories = JSON.parse(localStorage.getItem("categories")) || [];
let currentCategoryIndex = null;
let menuOpen = false;

// データ保存
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

// プログレス更新
function updateProgress() {
  categories.forEach(cat => {
    if (!Array.isArray(cat.items)) {
      cat.items = []; // 古いデータ対策
    }
    const done = cat.items.filter(i => i.stamped).length;
    cat.progress = `${done}/${cat.items.length}`;
  });
}

// 画面1描画
function renderCategories() {
  updateProgress();
  const container = document.getElementById("category-list");
  container.innerHTML = "";
  categories.forEach((cat, index) => {
    const btn = document.createElement("div");
    btn.className = "category-item";
    btn.innerHTML = `
      <span class="category-name">${cat.name}</span>
      <span class="category-progress">${cat.progress || "0/0"}</span>
      <button class="menu-btn" data-index="${index}">⋮</button>
    `;
    btn.querySelector(".category-name").addEventListener("pointerup", () => {
      if (!menuOpen) openCategory(index);
    });
    btn.querySelector(".menu-btn").addEventListener("pointerup", (e) => {
      e.stopPropagation();
      showCategoryActionMenu(index, e.target);
    });
    container.appendChild(btn);
  });
}

// 画面2表示
function openCategory(index) {
  currentCategoryIndex = index;
  const cat = categories[index];
  document.getElementById("subject-title").textContent = cat.name;
  renderItems();
  document.getElementById("screen1").classList.add("hidden");
  document.getElementById("screen2").classList.remove("hidden");
  history.pushState({ screen: 2 }, "", "");
}

// 画面2のリスト描画
function renderItems() {
  const container = document.getElementById("item-list");
  container.innerHTML = "";
  const cat = categories[currentCategoryIndex];
  cat.items.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img class="stamp-icon" src="${item.stamped ? 'icons/img02.svg' : 'icons/img01.svg'}" alt="stamp">
      <span class="item-text">${item.text}</span>
      <button class="item-menu-btn" data-idx="${idx}">⋮</button>
    `;
    div.querySelector(".stamp-icon").addEventListener("pointerup", () => {
      item.stamped = !item.stamped;
      div.querySelector(".stamp-icon").src = item.stamped ? 'icons/img02.svg' : 'icons/img01.svg';
      playSound(item.stamped ? "001.mp3" : "002.mp3");
      saveData();
      updateProgress();
      renderCategories();
    });
    div.querySelector(".item-menu-btn").addEventListener("pointerup", (e) => {
      e.stopPropagation();
      showItemActionMenu(idx, e.target);
    });
    container.appendChild(div);
  });
}

// メニュー関連
function showCategoryActionMenu(index, target) {
  const menu = document.getElementById("category-action-menu");
  menu.style.display = "block";
  menu.style.top = `${target.getBoundingClientRect().bottom + window.scrollY}px`;
  menu.style.left = `${target.getBoundingClientRect().left}px`;
  menuOpen = true;

  menu.querySelector("#rename-category-btn").onclick = () => {
    const newName = prompt("新しい科目名を入力してください", categories[index].name);
    if (newName) {
      categories[index].name = newName;
      saveData();
      renderCategories();
    }
    closeMenus();
  };
  menu.querySelector("#delete-category-btn").onclick = () => {
    if (confirm("削除してもよろしいですか？")) {
      categories.splice(index, 1);
      saveData();
      renderCategories();
    }
    closeMenus();
  };
  menu.querySelector("#cancel-category-btn").onclick = closeMenus;
}

function showItemActionMenu(idx, target) {
  const menu = document.getElementById("item-action-menu");
  menu.style.display = "block";
  menu.style.top = `${target.getBoundingClientRect().bottom + window.scrollY}px`;
  menu.style.left = `${target.getBoundingClientRect().left}px`;
  menuOpen = true;

  const cat = categories[currentCategoryIndex];
  menu.querySelector("#move-up-btn").onclick = () => {
    if (idx > 0) {
      [cat.items[idx - 1], cat.items[idx]] = [cat.items[idx], cat.items[idx - 1]];
      saveData();
      renderItems();
    }
    closeMenus();
  };
  menu.querySelector("#move-down-btn").onclick = () => {
    if (idx < cat.items.length - 1) {
      [cat.items[idx + 1], cat.items[idx]] = [cat.items[idx], cat.items[idx + 1]];
      saveData();
      renderItems();
    }
    closeMenus();
  };
  menu.querySelector("#delete-item-btn").onclick = () => {
    if (confirm("削除してもよろしいですか？")) {
      cat.items.splice(idx, 1);
      saveData();
      renderItems();
      updateProgress();
      renderCategories();
    }
    closeMenus();
  };
  menu.querySelector("#cancel-item-btn").onclick = closeMenus;
}

function closeMenus() {
  document.querySelectorAll(".action-menu").forEach(m => m.style.display = "none");
  menuOpen = false;
}

document.addEventListener("pointerup", (e) => {
  if (menuOpen && !e.target.closest(".action-menu") && !e.target.closest(".menu-btn") && !e.target.closest(".item-menu-btn")) {
    closeMenus();
  }
});

// サウンド再生
function playSound(file) {
  const audio = new Audio(`sounds/${file}`);
  audio.play();
}

// DOM読み込み後の初期化
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();

  // 戻るボタン
  document.getElementById("back-btn").addEventListener("pointerup", () => {
    document.getElementById("screen2").classList.add("hidden");
    document.getElementById("screen1").classList.remove("hidden");
    currentCategoryIndex = null;
    renderCategories();
    history.back();
  });

  // 科目追加
  document.getElementById("add-category-btn").addEventListener("pointerup", () => {
    const name = prompt("新しい科目名を入力してください");
    if (name) {
      categories.push({ name, items: [], progress: "0/0" });
      saveData();
      renderCategories();
    }
  });

  // 項目追加
  document.getElementById("add-item-btn").addEventListener("pointerup", () => {
    const text = prompt("新しい項目名を入力してください");
    if (text) {
      categories[currentCategoryIndex].items.push({ text, stamped: false });
      saveData();
      renderItems();
      updateProgress();
      renderCategories();
    }
  });

  // エクスポート
  document.getElementById("export-btn").addEventListener("pointerup", () => {
    const blob = new Blob([JSON.stringify(categories)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
  });

  // インポート
  document.getElementById("import-btn").addEventListener("pointerup", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (Array.isArray(data)) {
            categories = data;
            saveData();
            renderCategories();
          } else {
            alert("無効なデータです");
          }
        } catch {
          alert("読み込みに失敗しました");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
});
