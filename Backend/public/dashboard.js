const userNameElem = document.getElementById('student-name');
const userClassElem = document.getElementById('student-class');

const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  alert('Please login first');
  window.location.href = 'auth.html';
}

userNameElem.textContent = `Hello, ${user.name}!`;
userClassElem.textContent = "Quiz Performance Summary";

// Load last 5 results
async function loadResults() {
  try {
    const res = await fetch(`http://localhost:5000/api/results/user/${user._id}`);
    const results = await res.json();

    const recentList = document.getElementById('recent-results-list');
    recentList.innerHTML = '';

    if (!results.length) {
      recentList.innerHTML = `<tr><td colspan="6">No recent results available.</td></tr>`;
      return;
    }

    results.forEach(r => {
      const attempted = r.totalQuestions;
      const correct = r.score;
      const incorrect = attempted - correct;
      const marks = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.subject}</td>
        <td>${attempted}</td>
        <td>${correct}</td>
        <td>${incorrect}</td>
        <td>${marks}%</td>
      `;
      recentList.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('Failed to load results');
  }
}

window.onload = loadResults;
