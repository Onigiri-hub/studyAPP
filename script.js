let categories = JSON.parse(localStorage.getItem("categories")) || [];
let items = JSON.parse(localStorage.getItem("items")) || {};
let currentCategory = null;

function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("items", JSON.stringify(items));
}

// --- エクスポート機能 ---
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

// --- インポート機能 ---
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
        items = data.items;
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

// --- 以下は前回と同じ機能 ---

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

document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("screen2").classList.add("hidden");
  document.getElementById("screen1").classList.remove("hidden");
  currentCategory = null;
});

renderCategories();
