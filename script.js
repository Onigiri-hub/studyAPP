// ===============================
// データの初期化と保存
// ===============================
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let items = JSON.parse(localStorage.getItem("items")) || {};
let currentCategory = null;

// 古い形式のデータを新しい形式に変換
if (categories.length > 0 && typeof categories[0] === "string") {
  categories = categories.map(name => {
    const id = Date.now().toString() + Math.random().toString(16).slice(2);
    items[id] = items[name] || [];
    delete items[name];
    return { id, name };
  });
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("items", JSON.stringify(items));
}


// データを保存
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("items", JSON.stringify(items));
}

// ===============================
// 画面1：科目リスト表示
// ===============================
function renderCategories() {
  const list = document.getElementById("category-list");
  list.innerHTML = "";

  categories.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.className = "category-btn";

    const total = items[cat.id]?.length || 0;
    const stamped = items[cat.id]?.filter(i => i.stamped).length || 0;

    btn.textContent = `${cat.name} (${stamped}/${total})`;

    // 科目クリックで画面2に移動
    btn.addEventListener("click", () => {
      currentCategory = cat.id;
      document.getElementById("category-title").textContent = cat.name;
      document.getElementById("screen1").classList.add("hidden");
      document.getElementById("screen2").classList.remove("hidden");
      renderItems();
    });

    // 長押し or 右クリックで削除/名前変更メニュー
    let pressTimer;
    btn.addEventListener("contextmenu", e => {
      e.preventDefault();
      showActionMenu(index);
    });
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        showActionMenu(index);
      }, 600);
    });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));

    list.appendChild(btn);
  });
}

// ===============================
// 科目追加
// ===============================
document.getElementById("add-category").addEventListener("click", () => {
  const name = prompt("新しい科目名を入力してください");
  if (!name) return;
  const id = Date.now().toString(); // ユニークID
  categories.push({ id, name });
  items[id] = [];
  saveData();
  renderCategories();
});

// ===============================
// 科目削除・名前変更メニュー
// ===============================
function showActionMenu(index) {
  const menu = document.getElementById("action-menu");
  menu.classList.remove("hidden");

  const renameBtn = document.getElementById("rename-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const cancelBtn = document.getElementById("cancel-btn");

  // 名前変更
  renameBtn.onclick = () => {
    const newName = prompt("新しい名前を入力してください", categories[index].name);
    if (newName) {
      categories[index].name = newName;
      saveData();
      renderCategories();
    }
    menu.classList.add("hidden");
  };

  // 削除
  deleteBtn.onclick = () => {
    const targetId = categories[index].id;
    if (confirm("本当に削除しますか？")) {
      categories.splice(index, 1);
      delete items[targetId];
      saveData();
      renderCategories();
    }
    menu.classList.add("hidden");
  };

  cancelBtn.onclick = () => {
    menu.classList.add("hidden");
  };
}

// ===============================
// 画面2：項目リスト表示
// ===============================
function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  if (!items[currentCategory]) items[currentCategory] = [];

  items[currentCategory].forEach((item, index) => {
    const li = document.createElement("li");

    // スタンプ部分
    const stamp = document.createElement("div");
    stamp.className = "stamp" + (item.stamped ? " stamped" : "");

    // スマホ対応：クリックとタップ両方で反応
    const toggle = () => {
      items[currentCategory][index].stamped = !items[currentCategory][index].stamped;
      saveData();
      renderItems();
      renderCategories();
    };
    stamp.addEventListener("click", toggle);
    stamp.addEventListener("touchend", toggle);

    // スタンプ光るアニメーション
    stamp.addEventListener("click", () => {
      stamp.classList.add("glow-anim");
      setTimeout(() => stamp.classList.remove("glow-anim"), 500);
    });
    stamp.addEventListener("touchend", () => {
      stamp.classList.add("glow-anim");
      setTimeout(() => stamp.classList.remove("glow-anim"), 500);
    });

    // 項目名
    const span = document.createElement("span");
    span.textContent = item.name;

    // 右クリック・長押しで削除
    let pressTimer;
    li.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (confirm(`${item.name} を削除しますか？`)) {
        items[currentCategory].splice(index, 1);
        saveData();
        renderItems();
        renderCategories();
      }
    });
    li.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        if (confirm(`${item.name} を削除しますか？`)) {
          items[currentCategory].splice(index, 1);
          saveData();
          renderItems();
          renderCategories();
        }
      }, 600);
    });
    li.addEventListener("touchend", () => clearTimeout(pressTimer));

    li.appendChild(stamp);
    li.appendChild(span);
    list.appendChild(li);
  });
}

// ===============================
// 項目追加
// ===============================
document.getElementById("add-item").addEventListener("click", () => {
  const name = prompt("新しい項目名を入力してください");
  if (!name) return;
  if (!items[currentCategory]) items[currentCategory] = [];
  items[currentCategory].push({ name, stamped: false });
  saveData();
  renderItems();
  renderCategories();
});

// ===============================
// 戻るボタン
// ===============================
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("screen2").classList.add("hidden");
  document.getElementById("screen1").classList.remove("hidden");
  currentCategory = null;
});

// 初期描画
renderCategories();
