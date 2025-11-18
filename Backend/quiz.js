// ---------- DOM Elements ----------
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const step4 = document.getElementById('step-4');
const step5 = document.getElementById('step-5');

const step2Title = document.getElementById('step2-title');
const classesGrid = document.getElementById('classes-grid');
const subjectsGrid = document.getElementById('subjects-grid');

const numQuestionsInput = document.getElementById('num-questions');
const questionTypeSelect = document.getElementById('question-type');
const questionDifficultySelect = document.getElementById('question-difficulty');
const startQuizBtn = document.getElementById('start-quiz-btn');

const questionsContainer = document.getElementById('questions-container');
const quizTitle = document.getElementById('quiz-title');

const backStep2 = document.getElementById('back-step2');
const backStep3 = document.getElementById('back-step3');
const backStep4 = document.getElementById('back-step4');
const backStep5 = document.getElementById('back-step5');

const authBtn = document.getElementById('auth-btn');
const welcomeText = document.getElementById('welcome-text');

// Timer elements
let timerCircle, timerEl, progressCircle;
let radius = 28;
let circumference = 2 * Math.PI * radius;
let timeLeft = 30, totalTime = 30, timerInterval;

// ---------- School & College Data ----------
const schoolClasses = ["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const schoolSubjects = {
  "Class 1":["Math","English","Science","EVS"], "Class 2":["Math","English","Science","EVS"], "Class 3":["Math","English","Science","EVS"],
  "Class 4":["Math","English","Science","Social Studies"], "Class 5":["Math","English","Science","Social Studies"], "Class 6":["Math","English","Science","Social Studies"],
  "Class 7":["Math","English","Science","Social Studies"], "Class 8":["Math","English","Science","Social Studies"],
  "Class 9":["Math","Physics","Chemistry","Biology","History","Geography","English"],
  "Class 10":["Math","Physics","Chemistry","Biology","History","Geography","English"],
  "Class 11":["Math","Physics","Chemistry","Biology","Computer Science","English"],
  "Class 12":["Math","Physics","Chemistry","Biology","Computer Science","English"]
};
const btechBranches = {
  "CSE":["Data Structures","Algorithms","DBMS","Operating Systems","Networking"],
  "ECE":["Digital Electronics","Analog Electronics","Signals & Systems","Microprocessors"],
  "ME":["Thermodynamics","Fluid Mechanics","Machine Design","Strength of Materials"],
  "CE":["Structural Analysis","Geotechnical Engineering","Concrete Technology","Surveying"],
  "EE":["Electrical Machines","Power Systems","Control Systems","Circuit Theory"]
};

// ---------- Utility Functions ----------
function shuffle(array){ for(let i=array.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]];} return array; }
function decodeHTML(html){ const txt=document.createElement("textarea"); txt.innerHTML=html; return txt.value; }
function showStep(step){ [step1,step2,step3,step4,step5].forEach(s=>s.style.display='none'); step.style.display='block'; }

// ---------- Auth ----------
let user = JSON.parse(localStorage.getItem('user')) || null;
if(user && user.name){ welcomeText.textContent=`Hello, ${user.name}!`; authBtn.style.display='none'; }
else{ authBtn.addEventListener('click',()=>window.location.href='auth.html'); }

// ---------- Step 1: Level ----------
document.querySelectorAll('#step-1 .choice-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const type=btn.dataset.type;
    classesGrid.innerHTML='';

    if(type==='school'){
      step2Title.textContent='Select Your Class';
      schoolClasses.forEach(cls=>{
        const div=document.createElement('div');
        div.className='subject-card';
        div.textContent=cls;
        div.addEventListener('click',()=>{
          localStorage.setItem('userClass',cls);
          localStorage.setItem('level','school');
          showSubjects(schoolSubjects[cls]);
          showStep(step3);
        });
        classesGrid.appendChild(div);
      });
    } else {
      step2Title.textContent='Select Branch';
      Object.keys(btechBranches).forEach(branch=>{
        const div=document.createElement('div');
        div.className='subject-card';
        div.textContent=branch;
        div.addEventListener('click',()=>{
          localStorage.setItem('userBranch',branch);
          localStorage.setItem('level','college');
          showSubjects(btechBranches[branch]);
          showStep(step3);
        });
        classesGrid.appendChild(div);
      });
    }
    showStep(step2);
  });
});

// ---------- Back buttons ----------
backStep2.addEventListener('click',()=>showStep(step1));
backStep3.addEventListener('click',()=>showStep(step2));
backStep4.addEventListener('click',()=>showStep(step3));
backStep5.addEventListener('click',()=>showStep(step4));

// ---------- Step 3: Show Subjects ----------
function showSubjects(subjects){
  subjectsGrid.innerHTML='';
  subjects.forEach(sub=>{
    const div=document.createElement('div');
    div.className='subject-card';
    div.textContent=sub;
    div.addEventListener('click',()=>{
      localStorage.setItem('selectedSubject',sub);
      showStep(step4);
    });
    subjectsGrid.appendChild(div);
  });
}

