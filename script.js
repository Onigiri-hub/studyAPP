let categories = JSON.parse(localStorage.getItem("categories")) || [];
let items = JSON.parse(localStorage.getItem("items")) || {};
let currentCategory = null;

function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("items", JSON.stringify(items));
}

// --- データのエクスポート ---
document.getElementById("export-btn").addEventListener("click", () => {
  const data = { categories, items };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "stampcard-data.json";
  a.click();
  URL.revokeObjectURL(url);
});

// --- データのインポート（修正版） ---
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.categories && data.items) {
        categories = data.categories;

        // itemsを安全に復元（空や不正データ対策）
        items = {};
        for (const [key, arr] of Object.entries(data.items)) {
          if (Array.isArray(arr)) {
            items[key] = arr.map(i => ({
              name: i.name || "",
              stamped: !!i.stamped
            }));
          } else {
            items[key] = [];
          }
        }

        saveData();
        renderCategories();
        alert("データをインポートしました！");
      } else {
        alert("不正なデータです");
      }
    } catch {
      alert("JSONの読み込みに失敗しました");
    }
  };
  reader.readAsText(file);
});

// --- 科目リストを描画 ---
function renderCategories() {
  const list = document.getElementById("category-list");
  list.innerHTML = "";

  categories.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.className = "category-btn";

    const total = items[cat.id]?.length || 0;
    const stamped = items[cat.id]?.filter(i => i.stamped).length || 0;

    btn.textContent = `${cat.name} (${stamped}/${total})`;

    btn.addEventListener("click", () => {
      currentCategory = cat.id;
      document.getElementById("category-title").textContent = cat.name;
      document.getElementById("screen1").classList.add("hidden");
      document.getElementById("screen2").classList.remove("hidden");
      renderItems();
    });

    // 長押し/右クリックでメニュー表示
    let pressTimer;
    btn.addEventListener("contextmenu", e => {
      e.preventDefault();
      showCategoryMenu(index);
    });
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        showCategoryMenu(index);
      }, 600);
    });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));

    list.appendChild(btn);
  });
}

// --- 科目メニュー ---
function showCategoryMenu(index) {
  const menu = document.getElementById("action-menu");
  menu.classList.remove("hidden");

  document.getElementById("rename-btn").onclick = () => {
    const newName = prompt("新しい名前を入力してください", categories[index].name);
    if (newName) {
      categories[index].name = newName;
      saveData();
      renderCategories();
    }
    menu.classList.add("hidden");
  };

  document.getElementById("delete-btn").onclick = () => {
    const targetId = categories[index].id;
    if (confirm("本当に削除しますか？")) {
      categories.splice(index, 1);
      delete items[targetId];
      saveData();
      renderCategories();
    }
    menu.classList.add("hidden");
  };

  document.getElementById("cancel-btn").onclick = () => {
    menu.classList.add("hidden");
  };
}

// --- 項目リストを描画 ---
function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  if (!items[currentCategory]) items[currentCategory] = [];

  items[currentCategory].forEach((item, index) => {
    const li = document.createElement("li");

    const stamp = document.createElement("img");
    stamp.src = item.stamped ? "icons/img02.svg" : "icons/img01.svg";
    stamp.className = "stamp-img";

    const toggle = (e) => {
      e.preventDefault();
      item.stamped = !item.stamped;
      stamp.src = item.stamped ? "icons/img02.svg" : "icons/img01.svg";

      // --- スタンプのON/OFFで音を再生 ---
      const soundFile = item.stamped ? "sounds/001.mp3" : "sounds/002.mp3";
      const sound = new Audio(soundFile);
      sound.currentTime = 0;
      sound.play();

      saveData();
      renderCategories();
    };

    if ("ontouchend" in window) {
      stamp.addEventListener("touchend", toggle, { passive: false });
    } else {
      stamp.addEventListener("click", toggle);
    }

    const span = document.createElement("span");
    span.textContent = item.name;

    const menuBtn = document.createElement("button");
    menuBtn.textContent = "⋯";
    menuBtn.className = "menu-btn";
    menuBtn.addEventListener("click", () => {
      showItemMenu(index);
    });

    li.appendChild(stamp);
    li.appendChild(span);
    li.appendChild(menuBtn);
    list.appendChild(li);
  });
}

// --- 項目メニュー ---
function showItemMenu(index) {
  const menu = document.getElementById("item-action-menu");
  menu.classList.remove("hidden");

  const arr = items[currentCategory];

  document.getElementById("move-up-btn").onclick = () => {
    if (index > 0) {
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      saveData();
      renderItems();
    }
    menu.classList.add("hidden");
  };

  document.getElementById("move-down-btn").onclick = () => {
    if (index < arr.length - 1) {
      [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      saveData();
      renderItems();
    }
    menu.classList.add("hidden");
  };

  document.getElementById("delete-item-btn").onclick = () => {
    if (confirm("削除しますか？")) {
      arr.splice(index, 1);
      saveData();
      renderItems();
      renderCategories();
    }
    menu.classList.add("hidden");
  };

  document.getElementById("cancel-item-btn").onclick = () => {
    menu.classList.add("hidden");
  };
}

// --- 科目・項目追加 ---
document.getElementById("add-category").addEventListener("click", () => {
  const name = prompt("新しい科目名を入力してください");
  if (!name) return;
  const id = Date.now().toString();
  categories.push({ id, name });
  items[id] = [];
  saveData();
  renderCategories();
});

document.getElementById("add-item").addEventListener("click", () => {
  const name = prompt("新しい項目名を入力してください");
  if (!name) return;
  if (!items[currentCategory]) items[currentCategory] = [];
  items[currentCategory].push({ name, stamped: false });
  saveData();
  renderItems();
  renderCategories();
});

// --- 戻るボタン ---
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("screen2").classList.add("hidden");
  document.getElementById("screen1").classList.remove("hidden");
  currentCategory = null;
});

// 初期描画
renderCategories();
