// DOM Elements
const container = document.getElementsByClassName('container')[0];
container.classList.add("text-center");
const submitButton = document.getElementById('submitButton');
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizName = urlParams.get('quizName');
const title = document.createElement('h1');
title.innerHTML = 'Quiz: ' + quizName;
document.getElementsByClassName('container')[0].appendChild(title);

// Server path
const PATH = "Removed";

// List of answers
const answerList = [];

// Question counter
let questionNum = 1;

// Initializes previous question tracker
let prevQuestion = 0;

// Keeps track of student score
let correctScore = 0;

// Submit button for students
submitButton.addEventListener('click', () => {

    const questionDiv = document.getElementsByClassName('card');
    const questionTotal = questionDiv.length;

    // Checks every questions
    for (let question of questionDiv) {
        const answers = question.getElementsByClassName('form-check-input');

        // Finds all the answers
        for (let answer of answers) {

            // If the correct answer is ticked
            if (answer.checked) {

                // Increment score
                if (answerList.includes(parseInt(answer.id))) {
                    correctScore++;
                }
            }
        }
    }

    // Sends result to the user
    alert(`Your score is ${Math.round((correctScore / questionTotal) * 10000) / 100}%`);
});

// Back button that takes you to index
document.getElementById('back').addEventListener('click', () => {
    location.href = 'index.html';
});

// GET method on load
window.onload = () => {
    const xhttp = new XMLHttpRequest();
    xhttp.open(
        'GET',
        PATH + `/student/quizzes/questions/${urlParams.get('id')}`,
        true
    );
    xhttp.send();
    xhttp.onreadystatechange = function () {

        // On success
        if (this.readyState == 4 && this.status == 200) {

            // parses all the questions
            const quizQuestions = JSON.parse(this.responseText);

            generateQuestions(quizQuestions);
        }
    };
};

// Generates the questions for the specific quiz
function generateQuestions(quizQuestions) {

    // If no questions are in the database, displays message
    if (quizQuestions.length === 0) {
        document.getElementsByClassName('container')[0].innerHTML +=
            '<h3>No questions available for this quiz</h3>';
    }

    // For every questions in the database
    for (let question of quizQuestions) {

        // If the questionId is unique
        if (prevQuestion != question.questionId) {

            // Increments the question number
            questionNum++;

            // Tracks the previous questions
            prevQuestion = question.questionId;

            // Sets DOM elements for question div and content
            const questionDiv = document.createElement('div');
            const questionTitle = document.createElement('h3');
            questionTitle.innerHTML = 'Question ' + questionNum + ': <br>' + question.questionBody;

            // Sets bootstrap styling elements
            questionDiv.classList.add('card');
            questionDiv.classList.add('m-3');
            questionDiv.classList.add('p-5');
            container.appendChild(questionDiv);
            questionDiv.appendChild(questionTitle);
        }

        // Sets DOM elements for question div and content
        const choiceDiv = document.getElementsByClassName('card');
        const form = choiceDiv[choiceDiv.length - 1];
        const choiceInputForm = document.createElement('div');
        const radioInput = document.createElement('input');
        const choiceText = document.createElement('label');

        // Sets bootstrap styling elements
        choiceInputForm.classList.add('form-check');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', `${question.questionId}`);
        radioInput.setAttribute('value', `${question.choiceId}`);
        radioInput.classList.add('form-check-input');
        choiceText.classList.add('form-check-label');

        // Sets choices from db
        radioInput.id = question.choiceId;
        choiceText.innerHTML = question.choiceBody;

        // Appends DOM elements
        form.appendChild(choiceInputForm);
        choiceInputForm.appendChild(radioInput);
        choiceInputForm.appendChild(choiceText);

        // Pushes correct choices are pushed into the answer list
        if (question.isCorrect == 1) {
            answerList.push(question.choiceId);
        }
    }
}