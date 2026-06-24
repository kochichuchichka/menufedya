let currentCategory = "Микс";
let pool = [];
let currentDish = null;
let correctAnswersCount = 0;
let totalQuestionsCount = 0;
let currentMode = "photo";

document.addEventListener("DOMContentLoaded", () => {
    pool = [...originalDishes];
    totalQuestionsCount = pool.length;
    initQuiz();
});

function initQuiz() {
    correctAnswersCount = 0;
    updateScore();
    nextQuestion();
}

function changeMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`mode-${mode}`);
    if (activeBtn) activeBtn.classList.add("active");
    initQuiz();
}

function updateScore() {
    const counter = document.getElementById("score-counter");
    if (counter) counter.innerText = `Угадано: ${correctAnswersCount}/${totalQuestionsCount}`;
}

function nextQuestion() {
    if (pool.length === 0) {
        alert("Превосходно! Вы детально изучили этот режим. Начнем заново!");
        pool = [...originalDishes];
        initQuiz();
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    currentDish = pool[randomIndex];

    const imgBlock = document.getElementById("image-block");
    const imgElement = document.getElementById("dish-image");
    const questionTextEl = document.getElementById("question-text");

    imgBlock.style.display = "none";

    if (currentMode === "photo") {
        imgBlock.style.display = "flex";
        if (imgElement && currentDish.image) imgElement.src = `../${currentDish.image}`;
        questionTextEl.innerHTML = "Какое блюдо представлено на фотографии?";
        generateButtonsForDishNames();
    } else if (currentMode === "composition") {
        questionTextEl.innerHTML = `<div style="font-size: 13px; color: #8e8e93; margin-bottom: 8px; text-transform: uppercase; font-weight:600;">Какое блюдо имеет следующий состав?</div><div class="composition-text">${currentDish.composition}</div>`;
        generateButtonsForDishNames();
    } else if (currentMode === "details") {
        questionTextEl.innerHTML = `<div style="font-size: 13px; color: #8e8e93; margin-bottom: 8px; text-transform: uppercase; font-weight:600;">Детальный нюанс блюда:</div><div style="font-size: 20px; font-weight: 800; color: #007aff; margin: 10px 0;">${currentDish.name}</div><div style="font-size: 16px; color: #1c1c1e;">С каким соусом, топпингом или фишкой подается это положение меню?</div>`;
        generateButtonsForDetails();
    } else if (currentMode === "missing") {
        let ingredients = currentDish.composition.split(',').map(i => i.trim());
        if (ingredients.length > 2) {
            let missingIndex = Math.floor(Math.random() * ingredients.length);
            let missingItem = ingredients[missingIndex];
            ingredients[missingIndex] = "🚨 <b>[...ЧТО-ТО ПРОПУЩЕНО...]</b>";
            questionTextEl.innerHTML = `<div style="font-size: 13px; color: #8e8e93; margin-bottom: 12px; text-transform: uppercase; font-weight:600;">Изучаем рецептуру скрытого блюда:</div><div class="composition-text">${ingredients.join(', ')}</div><div style="font-size: 15px; font-weight: 700; margin-top: 15px; color: #ff3b30; text-align: center;">Какого ключевого ингредиента не хватает в описании?</div>`;
            generateButtonsForMissing(missingItem);
        } else {
            nextQuestion();
        }
    }
}

function generateButtonsForDishNames() {
    const answersBlock = document.getElementById("answers-block");
    answersBlock.innerHTML = "";
    let choices = [currentDish.name];
    let other = originalDishes.map(d => d.name).filter(n => n !== currentDish.name);
    other.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) { if (other[i]) choices.push(other[i]); }
    choices.sort(() => Math.random() - 0.5);
    choices.forEach(name => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.innerText = name;
        btn.onclick = () => handleAnswer(btn, name === currentDish.name);
        answersBlock.appendChild(btn);
    });
}

