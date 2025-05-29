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
let timeLeft = 30;
let teamNumber = "";
let teamName = "";
let startTime;
let endTime;

const questions = [
    { question: "What is the maximum transmission unit (MTU) for Ethernet networks? ", answers: ["512 bytes", "1024 bytes", "1500 bytes", "2048 bytes"], correct: 2 },
    { question: "Which of the following is NOT a characteristic of IPv6?", answers: ["Supports longer addresses than IPv4", "Uses 128-bit addressing", "Provides built-in security features", "Is fundamentally incompatible with IPv4"], correct: 3 },
    { question: "Which of the following isolation levels prevents dirty reads but allows non-repeatable reads?", answers: ["Read Uncommitted", "Read Committed ", "Repeatable Read", "Serializable"], correct: 1 },
    { question: "What is the output of the following C++ program? int x = 5;cout << x + 5;", answers: ["55", "10", "5", "Error"], correct: 1 },
    { question: "Which of these programming languages is primarily used for developing iOS applications?", answers: ["Kotlin", "Swift", "Java", "C++"], correct: 1 },
    { question: "What is the default subnet mask for a Class C IP address?", answers: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"], correct: 2 },
    { question: "Which command is used to test the connectivity between two network devices?", answers: ["ipconfig", "ping", "tracert", "netstat"], correct: 1 },
    { question: "Which SQL statement is used to retrieve data from a database?", answers: ["SELECT", "INSERT", "UPDATE", "DELETE"], correct: 0 },
    { question: "What is the primary goal of cybersecurity?", answers: ["To build new software", "To protect information and systems from cyber threats", "To create user-friendly interfaces", "To increase internet speed"], correct: 1 },
    { question: "Which of the following is a type of attack where an attacker intercepts communication between two parties to steal or alter data?", answers: ["Phishing", "Man-in-the-Middle (MitM) attack", "Denial of Service (DoS) attack", "SQL Injection"], correct: 1 },
    { question: "Which algorithm is commonly used for classification problems in machine learning?", answers: ["K-means Clustering", "Linear Regression", "Decision Tree", "Principal Component Analysis"], correct: 2 },
    { question: "Which AI technique is commonly used for machine translation and language modeling?", answers: ["Convolutional Neural Networks (CNNs)", "Recurrent Neural Networks (RNNs)", "Decision Trees", "Linear Regression"], correct: 1 },
    { question: "Which of the following is a correct way to create a Python class?", answers: ["class MyClass: pass", "def MyClass(): pass", "create class MyClass: pass", "class MyClass[] pass"], correct: 0 },
    { question: "What layer of the OSI model does the TCP protocol operate at?", answers: ["Application Layer", "Data Link Layer", "Network Layer", "Transport Layer"], correct: 3 },
    { question: "In Python, which of the following function is used to get the ASCII value of a character?", answers: ["ord()", "ascii()", "char()", "chr()"], correct: 0 },
    { question: "In C#, what is the purpose of the using statement?", answers: ["To include namespaces", "To declare a variable", "To handle resource cleanup", "To create an alias for a namespace"], correct: 2 },
    { question: "What is the function of a primary key in a database table?", answers: ["To allow duplicate values", "To store large binary objects", "To link to a foreign key", "To uniquely identify each record"], correct: 3 },
    { question: "Which protocol is used to retrieve emails from a mail server?", answers: ["HTTP", "SMTP", "IMAP", "SNMP"], correct: 2 },
    { question: "Which protocol is used for secure communication over the internet by encrypting data packets?", answers: ["HTTP", "FTP", "SSL/TLS", "SNMP"], correct: 2 },
    { question: "What is a zero-day vulnerability?", answers: ["A bug that is fixed within 24 hours", "A vulnerability that is publicly known but not yet patched", "A vulnerability that is discovered and exploited on the same day", "A type of malware that acts immediately"], correct: 2 },
    
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

function loadNextQuestion() {
    let questionContainer = document.getElementById("question-container");

    // Add fade-out effect
    questionContainer.classList.add("fade-out");

    setTimeout(() => {
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
            startTimer();
        } else {
            endTime = Date.now();
            showResults();
        }

        // Add fade-in effect
        questionContainer.classList.remove("fade-out");
        questionContainer.classList.add("fade-in");

        setTimeout(() => {
            questionContainer.classList.remove("fade-in"); // Remove after animation
        }, 300); // Matches CSS transition time
    }, 300); // Delay matches CSS transition time (0.3s)
}

function showQuestion(question) {
    let questionContainer = document.getElementById("question-container");
    questionContainer.innerHTML = `
        <p>${question.question}</p>
        ${question.answers.map((answer, index) => `
            <button class="option-btn" onclick="selectAnswer(${index})">${answer}</button>
        `).join('')}
    `;
}

window.selectAnswer = function (index) {
    let buttons = document.querySelectorAll('.option-btn');

    // Disable all buttons to prevent multiple clicks
    buttons.forEach(btn => btn.disabled = true);

    if (index === questions[currentQuestionIndex].correct) {
        score++;
    }

    clearInterval(timer);
    currentQuestionIndex++;

    // Add visual feedback before transitioning
    setTimeout(() => {
        loadNextQuestion();
    }, 500); // Short delay to show user feedback before moving on
};
function startTimer() {
    timeLeft = 30;
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
