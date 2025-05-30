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
 {
    question: "Which city is called as start-up capital of the world?",
    answers: ["Los Angles", "New York", "Las Vegas", "San Francisco"],
    correct: 3
  },
  {
    question: "Name the parent company of Google?",
    answers: ["Black Rock", "Alphabet Co", "Yahoo"],
    correct: 1
  },
  {
    question: "This man started life interning as a financial analyst for the Bank of Nova Scotia. He has claimed that he will one day “build an intelligent car capable of not believing in God”. Who is he?",
    answers: ["Jeff Bezos", "Tim Cook", "Tom Hardy", "Elon Musk"],
    correct: 3
  },
  {
    question: "In 2023, which country hosted G20?",
    answers: ["India", "France", "US"],
    correct: 0
  },
  {
    question: "What is the currency of the Philippines?",
    answers: ["Philippine peso", "Philippine ringgits", "Philippine Dollar"],
    correct: 0
  },
  {
    question: "What are the different ways you can fund your startup business?",
    answers: ["Through Own Capital", "Through Family and Friends", "Through Corporate Credits and Bank Loans", "All of the above"],
    correct: 3
  },
  {
    question: "In India, a startup business or a company can be registered as:",
    answers: ["A Firm", "A Temporary Business", "A LLP (Limited Liability Partnership)", "A Company"],
    correct: 2
  },
  {
    question: "Identify the logo",
    image: "https://github.com/Tarun16704/Tarun16704.github.io/blob/main/kodak.jpg?raw=true",
    answers: ["Koach", "Sony", "Samsung", "Kodak"],
    correct: 3
  },
  {
    question: "Expand PVR",
    answers: ["Priyanka Village Roadshow", "Priya Village Roadshow", "PVR Only"],
    correct: 1
  },
  {
    question: "Is Tesla company releasing a cell phone?",
    answers: ["True", "False"],
    correct: 1
  },
  {
    question: "Identify the founder",
    image: "https://github.com/Tarun16704/Tarun16704.github.io/blob/main/pixar.jpg?raw=true",
    answers: ["Steve Jobs", "Jeff Bezos", "Elon Musk"],
    correct: 0
  },
  {
    question: "“Think Outside the Bun” is a slogan of which company?",
    answers: ["Burger King", "Mc Donald’s", "Taco Bell"],
    correct: 2
  },
  {
    question: "“Think Big” is a slogan of which company?",
    answers: ["IMAX", "Apple", "Google"],
    correct: 0
  },
  {
    question: "“Quality never goes out of style.” is a slogan of which brand?",
    answers: ["H & M", "Trends", "Levi's"],
    correct: 2
  },
  {
    question: "Name the founder of Ali Baba.",
    answers: ["Steve Jobs", "Larry Page", "Jack Ma"],
    correct: 2
  },
  {
    question: "Parent company of Realme phones?",
    answers: ["Sony", "One Plus", "BBK electronics"],
    correct: 2
  },
  {
    question: "Name the country where the HQ of Puma Company is located.",
    answers: ["US", "Poland", "Germany"],
    correct: 2
  },
  {
    question: "'X' is an Indian biomaterials startup co-founded by Ankit Agarwal and Prateek Kumar in 2017 to collect temple flower waste and create products. Identify 'X'.",
    answers: ["Ewaste Hub", "Biffa", "Phool"],
    correct: 2
  },
  {
    question: "Identify the person",
    image: "https://github.com/Tarun16704/Tarun16704.github.io/blob/main/nithin.jpg?raw=true", // Assuming such an image is hosted, you might want to verify or use local images
    answers: ["Nithin Kamath", "Bhavish Aggarwal", "Piyush Bansal"],
    correct: 0
  },
  {
    question: "Identify the logo",
    image: "https://github.com/Tarun16704/Tarun16704.github.io/blob/main/sams.jpg?raw=true",
    answers: ["Samsung", "Apple", "Tissot"],
    correct: 0
  }
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
        ${question.image ? `<img src="${question.image}" alt="Logo" style="max-width: 150px; margin: 10px 0;" />` : ''}
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