function generateButtonsForDetails() {
    const answersBlock = document.getElementById("answers-block");
    answersBlock.innerHTML = "";
    function getDishDetail(dish) {
        let comp = dish.composition.toLowerCase();
        if (comp.includes("солёная карамель с ромашкой")) return "Солёная карамель с ромашкой";
        if (comp.includes("зелёным айоли") || comp.includes("зеленый айоли")) return "Соус зелёный айоли";
        if (comp.includes("голландским соусом") || comp.includes("голландез")) return "Шелковистый голландский соус";
        if (comp.includes("муссом из пармезана")) return "Мусс из пармезана и грибная пудра";
        if (comp.includes("кокосовом молоке")) return "Кокосовое молоко, карамель и миндальные лепестки";
        if (comp.includes("облепихи и ягод северной морошки")) return "Соус из облепихи и ягод северной морошки";
        if (comp.includes("крошкой из пармезана")) return "Таежная брусника, пломбир и крошка пармезана";
        if (comp.includes("трюфельное масло")) return "Маринованные черные лисички и трюфельное масло";
        if (comp.includes("камчатского краба")) return "Мясо камчатского краба в сливочном масле";
        if (comp.includes("вяленой ветчины")) return "Слайсы вяленой ветчины и салат из редиса/фенхеля";
        if (comp.includes("рубленой оленины")) return "Рубленая оленина и маринованные лесные грибы";
        if (comp.includes("печень трески")) return "Печень трески и молодой картофель";
        if (comp.includes("соус из тушеных томатов")) return "Пряный соус из томатов, сладкого перца и чеснока";
        return "Стандартная ресторанная подача шефа";
    }
    let correctDetail = getDishDetail(currentDish);
    let choices = [correctDetail];
    let otherDishes = originalDishes.filter(d => d.name !== currentDish.name);
    let otherDetails = [...new Set(otherDishes.map(d => getDishDetail(d)))].filter(d => d !== correctDetail && d !== "Стандартная ресторанная подача шефа");
    otherDetails.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) { if (otherDetails[i]) choices.push(otherDetails[i]); }
    while(choices.length < 4) { choices.push("Сливочный соус на основе трав"); }
    choices.sort(() => Math.random() - 0.5);
    choices.forEach(detail => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.innerText = detail;
        btn.onclick = () => handleAnswer(btn, detail === correctDetail, correctDetail);
        answersBlock.appendChild(btn);
    });
}

function generateButtonsForMissing(correctItem) {
    const answersBlock = document.getElementById("answers-block");
    answersBlock.innerHTML = "";
    let choices = [correctItem];
    let allIngredients = [];
    originalDishes.forEach(d => { allIngredients.push(...d.composition.split(',').map(i => i.trim())); });
    let poolIng = [...new Set(allIngredients)].filter(i => i.toLowerCase() !== correctItem.toLowerCase() && i.length > 4);
    poolIng.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) { if (poolIng[i]) choices.push(poolIng[i]); }
    choices.sort(() => Math.random() - 0.5);
    choices.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.innerText = item;
        btn.onclick = () => handleAnswer(btn, item === correctItem, correctItem);
        answersBlock.appendChild(btn);
    });
}

function handleAnswer(selectedButton, isCorrect, correctText = null) {
    const buttons = document.querySelectorAll(".answer-btn");
    buttons.forEach(btn => btn.style.pointerEvents = "none");
    if (isCorrect) {
        selectedButton.classList.add("correct");
        correctAnswersCount++;
        updateScore();
        pool = pool.filter(dish => dish.name !== currentDish.name);
    } else {
        selectedButton.classList.add("wrong");
        buttons.forEach(btn => {
            if (correctText) { if (btn.innerText === correctText) btn.classList.add("correct"); }
            else { if (btn.innerText === currentDish.name) btn.classList.add("correct"); }
        });
    }
    setTimeout(() => { nextQuestion(); }, 1800);
}
