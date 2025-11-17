// ---------- Steps ----------
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');

const step2Title = document.getElementById('step2-title');
const classesGrid = document.getElementById('classes-grid');

const backStep2 = document.getElementById('back-step2');
const backStep3 = document.getElementById('back-step3');

const authBtn = document.getElementById('auth-btn');
const welcomeText = document.getElementById('welcome-text');

// ---------- Auth ----------
let user = JSON.parse(localStorage.getItem('user')) || null;

if (user && user.name) {
    welcomeText.textContent = `Hello, ${user.name}!`;
    authBtn.style.display = 'none';
} else {
    authBtn.addEventListener('click', () => window.location.href = 'auth.html');
}

// ---------- Step 1: School/College ----------
const choiceButtons = document.querySelectorAll('#step-1 .choice-btn');

choiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        localStorage.setItem('userType', type);

        classesGrid.innerHTML = '';

        if (type === 'school') {
            step2Title.textContent = 'Select Your Class';
            ['Class 6','Class 7','Class 8','Class 9','Class 10'].forEach(cls => {
                const div = document.createElement('div');
                div.classList.add('subject-card');
                div.textContent = cls;
                div.addEventListener('click', () => {
                    localStorage.setItem('userClass', cls);
                    step2.style.display = 'none';
                    step3.style.display = 'block';
                    attachSubjectListeners();
                });
                classesGrid.appendChild(div);
            });
        } else {
            step2Title.textContent = 'Select Your Branch';
            ['CSE','ECE','ME','CE'].forEach(branch => {
                const div = document.createElement('div');
                div.classList.add('subject-card');
                div.textContent = branch;
                div.addEventListener('click', () => {
                    localStorage.setItem('userBranch', branch);
                    step2.style.display = 'none';
                    step3.style.display = 'block';
                    attachSubjectListeners();
                });
                classesGrid.appendChild(div);
            });
        }

        step1.style.display = 'none';
        step2.style.display = 'block';
    });
});

// ---------- Step 3: Subject click listeners ----------
// ---------- Step 3: Subject click listeners ----------
function attachSubjectListeners() {
    const subjectCards = document.querySelectorAll('#subjects-grid .subject-card');

    subjectCards.forEach(card => {
        card.addEventListener('click', async () => {
            if (!user) {
                alert('Please login first!');
                window.location.href = 'auth.html';
                return;
            }

            const subject = card.textContent;
            localStorage.setItem('userSubject', subject);

            step3.style.display = 'none';

            // Step 4: Questions section
            let step4 = document.getElementById('step-4');
            if (!step4) {
                step4 = document.createElement('section');
                step4.id = 'step-4';
                step4.className = 'step';
                step4.innerHTML = `
                    <h2 id="subject-title"></h2>
                    <div id="quiz-header"></div>
                    <div id="questions-container"></div>
                `;
                document.querySelector('.main-container').appendChild(step4);
            }

            document.getElementById('subject-title').textContent = `Quiz: ${subject}`;
            const questionsContainer = document.getElementById('questions-container');

            try {
                const response = await fetch('/api/quizzes');
                const questions = await response.json();

                let score = 0;
                let currentIndex = 0;
                let timePerQuestion = 30; // seconds per question
                let timeLeft = timePerQuestion;
                let timerInterval;

                // ---------- QUIZ HEADER ----------
                const quizHeader = document.getElementById('quiz-header');
                quizHeader.innerHTML = `
                    <div class="progress-container">
                        <div id="progress-bar"></div>
                    </div>
                    <div class="timer">⏱ <span id="timer">${timeLeft}</span>s</div>
                `;

                const progressBar = document.getElementById('progress-bar');
                const timerEl = document.getElementById('timer');

                // ---------- TIMER ----------
                function startTimer() {
                    timerEl.textContent = timeLeft;
                    timerInterval = setInterval(() => {
                        timeLeft--;
                        timerEl.textContent = timeLeft;

                        if (timeLeft <= 0) {
                            clearInterval(timerInterval);
                            if (currentIndex + 1 < questions.length) {
                                currentIndex++;
                                timeLeft = timePerQuestion;
                                showQuestion(currentIndex);
                                startTimer();
                            } else {
                                finishQuiz();
                            }
                        }
                    }, 1000);
                }

                // ---------- SHOW QUESTION ----------
                function showQuestion(index) {
                    const q = questions[index];
                    if (!q) return;

                    // Update progress
                    const progress = ((index + 1) / questions.length) * 100;
                    progressBar.style.width = progress + '%';

                    questionsContainer.innerHTML = `
                        <div class="question-card">
                            <h3>Question ${index + 1} of ${questions.length}</h3>
                            <p>${q.question}</p>
                            <div id="options-container"></div>
                        </div>
                    `;

                    const optionsContainer = document.getElementById('options-container');

                    q.options.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = 'option-btn';
                        btn.textContent = opt;
                        btn.addEventListener('click', () => {
                            if (opt === q.answer) score++;
                            clearInterval(timerInterval);
                            if (index + 1 < questions.length) {
                                currentIndex++;
                                timeLeft = timePerQuestion;
                                showQuestion(currentIndex);
                                startTimer();
                            } else {
                                finishQuiz();
                            }
                        });
                        optionsContainer.appendChild(btn);
                    });
                }

                // ---------- FINISH QUIZ ----------
                async function finishQuiz() {
                    clearInterval(timerInterval);

                    try {
                        if (user && user._id) {
                            await fetch('/api/results', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: user._id,
                                    subject,
                                    score,
                                    totalQuestions: questions.length
                                })
                            });
                        }

                        const quizResult = {
                            subject,
                            totalQuestions: questions.length,
                            correct: score,
                            date: new Date().toISOString()
                        };
                        localStorage.setItem('latestQuizResult', JSON.stringify(quizResult));

                        questionsContainer.innerHTML = `
                            <h2>Quiz Completed!</h2>
                            <p>Your Score: ${score}/${questions.length}</p>
                            <p>Redirecting to dashboard...</p>
                        `;
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 2000);
                    } catch (err) {
                        console.error(err);
                        alert('Error saving quiz result.');
                    }
                }

                // ---------- START QUIZ ----------
                timeLeft = timePerQuestion;
                showQuestion(currentIndex);
                startTimer();
                step4.style.display = 'block';

            } catch (err) {
                questionsContainer.innerHTML = '<p>Failed to load questions</p>';
                console.error(err);
            }
        });
    });
}




// ---------- Back buttons ----------
backStep2.addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = 'block';
});
backStep3.addEventListener('click', () => {
    step3.style.display = 'none';
    step2.style.display = 'block';
});
