import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLnNRHR6PaTu8kKaWUQxfJjC26kfRxhC4",
  authDomain: "quizze-brainax.firebaseapp.com",
  projectId: "quizze-brainax",
  storageBucket: "quizze-brainax.appspot.com",
  messagingSenderId: "341347775571",
  appId: "1:341347775571:web:2f767dcd60ffa36d3f82a6",
  measurementId: "G-K0YJCQ2D61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const rulesContainer = document.getElementById('rules-container');
const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const timerElement = document.getElementById('time');
const resultContainer = document.getElementById('result-container');
const resultElement = document.getElementById('result');

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;
let teamNumber = "";
let teamName = "";
let startTime;
let endTime;

const questions = [
    { question: "What is 2 + 2?", answers: ["3", "4", "5", "6"], correct: 1 },
    { question: "What is 3 + 3?", answers: ["5", "6", "7", "8"], correct: 1 },
    { question: "In the context of databases, what does ACID stand for?", answers: ["Atomicity, Consistency, Isolation, Durability", "Automated, Complex, Independent, Deterministic", "Asynchronous, Concurrency, Integrity, Data", "Atomic, Consistent, Independent, Durable"], correct: 0 },
    { question: "What is the key difference between final, finally, and finalize in Java?", answers: ["final is a keyword, finally is a block, and finalize is a method.", "final is a method, finally is a keyword, and finalize is a class.", "final is used for error handling, finally ensures termination, and finalize prevents memory leaks.", "final and finally are synonyms, finalize is for performance optimization."], correct: 0 },
    { question: "Which of the following sorting algorithms has an average time complexity of O(n log n) and is not based on comparison?", answers: ["Merge Sort", "Heap Sort", "Quick Sort", "Radix Sort"], correct: 3 },
   
];

window.start = function () {
    rulesContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    teamName = document.getElementById('tname').value.trim();
    if (!teamName) {
        alert("Please enter a valid Team Name");
        return;
    }
    teamNumber = document.getElementById('Team-no').value.trim();
    if (!teamNumber) {
        alert("Please enter a valid Team Number");
        return;
    }
    loginContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    startTime = Date.now();
    startQuiz();
});

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showQuestion(questions[currentQuestionIndex]);
    startTimer();
}

function showQuestion(question) {
    questionContainer.innerHTML = `
        <p>${question.question}</p>
        ${question.answers.map((answer, index) => `<button onclick="selectAnswer(${index})">${answer}</button>`).join('')}
    `;
}

window.selectAnswer = function (index) {
    if (index === questions[currentQuestionIndex].correct) {
        score++;
    }
    clearInterval(timer);
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
        startTimer();
    } else {
        endTime = Date.now();
        showResults();
    }
};

function startTimer() {
    timeLeft = 20;
    timerElement.textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                showQuestion(questions[currentQuestionIndex]);
                startTimer();
            } else {
                endTime = Date.now();
                showResults();
            }
        }
    }, 1000);
}

let resultsSaved = false; // Flag to prevent duplicate saves

async function showResults() {
    if (resultsSaved) return; // Prevent multiple saves
    resultsSaved = true; // Set flag to true

    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    let totalTimeMs = endTime - startTime; // Total time in milliseconds
    let totalTimeSeconds = Math.floor(totalTimeMs / 1000);
    let minutes = Math.floor(totalTimeSeconds / 60);
    let seconds = totalTimeSeconds % 60;
    let milliseconds = totalTimeMs % 1000;
    let formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`; // mm:ss.xxx

    resultElement.textContent = `You scored ${score} out of ${questions.length} in ${formattedTime}`;

    try {
        await addDoc(collection(db, "quizResults"), {
            teamName: teamName,
            teamNumber: teamNumber,
            score: score,
            totalTime: formattedTime, // Formatted time (mm:ss.xxx)
            totalMilliseconds: totalTimeMs, // Store raw milliseconds
            date: new Date().toISOString()
        });
        console.log("Result saved successfully with milliseconds!");
    } catch (e) {
        console.error("Error saving result: ", e);
    }
}


document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        timeLeft = 0; // Instantly set timer to 0
        clearInterval(timer);
        timerElement.textContent = timeLeft;
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
            startTimer();
        } else {
            endTime = Date.now();
            showResults();
        }
    }
});
