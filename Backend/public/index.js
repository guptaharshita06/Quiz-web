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
                    <div id="questions-container"></div>
                    <button class="back-btn" id="back-step4">Back</button>
                `;
                document.querySelector('.main-container').appendChild(step4);

                // Back button
                step4.querySelector('#back-step4').addEventListener('click', () => {
                    step4.style.display = 'none';
                    step3.style.display = 'block';
                });
            }

            document.getElementById('subject-title').textContent = `Questions for ${subject}`;
            const questionsContainer = document.getElementById('questions-container');
            questionsContainer.innerHTML = '<p>Loading questions...</p>';

            try {
                const response = await fetch('/api/quizzes');
                const questions = await response.json();
                questionsContainer.innerHTML = '';

                let score = 0;

                questions.forEach((q, index) => {
                    const div = document.createElement('div');
                    div.classList.add('question-card');
                    div.innerHTML = `<p>${index + 1}. ${q.question}</p>`;

                    q.options.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = 'option-btn';
                        btn.innerHTML = opt;
                        btn.addEventListener('click', () => {
                            if (opt === q.answer) {
                                alert('✅ Correct!');
                                score++;
                            } else {
                                alert(`❌ Incorrect! Correct answer: ${q.answer}`);
                            }
                        });
                        div.appendChild(btn);
                    });

                    questionsContainer.appendChild(div);
                });

                // Finish quiz button
                const finishBtn = document.createElement('button');
                finishBtn.textContent = 'Finish Quiz';
                finishBtn.addEventListener('click', async () => {
                    try {
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
                        alert(`Quiz Completed! Score: ${score}/${questions.length}`);
                        step4.style.display = 'none';
                        step1.style.display = 'block';
                    } catch (err) {
                        console.error(err);
                        alert('Failed to save result');
                    }
                });
                questionsContainer.appendChild(finishBtn);

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
