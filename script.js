document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // وظائف عامة للتعامل مع localStorage
    // ----------------------------------------------------

    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`خطأ في حفظ البيانات للمفتاح '${key}':`, e);
        }
    };

    const loadData = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`خطأ في تحميل البيانات للمفتاح '${key}':`, e);
            return [];
        }
    };

    // ----------------------------------------------------
    // منطق صفحات التمارين (day1.html, day2.html, day3.html)
    // ----------------------------------------------------

    const setupExercisePage = () => {
        const exerciseCards = document.querySelectorAll('.exercise-card');
        
        if (exerciseCards.length === 0) return;

        exerciseCards.forEach(card => {
            const exerciseId = card.dataset.exercise;
            const saveButton = card.querySelector('.save-button');
            const initialWeightInput = card.querySelector('.initial-weight-input');
            const maxWeightInput = card.querySelector('.max-weight-input');
            const historyList = card.querySelector('.history-list');

            let history = loadData(exerciseId);
            
            const renderHistory = () => {
                historyList.innerHTML = '';
                history.forEach((entry, index) => {
                    const li = document.createElement('li');
                    
                    const repsText = Array.isArray(entry.reps)
                        ? entry.reps.filter(rep => rep !== '').join(' / ') || 'لا يوجد'
                        : 'لا يوجد';
                    
                    const textSpan = document.createElement('span');
                    textSpan.textContent = `التاريخ: ${entry.date} | الوزن: ${entry.initialWeight} كجم -> ${entry.maxWeight} كجم | المجموعات: ${entry.sets} | التكرارات: ${repsText}`;
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'حذف';
                    deleteButton.classList.add('delete-button');
                    
                    deleteButton.addEventListener('click', () => {
                        history.splice(index, 1);
                        saveData(exerciseId, history);
                        renderHistory();
                    });
                    
                    li.appendChild(textSpan);
                    li.appendChild(deleteButton);
                    historyList.appendChild(li);
                });
            };

            renderHistory();

            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    // التحقق من أن حقول الوزن ليست فارغة
                    if (!initialWeightInput.value || !maxWeightInput.value) {
                        alert('الرجاء إدخال الوزن الابتدائي وأقصى وزن للتقدم.');
                        return; // يوقف تنفيذ الدالة إذا كانت الحقول فارغة
                    }

                    const today = new Date();
                    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
                    
                    const newEntry = {
                        date: formattedDate,
                        initialWeight: initialWeightInput.value,
                        maxWeight: maxWeightInput.value,
                    };

                    history.push(newEntry);
                    saveData(exerciseId, history);
                    renderHistory();

                    initialWeightInput.value = '';
                    maxWeightInput.value = '';
                });
            }
        });
    };

    // ----------------------------------------------------
    // منطق صفحة مراقبة الوزن (weight.html)
    // ----------------------------------------------------

    const setupWeightPage = () => {
        const saveWeightButton = document.getElementById('saveWeightButton');
        const currentWeightInput = document.getElementById('currentWeight');
        const weightHistoryList = document.getElementById('weightHistoryList');
        const achievementBadge = document.getElementById('achievementBadge');

        if (!saveWeightButton) return;

        let weightData = loadData('weightData');
        
        const renderWeightHistory = () => {
            weightHistoryList.innerHTML = '';
            const recentWeights = weightData.slice(-7);
            recentWeights.forEach(entry => {
                const li = document.createElement('li');
                li.textContent = `التاريخ: ${entry.date}: ${entry.weight} كجم`;
                weightHistoryList.appendChild(li);
            });
        };

        renderWeightHistory();

        saveWeightButton.addEventListener('click', () => {
            const weight = parseFloat(currentWeightInput.value);
            if (isNaN(weight) || weight <= 0) {
                alert('الرجاء إدخال وزن صحيح.');
                return;
            }

            const maxWeight = weightData.length > 0 ? Math.max(...weightData.map(d => d.weight)) : 0;
            if (weight > maxWeight) {
                achievementBadge.style.display = 'block';
                setTimeout(() => {
                    achievementBadge.style.display = 'none';
                }, 5000);
            }

            const today = new Date();
            const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

            const newEntry = {
                date: formattedDate,
                weight: weight
            };

            weightData.push(newEntry);
            saveData('weightData', weightData);
            renderWeightHistory();
            currentWeightInput.value = '';
        });
    };

    // ----------------------------------------------------
    // منطق الصفحة الرئيسية (index.html)
    // ----------------------------------------------------

    const setupIndexPage = () => {
        const weightChartCanvas = document.getElementById('weightChart');
        if (!weightChartCanvas) return;
        
        const weightData = loadData('weightData');
        const labels = weightData.map(d => d.date);
        const data = weightData.map(d => d.weight);

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'الوزن بالكيلوجرام',
                    data: data,
                    borderColor: 'rgb(0, 123, 255)',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'الوزن (كجم)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'التاريخ'
                        }
                    }
                }
            }
        };

        new Chart(weightChartCanvas, chartConfig);
    };

    // تشغيل الوظائف بناءً على الصفحة الحالية
    if (document.querySelector('.exercise-card')) {
        setupExercisePage();
    } else if (document.getElementById('saveWeightButton')) {
        setupWeightPage();
    } else if (document.getElementById('weightChart')) {
        setupIndexPage();
    }
});