let categories = JSON.parse(localStorage.getItem("categories")) || [];
let items = JSON.parse(localStorage.getItem("items")) || {};
let currentCategory = null;

// データ保存
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("items", JSON.stringify(items));
}

// 科目リスト表示
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

    // 長押し・右クリックメニュー（削除/名前変更）
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

// 科目追加
document.getElementById("add-category").addEventListener("click", () => {
  const name = prompt("新しい科目名を入力してください");
  if (!name) return;
  const id = Date.now().toString();
  categories.push({ id, name });
  items[id] = [];
  saveData();
  renderCategories();
});

// 科目メニュー
function showActionMenu(index) {
  const menu = document.getElementById("action-menu");
  menu.classList.remove("hidden");

  const renameBtn = document.getElementById("rename-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const cancelBtn = document.getElementById("cancel-btn");

  renameBtn.onclick = () => {
    const newName = prompt("新しい名前を入力してください", categories[index].name);
    if (newName) {
      categories[index].name = newName;
      saveData();
      renderCategories();
    }
    menu.classList.add("hidden");
  };

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

// 項目リスト表示（スタンプ画像化＋タップ安定）
function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  if (!items[currentCategory]) items[currentCategory] = [];

  items[currentCategory].forEach((item, index) => {
    const li = document.createElement("li");

    // スタンプ画像
    const stamp = document.createElement("img");
    stamp.src = item.stamped ? "icons/img02.svg" : "icons/img01.svg";
    stamp.className = "stamp-img";

    // タップ/クリックの安定処理
    const toggle = (e) => {
      e.preventDefault();
      item.stamped = !item.stamped;
      stamp.src = item.stamped ? "icons/img02.svg" : "icons/img01.svg";
      saveData();
      renderCategories();
    };

    if ("ontouchend" in window) {
      stamp.addEventListener("touchend", toggle, { passive: false });
    } else {
      stamp.addEventListener("click", toggle);
    }

    // 項目名
    const span = document.createElement("span");
    span.textContent = item.name;

    // 項目削除（右クリック・長押し）
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

// 項目追加
document.getElementById("add-item").addEventListener("click", () => {
  const name = prompt("新しい項目名を入力してください");
  if (!name) return;
  if (!items[currentCategory]) items[currentCategory] = [];
  items[currentCategory].push({ name, stamped: false });
  saveData();
  renderItems();
  renderCategories();
});

// 戻るボタン
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("screen2").classList.add("hidden");
  document.getElementById("screen1").classList.remove("hidden");
  currentCategory = null;
});

// 初期描画
renderCategories();
