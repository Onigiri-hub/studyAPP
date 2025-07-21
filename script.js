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

// ホーム画面のカテゴリボタンを表示
//function renderCategories() {
//  const container = document.getElementById("category-list");
//  container.innerHTML = "";
//  categories.forEach(cat => {
//    const btn = document.createElement("button");
//    btn.classList.add("category-btn");
//    btn.textContent = cat;
//    btn.dataset.category = cat;
//    btn.addEventListener("click", () => {
//      openCategory(cat);
//    });
//    container.appendChild(btn);
//  });
//}

function renderCategories() {
  const container = document.getElementById("category-list");
  container.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.classList.add("category-btn");
    btn.textContent = cat;
    btn.dataset.category = cat;

    // 通常のクリックで開く
    btn.addEventListener("click", () => openCategory(cat));

    // 右クリックで削除
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      deleteCategory(cat);
    });

    // スマホ用の長押し検出
    let pressTimer;
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => deleteCategory(cat), 800); // 0.8秒長押し
    });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));

    container.appendChild(btn);
  });
}

function deleteCategory(cat) {
  if (confirm(`「${cat}」を削除しますか？（中の項目も削除されます）`)) {
    // カテゴリ削除
    categories = categories.filter(c => c !== cat);
    // 関連アイテムも削除
    items = items.filter(item => item.category !== cat);
    saveCategories();
    saveItems();
    renderCategories();
    renderItems();
  }
}



// リスト画面の描画
function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";
  items.forEach((item, index) => {
    if (item.category !== currentCategory) return;
    const li = document.createElement("li");

    const stamp = document.createElement("div");
    stamp.classList.add("stamp");
    if (item.stamped) stamp.classList.add("stamped");
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

    li.appendChild(stamp);
    li.appendChild(text);
    list.appendChild(li);
  });
}

function addItem(name) {
  items.push({ name: name || `新しい項目 ${items.length + 1}`, stamped: false, category: currentCategory });
  saveItems();
  renderItems();
}

// カテゴリ画面を開く
function openCategory(category) {
  currentCategory = category;
  document.getElementById("category-title").textContent = category;
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("list-screen").style.display = "block";
  history.pushState({ screen: "list" }, "", "");
  renderItems();
}

// 戻るボタンとブラウザバック対応
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

// エクスポート/インポート（前のまま）
document.getElementById("export-btn").addEventListener("click", () => {
  const jsonData = JSON.stringify({ items, categories });
  prompt("下のテキストをコピーしてください:", jsonData);
});

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

document.getElementById("add-btn").addEventListener("click", () => {
  const name = prompt("新しい項目の名前を入力してください");
  addItem(name);
});

// 初期表示
renderCategories();
renderItems();