// ---------- Quiz State ----------
let currentQuiz=[], currentIndex=0, score=0;

// ---------- Timer Functions ----------
function initTimer(){
  timerCircle = document.getElementById('timer-circle');
  timerEl = document.getElementById('timer');
  if(!timerCircle || !timerEl) return;
  progressCircle = timerCircle.querySelector('.progress');
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = 0;
}

function startTimer(){
  timeLeft = totalTime;
  if(!timerEl || !progressCircle) return;
  timerEl.textContent = timeLeft;
  progressCircle.style.strokeDashoffset = 0;
  timerCircle.classList.remove('critical');
  clearInterval(timerInterval);

  timerInterval = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = timeLeft;
    const offset = circumference*(timeLeft/totalTime);
    progressCircle.style.strokeDashoffset = circumference - offset;

    if(timeLeft>20) progressCircle.style.stroke='#66a6ff';
    else if(timeLeft>10) progressCircle.style.stroke='#f39c12';
    else progressCircle.style.stroke='#ff3b3b';

    if(timeLeft<=10) timerCircle.classList.add('critical');
    else timerCircle.classList.remove('critical');

    if(timeLeft<=0){
      clearInterval(timerInterval);
      currentIndex++;
      showQuestion(currentIndex);
    }
  },1000);
}

// ---------- Step 4/5: Start Quiz ----------
startQuizBtn.addEventListener('click',()=>{
  const subject = localStorage.getItem('selectedSubject') || 'General Knowledge';
  const amount = parseInt(numQuestionsInput.value) || 5;
  const type = questionTypeSelect.value || 'multiple';
  const difficulty = questionDifficultySelect.value || '';
  loadQuiz(subject, amount, type, difficulty);
  showStep(step5);
});

// ---------- Load Quiz ----------
async function loadQuiz(subject, amount, type, difficulty){
  quizTitle.textContent = `Quiz: ${subject}`;
  questionsContainer.innerHTML = 'Loading...';
  currentIndex = 0;
  score = 0;
  initTimer();

  try{
    let url = `https://opentdb.com/api.php?amount=${amount}&type=${type}`;
    if(difficulty) url += `&difficulty=${difficulty}`;

    const res = await fetch(url);
    const data = await res.json();

    if(!data.results || data.results.length===0){
      questionsContainer.innerHTML='No questions found.';
      return;
    }

    currentQuiz = data.results.map(q=>({
      question: decodeHTML(q.question),
      options: shuffle([...q.incorrect_answers.map(a=>decodeHTML(a)), decodeHTML(q.correct_answer)]),
      answer: decodeHTML(q.correct_answer)
    }));

    showQuestion(currentIndex);
  } catch(err){
    console.error(err);
    questionsContainer.innerHTML='Failed to load questions.';
  }
}

// ---------- Show Question ----------
function showQuestion(index){
  if(index >= currentQuiz.length){ showResult(); return; }
  startTimer();

  const q = currentQuiz[index];
  questionsContainer.innerHTML = '';

  const div = document.createElement('div');
  div.className='question-card';
  div.innerHTML=`
    <h2 class="question-text">${index+1}. ${q.question}</h2>
    <div class="options-container"></div>
    <div class="quiz-controls">
      <button id="skip-btn" class="skip-btn">Skip</button>
      <button id="next-btn" class="next-btn" disabled>Next</button>
    </div>
  `;

  const optionsContainer = div.querySelector('.options-container');
  const nextBtn = div.querySelector('#next-btn');
  const skipBtn = div.querySelector('#skip-btn');

  q.options.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className='option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', ()=>{
      div.querySelectorAll('.option-btn').forEach(b=>b.disabled=true);
      if(opt===q.answer) btn.classList.add('correct');
      else{
        btn.classList.add('incorrect');
        div.querySelectorAll('.option-btn').forEach(b=>{
          if(b.textContent===q.answer) b.classList.add('correct');
        });
      }
      if(opt===q.answer) score++;
      nextBtn.disabled=false;
      clearInterval(timerInterval);
    });
    optionsContainer.appendChild(btn);
  });

  skipBtn.addEventListener('click', ()=>{ clearInterval(timerInterval); currentIndex++; showQuestion(currentIndex); });
  nextBtn.addEventListener('click', ()=>{ clearInterval(timerInterval); currentIndex++; showQuestion(currentIndex); });

  questionsContainer.appendChild(div);
}

// ---------- Show Result ----------
function showResult(){
  questionsContainer.innerHTML=`
    <div class="result-box">
      <h2>🎉 Quiz Completed!</h2>
      <p>Your score: <strong>${score}/${currentQuiz.length}</strong></p>
      <button id="finish-btn" class="finish-btn">Finish</button>
    </div>
  `;
  document.getElementById('finish-btn').addEventListener('click', ()=>showStep(step1));
}
