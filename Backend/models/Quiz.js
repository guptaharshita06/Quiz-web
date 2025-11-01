const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  alert('Please login first');
  window.location.href = 'auth.html';
}

const quizContainer = document.getElementById('quiz-questions');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');

let currentQuiz = [];
let currentIndex = 0;
let score = 0;

// Fetch quiz questions from backend
async function loadQuiz() {
  try {
    const res = await fetch('http://localhost:5000/api/quizzes');
    if (!res.ok) throw new Error('Failed to load quiz');
    currentQuiz = await res.json();
    showQuestion();
  } catch (err) {
    console.error(err);
    alert('Failed to load quiz');
  }
}

function showQuestion() {
  if (currentIndex >= currentQuiz.length) {
    alert(`Quiz finished! Your score: ${score}/${currentQuiz.length}`);
    saveResult();
    return;
  }

  const q = currentQuiz[currentIndex];
  quizContainer.innerHTML = `
    <h3>${q.question}</h3>
    <div class="options">
      ${q.options.map(opt => `<button class="option-btn">${opt}</button>`).join('')}
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (e.target.textContent === q.answer) score++;
      currentIndex++;
      showQuestion();
    });
  });
}

async function saveResult() {
  try {
    const resultData = {
      userId: user._id,
      quizId: Date.now().toString(),
      subject: localStorage.getItem('userLevel') || 'Quiz',
      score,
      totalQuestions: currentQuiz.length
    };

    const res = await fetch('http://localhost:5000/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });

    if (!res.ok) throw new Error('Failed to save result');

    alert('Result saved! Redirecting to dashboard...');
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    alert('Failed to save result');
  }
}

window.onload = loadQuiz;
