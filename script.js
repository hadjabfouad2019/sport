// script.js
document.addEventListener('DOMContentLoaded', function() {
    // عرض التاريخ الحالي بالإنجليزية
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US');
    }

    // تحميل جميع البيانات عند فتح الصفحة
    loadAllData();

    // إضافة حدث الحفظ لكل تمرين
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const exerciseId = this.dataset.exercise;
            saveProgress(exerciseId);
        });
    });

    // إذا كانت الصفحة هي صفحة الوزن
    const saveWeightBtn = document.getElementById('save-weight-btn');
    if (saveWeightBtn) {
        saveWeightBtn.addEventListener('click', saveWeight);
    }

    // إذا كانت الصفحة الرئيسية، تهيئة الرسم البياني
    if (document.getElementById('weight-chart')) {
        initializeWeightChart();
    }
});

// تحميل جميع البيانات
function loadAllData() {
    const exerciseBoxes = document.querySelectorAll('.exercise-box');
    exerciseBoxes.forEach(box => {
        const historyDiv = box.querySelector('.history');
        if (!historyDiv) return;
        const exerciseId = historyDiv.id.replace('-history', '');
        const savedData = JSON.parse(localStorage.getItem(exerciseId)) || [];
        updateExerciseHistory(historyDiv, savedData);
        fillExerciseFields(exerciseId, savedData);
    });

    // تحميل بيانات الوزن إذا كانت موجودة
    if (document.getElementById('weight-history')) {
        loadWeightHistory();
    }
}

// حفظ تقدم التمرين
function saveProgress(exerciseId) {
    const startWeight = document.getElementById(`${exerciseId}-start`).value;
    const maxWeight = document.getElementById(`${exerciseId}-max`).value;
    const sets = document.getElementById(`${exerciseId}-sets`).value; // نص
    const reps = document.getElementById(`${exerciseId}-reps`).value; // نص

    if (!startWeight || !maxWeight) {
        alert('الرجاء إدخال الوزن الابتدائي والوزن الأقصى');
        return;
    }

    const newRecord = {
        date: new Date().toLocaleDateString('en-US'),
        startWeight: parseFloat(startWeight),
        maxWeight: parseFloat(maxWeight),
        sets: sets,    // نص
        reps: reps     // نص
    };

    const currentData = JSON.parse(localStorage.getItem(exerciseId)) || [];
    currentData.push(newRecord);
    localStorage.setItem(exerciseId, JSON.stringify(currentData));

    const historyDiv = document.getElementById(`${exerciseId}-history`);
    updateExerciseHistory(historyDiv, currentData);

    alert('تم حفظ التقدم بنجاح ✅');
}

// ملء الحقول بآخر البيانات
function fillExerciseFields(exerciseId, data) {
    if (data.length === 0) return;
    const lastRecord = data[data.length - 1];
    document.getElementById(`${exerciseId}-start`).value = lastRecord.startWeight || '';
    document.getElementById(`${exerciseId}-max`).value = lastRecord.maxWeight || '';
    document.getElementById(`${exerciseId}-sets`).value = lastRecord.sets || '';
    document.getElementById(`${exerciseId}-reps`).value = lastRecord.reps || '';
}

// تحديث سجل التمرين (يعرض فقط الوزن)
function updateExerciseHistory(historyDiv, data) {
    if (data.length === 0) {
        historyDiv.innerHTML = '<p>لا توجد بيانات بعد. ابدأ بتتبع تقدمك!</p>';
        return;
    }

    const recentData = data.slice(-5);
    historyDiv.innerHTML = recentData.map(record => `
        <div class="record-item">
            <span class="record-date">${record.date}</span>:
            البداية: <strong>${record.startWeight}kg</strong> | 
            الحد الأقصى: <strong>${record.maxWeight}kg</strong>
        </div>
    `).join('');
}

// تحميل سجل الوزن
function loadWeightHistory() {
    const weightData = JSON.parse(localStorage.getItem('weightData')) || [];
    const historyDiv = document.getElementById('weight-history');
    updateWeightHistory(historyDiv, weightData);
}

// تحديث سجل الوزن
function updateWeightHistory(historyDiv, data) {
    if (data.length === 0) {
        historyDiv.innerHTML = '<p>لا توجد بيانات للوزن بعد. ابدأ بتتبع وزنك!</p>';
        return;
    }

    const recentData = data.slice(-30);
    historyDiv.innerHTML = recentData.map(record => `
        <div class="record-item">
            <span class="record-date">${record.date}</span>: <strong>${record.weight}kg</strong>
        </div>
    `).join('');
}

// حفظ الوزن
function saveWeight() {
    const weightInput = document.getElementById('weight-value');
    const weight = weightInput.value;

    if (!weight) {
        alert('الرجاء إدخال وزنك');
        return;
    }

    const newRecord = {
        date: new Date().toLocaleDateString('en-US'),
        weight: parseFloat(weight)
    };

    const weightData = JSON.parse(localStorage.getItem('weightData')) || [];
    weightData.push(newRecord);

    // الاحتفاظ بآخر 30 يوم فقط
    const recentData = weightData.slice(-30);
    localStorage.setItem('weightData', JSON.stringify(recentData));

    updateWeightHistory(document.getElementById('weight-history'), recentData);
    alert('تم حفظ الوزن بنجاح ✅');
    weightInput.value = '';
}

// تهيئة الرسم البياني للوزن
function initializeWeightChart() {
    const weightData = JSON.parse(localStorage.getItem('weightData')) || [];
    if (weightData.length === 0) return;

    const ctx = document.getElementById('weight-chart');
    if (!ctx) return;

    const dates = weightData.map(record => record.date);
    const weights = weightData.map(record => record.weight);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Weight (kg)',
                data: weights,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}
