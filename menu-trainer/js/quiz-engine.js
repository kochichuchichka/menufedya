let currentCategory = "";
let pool = [];         
let currentDish = null;
let correctAnswersCount = 0;
let totalQuestionsCount = 0;
let currentMode = "photo"; 

document.addEventListener("DOMContentLoaded", () => {
    const categoryElement = document.getElementById("current-category");
    if (!categoryElement) return;

    // Берем текст напрямую, без сложных условий
    currentCategory = categoryElement.innerText.replace("Раздел: ", "").trim();
    
    console.log("Категория определена как:", currentCategory);
    initQuiz();
});
function initQuiz() {
    console.log("Текущая категория:", currentCategory); // Добавь эту строку
    pool = originalDishes.filter(dish => {
        // ... твой код с .includes() ...
    });
    // ... остальной код
}

function initQuiz() {
    // 1. Берем весь текст
    let rawText = document.getElementById("current-category").innerText;
    
    // 2. Убираем "Раздел: " (если оно есть), чтобы остался только чистый текст категории
    const currentCategory = rawText.replace("Раздел: ", "").trim();

    console.log("Ищем категорию:", currentCategory);

    // 3. Фильтруем
    pool = originalDishes.filter(dish => {
        if (!dish.category) return false;
        const catArray = Array.isArray(dish.category) ? dish.category : [dish.category];
        return catArray.includes(currentCategory);
    });

    if (pool.length === 0) {
        document.getElementById("question-text").innerText = "Блюда не найдены.";
        return;
    }
    
    totalQuestionsCount = pool.length;
    correctAnswersCount = 0;
    updateScore();
    nextQuestion();
}

function changeMode(mode) {
    currentMode = mode;
    
    // Сбрасываем активный класс со всех кнопок
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    // Подсвечиваем нужную кнопку
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
        alert("Превосходно! Вы детально изучили этот режим. Начнем заново для закрепления!");
        initQuiz();
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    currentDish = pool[randomIndex];

    const imgBlock = document.getElementById("image-block");
    const imgElement = document.getElementById("dish-image");
    const questionTextEl = document.getElementById("question-text");

    // Сброс видимости по умолчанию
    imgBlock.style.display = "none";

    // 1. РЕЖИМ ПО ФОТО
    if (currentMode === "photo") {
        imgBlock.style.display = "flex";
        if (imgElement && currentDish.image) imgElement.src = `../${currentDish.image}`;
        questionTextEl.innerHTML = "Какое блюдо представлено на фотографии?";
        generateButtonsForDishNames();
    } 
    // 2. РЕЖИМ ПО ПОЛНОМУ СОСТАВУ
    else if (currentMode === "composition") {
        questionTextEl.innerHTML = `
            <div style="font-size: 13px; color: #8e8e93; margin-bottom: 8px; text-transform: uppercase; font-weight:600;">Какое блюдо имеет следующий состав?</div>
            <div class="composition-text">${currentDish.composition}</div>
        `;
        generateButtonsForDishNames();
    }
    // 3. РЕЖИМ: ФИШКИ И СОУСЫ
    else if (currentMode === "details") {
        questionTextEl.innerHTML = `
            <div style="font-size: 13px; color: #8e8e93; margin-bottom: 8px; text-transform: uppercase; font-weight:600;">Детальный нюанс блюда:</div>
            <div style="font-size: 20px; font-weight: 800; color: #007aff; margin: 10px 0;">${currentDish.name}</div>
            <div style="font-size: 16px; color: #1c1c1e;">С каким соусом, топпингом или фишкой подается это положение меню?</div>
        `;
        generateButtonsForDetails();
    }
// 4. РЕЖИМ: ЧЕГО НЕ ХВАТАЕТ?
    else if (currentMode === "missing") {
        // Парсим состав на фразы по запятым
        let ingredients = currentDish.composition.split(',').map(i => i.trim());
        
        if (ingredients.length > 2) {
            // Выбираем случайный ингредиент, который "заберем"
            let missingIndex = Math.floor(Math.random() * ingredients.length);
            let missingItem = ingredients[missingIndex];
            
            // Заменяем его в тексте на прочерк
            ingredients[missingIndex] = "🚨 <b>[...ЧТО-ТО ПРОПУЩЕНО...]</b>";
            let brokenComposition = ingredients.join(', ');

            // Название блюда (currentDish.name) отсюда полностью убираем!
            questionTextEl.innerHTML = `
                <div style="font-size: 13px; color: #8e8e93; margin-bottom: 12px; text-transform: uppercase; font-weight:600;">Изучаем рецептуру скрытого блюда:</div>
                <div class="composition-text">${brokenComposition}</div>
                <div style="font-size: 15px; font-weight: 700; margin-top: 15px; color: #ff3b30; text-align: center;">Какого ключевого ингредиента не хватает в описании?</div>
            `;
            
            generateButtonsForMissing(missingItem);
        } else {
            // Если состав слишком короткий, просто берем другое блюдо
            nextQuestion();
        }
    }
}

