let items = JSON.parse(localStorage.getItem("items")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["数学1", "英文法"];
let currentCategory = "";

// データ保存
function saveItems() {
  localStorage.setItem("items", JSON.stringify(items));
}
function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

// ホーム画面のカテゴリボタン描画
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

    // カテゴリを開く
    btn.addEventListener("click", () => openCategory(cat));

    // 右クリック削除
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      deleteCategory(cat);
    });

    // スマホ長押し削除
    let pressTimer;
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => deleteCategory(cat), 800);
    });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));

    container.appendChild(btn);
  });
}


// 項目リスト描画
function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  items.forEach((item, index) => {
    if (item.category !== currentCategory) return;

    const li = document.createElement("li");

    const stamp = document.createElement("div");
    stamp.classList.add("stamp");
    if (item.stamped) stamp.classList.add("stamped");

    // スタンプON/OFF（クリックのみ）
    stamp.addEventListener("click", (e) => {
      e.stopPropagation(); // 削除処理とは独立
      items[index].stamped = !items[index].stamped;
      saveItems();
      stamp.classList.add("glow-anim");
      setTimeout(() => stamp.classList.remove("glow-anim"), 500);
      renderItems();
    });

    const text = document.createElement("span");
    text.textContent = item.name;

    // 削除処理
    const triggerDelete = () => {
      if (confirm(`「${items[index].name}」を削除しますか？`)) {
        items.splice(index, 1);
        saveItems();
        renderItems();
      }
    };

    // PC: 右クリック削除
    li.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      triggerDelete();
    });

    // スマホ: 長押し削除
    let pressTimer;
    li.addEventListener("touchstart", (e) => {
      e.preventDefault();  // デフォルトの選択・メニューを抑制
      pressTimer = setTimeout(triggerDelete, 700); // 少し短くする
    });
    li.addEventListener("touchend", () => clearTimeout(pressTimer));


    li.appendChild(stamp);
    li.appendChild(text);
    list.appendChild(li);
  });
}


// 項目追加
function addItem(name) {
  items.push({
    name: name || `新しい項目 ${items.length + 1}`,
    stamped: false,
    category: currentCategory
  });
  saveItems();
  renderItems();
}

// カテゴリを開く
function openCategory(category) {
  currentCategory = category;
  document.getElementById("category-title").textContent = category;
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("list-screen").style.display = "block";
  history.pushState({ screen: "list" }, "", "");
  renderItems();
}

// 戻る処理
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("home-screen").style.display = "block";
  document.getElementById("list-screen").style.display = "none";
  history.back();
});
window.addEventListener("popstate", () => {
  document.getElementById("home-screen").style.display = "block";
  document.getElementById("list-screen").style.display = "none";
});

// カテゴリ追加
document.getElementById("add-category-btn").addEventListener("click", () => {
  const name = prompt("新しい科目名を入力してください");
  if (name && !categories.includes(name)) {
    categories.push(name);
    saveCategories();
    renderCategories();
  }
});

// 項目削除
function deleteItem(index) {
  if (confirm(`「${items[index].name}」を削除しますか？`)) {
    items.splice(index, 1);
    saveItems();
    renderItems();
  }
}

// カテゴリ削除
function deleteCategory(cat) {
  if (confirm(`「${cat}」を削除しますか？（中の項目も削除されます）`)) {
    categories = categories.filter(c => c !== cat);
    items = items.filter(item => item.category !== cat);
    saveCategories();
    saveItems();
    renderCategories();
    renderItems();
  }
}

// エクスポート
document.getElementById("export-btn").addEventListener("click", () => {
  const jsonData = JSON.stringify({ items, categories });
  prompt("下のテキストをコピーしてください:", jsonData);
});

// インポート
document.getElementById("import-btn").addEventListener("click", () => {
  const inputData = prompt("コピーしたデータを貼り付けてください:");
  if (inputData) {
    try {
      const data = JSON.parse(inputData);
      items = data.items || [];
      categories = data.categories || [];
      saveItems();
      saveCategories();
      renderCategories();
      renderItems();
      alert("データをインポートしました！");
    } catch (e) {
      alert("データの形式が不正です。");
    }
  }
});

// 項目追加ボタン
document.getElementById("add-btn").addEventListener("click", () => {
  const name = prompt("新しい項目の名前を入力してください");
  addItem(name);
});

// 初期描画
renderCategories();
renderItems();
