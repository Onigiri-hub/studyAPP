let categories = JSON.parse(localStorage.getItem("categories")) || [];
let items = JSON.parse(localStorage.getItem("items")) || {};
let currentCategory = null;

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

    // 長押し・右クリックでメニュー
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

// 科目メニュー
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

// 項目リスト表示
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

// 項目メニュー
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

// 科目・項目追加イベントは初期化時に一度だけ登録
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

// 戻るボタン
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("screen2").classList.add("hidden");
  document.getElementById("screen1").classList.remove("hidden");
  currentCategory = null;
});

// 初期描画
renderCategories();