// ГЕНЕРАЦИЯ КНОПОК: Для режимов 1 и 2 (Выбор НАЗВАНИЯ блюда)
function generateButtonsForDishNames() {
    const answersBlock = document.getElementById("answers-block");
    answersBlock.innerHTML = ""; 
    
    let choices = [currentDish.name];
    
    // ВАЖНО: Берем "другие" блюда ТОЛЬКО из текущей категории
    let other = pool.map(d => d.name).filter(n => n !== currentDish.name);
    
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

// ГЕНЕРАЦИЯ КНОПОК: Для режима 3 (Выбор СОУСА/ФИШКИ)
function generateButtonsForDetails() {
    const answersBlock = document.getElementById("answers-block");
    answersBlock.innerHTML = "";

    // Функция, вытаскивающая соус/фишку (последние слова состава или маркерные слова)
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

    // Собираем детальки от других завтраков
    let otherDishes = originalDishes.filter(d => d.name !== currentDish.name);
    let otherDetails = [...new Set(otherDishes.map(d => getDishDetail(d)))].filter(d => d !== correctDetail && d !== "Стандартная ресторанная подача шефа");
    
    otherDetails.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) { if (otherDetails[i]) choices.push(otherDetails[i]); }
    while(choices.length < 4) { choices.push("Сливочный соус на основе трав"); } // подстраховка
    
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(detail => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.innerText = detail;
        btn.onclick = () => handleAnswer(btn, detail === correctDetail, correctDetail);
        answersBlock.appendChild(btn);
    });
}

// ГЕНЕРАЦИЯ КНОПОК: Для режима 4 (Что пропущено?)
function generateButtonsForMissing(correctItem) {
    const answersBlock = document.getElementById("answers-block");
    answersBlock.innerHTML = "";

    let choices = [correctItem];

    // 1. Берем ингредиенты ТОЛЬКО из текущей категории
    let categoryIngredientsPool = getCategoryIngredients(currentCategory);
    
    // 2. Фильтруем: убираем правильный ответ, пустые строки и слишком короткие слова
    let filteredPool = categoryIngredientsPool.filter(i => 
        i.toLowerCase() !== correctItem.toLowerCase() && i.length > 4
    );

    // 3. Перемешиваем и берем 3 случайных варианта
    filteredPool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) { 
        if (filteredPool[i]) choices.push(filteredPool[i]); 
    }
    
    // 4. Финальное перемешивание вариантов
    choices.sort(() => Math.random() - 0.5);

    // 5. Создаем кнопки
    choices.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.innerText = item;
        btn.onclick = () => handleAnswer(btn, item === correctItem, correctItem);
        answersBlock.appendChild(btn);
    });
    
    // Фильтруем пулл от повторов и правильного ответа
    allIngredientsPool = [...new Set(allIngredientsPool)].filter(i => i.toLowerCase() !== correctItem.toLowerCase() && i.length > 4);

    allIngredientsPool.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) { if (allIngredientsPool[i]) choices.push(allIngredientsPool[i]); }
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
            // Подсвечиваем правильный ответ
            if (correctText) {
                if (btn.innerText === correctText) btn.classList.add("correct");
            } else {
                if (btn.innerText === currentDish.name) btn.classList.add("correct");
            }
        });
    }

    setTimeout(() => {
        nextQuestion();
    }, 1800); // Чуть увеличил задержку до 1.8с, чтобы успели прочитать правильный ответ в сложных режимах
}

function getCategoryIngredients(targetCategory) {
    // Берем только те блюда, которые относятся к текущей категории
    const categoryDishes = originalDishes.filter(d => d.category.includes(targetCategory));
    
    // Собираем все "composition" в один список
    let allIngredients = [];
    categoryDishes.forEach(dish => {
        // Разрезаем строку по запятой и чистим от пробелов
        const parts = dish.composition.split(',').map(item => item.trim());
        allIngredients.push(...parts);
    });
    
    // Возвращаем уникальные значения (Set убирает дубликаты)
    return [...new Set(allIngredients)];
}
