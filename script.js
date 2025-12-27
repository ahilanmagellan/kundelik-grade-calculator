// Элементы
const variantSelect = document.getElementById('variantSelect');
const foSection = document.getElementById('foSection');
const sorCountInput = document.getElementById('sorCount');
const sorInputsDiv = document.getElementById('sorInputs');
const sochScoreInput = document.getElementById('sochScore');
const sochMaxInput = document.getElementById('sochMax');
const calculateBtn = document.getElementById('calculateBtn');
const percentageDisplay = document.getElementById('percentage');
const gradeDisplay = document.getElementById('grade');

// Массив для хранения значений ФО
let foValues = [];

// -------------------- Функции --------------------

// Генерация ФО
function generateFoInputs() {
    const variant = variantSelect.value;

    foSection.innerHTML = '';

    if (variant === 'manual') {
        let foCount = foValues.length || 1;

        foSection.innerHTML = `
            <label>Количество ФО:</label>
            <input type="number" id="foManualCount" value="${foCount}" min="1" max="20">
            <div id="foManualInputs"></div>
        `;

        const foManualCountInput = document.getElementById('foManualCount');
        const foManualInputsDiv = document.getElementById('foManualInputs');

        // Слушатель изменения количества
        foManualCountInput.addEventListener('input', () => {
            const newCount = Number(foManualCountInput.value) || 1;
            const oldValues = foValues.slice();
            foValues = [];
            for (let i = 0; i < newCount; i++) {
                foValues[i] = oldValues[i] !== undefined ? oldValues[i] : 0;
            }
            renderFoInputs();
        });

        function renderFoInputs() {
            foManualInputsDiv.innerHTML = '';
            foValues.forEach((val, idx) => {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'foScore';
                input.value = val;
                input.placeholder = "Набранные баллы";
                input.addEventListener('input', () => {
                    foValues[idx] = Number(input.value) || 0;
                });
                const label = document.createElement('label');
                label.textContent = `ФО ${idx + 1} (макс 10 баллов):`;
                foManualInputsDiv.appendChild(label);
                foManualInputsDiv.appendChild(input);
            });
        }

        renderFoInputs();

    } else {
        // Ввод суммы и количества ФО
        foSection.innerHTML = `
            <label>Сумма всех ФО:</label>
            <input type="number" id="foTotal" placeholder="Сумма всех ФО" value="0">
            <label>Количество ФО:</label>
            <input type="number" id="foCount" placeholder="Количество ФО" value="1">
        `;
    }
}

// Генерация СОР
function generateSorInputs() {
    sorInputsDiv.innerHTML = '';
    const count = parseInt(sorCountInput.value) || 1;
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = `СОР ${i+1} (Набранные баллы / Максимальные баллы):`;
        const inputScore = document.createElement('input');
        inputScore.type = 'number';
        inputScore.className = 'sorScore';
        inputScore.placeholder = 'Набранные баллы';
        inputScore.value = 0;
        const inputMax = document.createElement('input');
        inputMax.type = 'number';
        inputMax.className = 'sorMax';
        inputMax.placeholder = 'Максимальные баллы';
        inputMax.value = 1;
        div.appendChild(label);
        div.appendChild(inputScore);
        div.appendChild(inputMax);
        sorInputsDiv.appendChild(div);
    }
}

// -------------------- Инициализация --------------------
generateFoInputs();
generateSorInputs();

// Слушатели
variantSelect.addEventListener('change', () => {
    foValues = [];
    generateFoInputs();
});
sorCountInput.addEventListener('input', generateSorInputs);

// -------------------- Расчёт --------------------
calculateBtn.addEventListener('click', () => {
    const sochScore = Number(sochScoreInput.value) || 0;
    const sochMax = Number(sochMaxInput.value) || 1;

    if (sochScore > sochMax) {
        alert("Ошибка: набранные баллы за Соч больше максимального!");
        return;
    }

    // СОР
    const sorScores = Array.from(document.querySelectorAll('.sorScore')).map(x => Number(x.value) || 0);
    const sorMaxes = Array.from(document.querySelectorAll('.sorMax')).map(x => Number(x.value) || 1);

    for (let i = 0; i < sorScores.length; i++) {
        if (sorScores[i] > sorMaxes[i]) {
            alert(`Ошибка: набранные баллы за СОР ${i + 1} больше максимального!`);
            return;
        }
    }

    let totalSorMax = sorMaxes.reduce((a,b)=>a+b,0);
    let sorPercent = (sorScores.reduce((a,b)=>a+b,0) / totalSorMax) * 25;
    sorPercent = Math.round(sorPercent * 10) / 10; // округление до 1 знака

    // SOCH
    let sochPercent = (sochScore / sochMax) * 50;
    sochPercent = Math.round(sochPercent * 10) / 10;

    // ФО
    let foPercent = 0;
    if (variantSelect.value === 'manual') {
        for (let i = 0; i < foValues.length; i++) {
            if (foValues[i] > 10) {
                alert(`Ошибка: ФО ${i + 1} больше 10!`);
                return;
            }
        }
        if (foValues.length > 0) {
            const avgFo = foValues.reduce((a,b)=>a+b,0)/foValues.length;
            foPercent = (avgFo / 10) * 25;
            foPercent = Math.round(foPercent * 10) / 10;
        }
    } else {
        const foTotal = Number(document.getElementById('foTotal').value) || 0;
        const foCount = Number(document.getElementById('foCount').value) || 1;
        if (foTotal / foCount > 10) {
            alert("Ошибка: среднее значение ФО больше 10!");
            return;
        }
        foPercent = ((foTotal / foCount) / 10) * 25;
        foPercent = Math.round(foPercent * 10) / 10;
    }

    // Сумма
    let totalPercent = sorPercent + sochPercent + foPercent;
    totalPercent = Math.round(totalPercent); // сумма до целого

    percentageDisplay.textContent = `Сумма процентов: ${totalPercent}%`;

    let grade = '-';
    if (totalPercent >= 85) grade = '5';
    else if (totalPercent >= 65) grade = '4';
    else if (totalPercent >= 40) grade = '3';
    else grade = '2';

    gradeDisplay.textContent = `Оценка: ${grade}`;
});