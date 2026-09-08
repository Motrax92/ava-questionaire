const questions = [
  { text: "Quelle est la couleur préférée d'Ava ?", clue: "Un indice dans ses carnets", options: [{ label: 'Le bleu des grands jours', number: 7 }, { label: 'Le rouge des aventures', number: 3 }, { label: 'Le vert du jardin', number: 5 }, { label: 'Le jaune du soleil', number: 1 }, { label: "Le violet de l'aurore", number: 8 }], correct: 0 },
  { text: "Où avons-nous fait notre premier date ?", clue: "Un souvenir à retrouver", options: [{ label: 'Dans un cinéma', number: 2 }, { label: 'Dans un restaurant', number: 4 }, { label: 'Dans un parc', number: 6 }, { label: 'Chez moi', number: 1 }, { label: 'Au lycée', number: 9 }], correct: 2 },
  { text: "À quelle date nous sommes-nous mis ensemble ?", clue: "Un souvenir important pour nous", options: [{ label: 'Le 18 juin 2023', number: 1 }, { label: 'Le 25 juillet 2012', number: 2 }, { label: 'Le 14 novembre 2026', number: 3 }, { label: 'Le 16 novembre 2023', number: 4 }, { label: 'Depuis ta naissance', number: 5 }], correct: 3 },
  { text: "Quel est ton plat préféré ?", clue: "Un indice gourmand", options: [{ label: 'Les pâtes', number: 1 }, { label: 'La pizza', number: 2 }, { label: 'Le couscous', number: 3 }, { label: 'Les sushis', number: 4 }, { label: 'Le hamburger', number: 5 }], correct: 0 },
  { text: "Quel est le nombre de points que les juges vont m'accorder ?", clue: "Le résultat de la mission", options: [{ label: '2 points', number: 1 }, { label: '0,5 point', number: 2 }, { label: '0,02 point', number: 3 }, { label: '0,01 point', number: 4 }, { label: '0 point', number: 5 }], correct: 2 }
];
const questionList = document.querySelector('#questionList');
const progressBar = document.querySelector('#progressBar');
const answeredCount = document.querySelector('#answeredCount');
const historySection = document.querySelector('#historySection');
const historyList = document.querySelector('#historyList');
const modal = document.querySelector('#resultModal');
const previousQuestion = document.querySelector('#previousQuestion');
const nextQuestion = document.querySelector('#nextQuestion');
let currentQuestion = 0;
const selections = Array(questions.length).fill(null);

function renderQuestion() {
  const question = questions[currentQuestion];
  questionList.innerHTML = `<div class="single-question"><div class="question-prompt"><span class="question-number">0${currentQuestion + 1}</span><div><strong>${question.text}</strong><small>${question.clue}</small></div></div><div class="answer-list" role="radiogroup" aria-label="Réponses à la question ${currentQuestion + 1}">${question.options.map((option, optionIndex) => `<button type="button" class="answer-option ${selections[currentQuestion] === optionIndex ? 'selected' : ''}" data-option="${optionIndex}" role="radio" aria-checked="${selections[currentQuestion] === optionIndex}"><span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span><span>${option.label}</span><b class="lock-notch">${option.number}</b></button>`).join('')}</div></div>`;
  questionList.querySelectorAll('.answer-option').forEach((button) => button.addEventListener('click', () => {
    selections[currentQuestion] = Number(button.dataset.option);
    renderQuestion();
    updateProgress();
  }));
  previousQuestion.disabled = currentQuestion === 0;
  nextQuestion.textContent = currentQuestion === questions.length - 1 ? 'Voir mon score  ✦' : 'Question suivante  →';
}

function updateProgress() {
  const answered = selections.filter((selection) => selection !== null).length;
  answeredCount.textContent = answered;
  progressBar.style.width = `${(answered / questions.length) * 100}%`;
}

previousQuestion.addEventListener('click', () => { if (currentQuestion > 0) { currentQuestion -= 1; renderQuestion(); } });
nextQuestion.addEventListener('click', () => {
  if (selections[currentQuestion] === null) {
    questionList.querySelector('.single-question').classList.add('incomplete');
    return;
  }
  if (currentQuestion < questions.length - 1) { currentQuestion += 1; renderQuestion(); return; }
  showResult();
});

function showResult() {
  const score = selections.reduce((total, selection, index) => total + (selection === questions[index].correct ? 1 : 0), 0);
  const history = JSON.parse(localStorage.getItem('ava-history') || '[]');
  history.unshift({ score, date: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()) });
  localStorage.setItem('ava-history', JSON.stringify(history.slice(0, 12)));
  const isPerfectScore = score === questions.length;
  document.querySelector('#scoreNumber').textContent = score;
  document.querySelector('#resultTitle').textContent = score === questions.length ? 'Mission réussie !' : 'Ton score est prêt.';
  document.querySelector('#resultText').textContent = score === questions.length ? 'Félicitations, le cadenas peut être ouvert. Tu as trouvé le code parfait.' : 'Bien joué. Ton résultat est enregistré dans ton historique.';
  document.querySelector('#resultIcon').textContent = score === questions.length ? '✦' : '◈';
  document.querySelector('#regularResult').hidden = isPerfectScore;
  document.querySelector('#successResult').hidden = !isPerfectScore;
  modal.hidden = false;
}

document.querySelector('#menuButton').addEventListener('click', () => {
  const panel = document.querySelector('#menuPanel');
  const isOpen = panel.classList.toggle('open');
  document.querySelector('#menuButton').setAttribute('aria-expanded', isOpen);
});
document.querySelector('#historyLink').addEventListener('click', () => { historySection.hidden = false; renderHistory(); document.querySelector('#menuPanel').classList.remove('open'); historySection.scrollIntoView({ behavior: 'smooth' }); });
document.querySelector('#clearHistory').addEventListener('click', () => { localStorage.removeItem('ava-history'); renderHistory(); });
document.querySelector('#closeModal').addEventListener('click', () => { modal.hidden = true; });
document.querySelector('#newAttempt').addEventListener('click', () => { modal.hidden = true; currentQuestion = 0; selections.fill(null); renderQuestion(); updateProgress(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
function renderHistory() { const history = JSON.parse(localStorage.getItem('ava-history') || '[]'); historyList.innerHTML = history.length ? history.map((item) => `<div class="history-item"><span>${item.date}</span><strong>${item.score} / 5</strong></div>`).join('') : '<p class="hint">Aucune tentative pour le moment.</p>'; }

renderQuestion();
updateProgress();
