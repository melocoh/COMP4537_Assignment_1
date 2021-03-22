// DOM Elements
const adminSection = document.getElementById('adminSection');
const studentSection = document.getElementById('studentSection');
const createButton = document.getElementById('createButton');

// Server path
const PATH = "Removed";

// Question counter
let questionNum = 1;

// Create button for administrators
createButton.addEventListener('click', () => {

    const input = document.getElementById('quizName');
    
    if (input.value) {
        console.log(input.value);
        const xhttp = new XMLHttpRequest();
        xhttp.open(
            'POST',
            PATH + '/admin/quizzes',
            true
        );
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({
            name: `${input.value}`
        }));
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const data = JSON.parse(this.responseText);
                console.log(data);
                location.href = `./admin.html?id=${data.insertId}&quizName=${input.value}`;
            }
        };
    } else {
        alert('Invalid Quiz Name');
    }
});

// GET method on load
window.onload = () => {
    const xhttp = new XMLHttpRequest();
    xhttp.open(
        'GET',
        PATH + '/admin/quizzes',
        true
    );
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const quizzes = JSON.parse(this.responseText);
            console.log(quizzes);

            // if there are no quizzes
            if (quizzes.length === 0) {
                adminSection.innerHTML += '<h3>No quizzes available. Make a new one. <h3>';
            }

            generateQuizzes(quizzes);
        }
    };
};

// Generates quizzes for admin and student
function generateQuizzes(quizzes){

    // for each quiz in the quizzes object
    for (let quiz of quizzes) {

        // Admin DOM elements
        const adminQuestionDiv = document.createElement('div');
        const adminQuestionBody = document.createElement('div');
        adminQuestionBody.innerHTML = `<a href="./admin.html?id=${quiz.quizId}&quizName=${quiz.name}"><h5 class="card-title">Quiz ${questionNum} : ${quiz.name}</h5></a>`;
        adminSection.appendChild(adminQuestionDiv);
        adminQuestionDiv.appendChild(adminQuestionBody);
        adminQuestionDiv.classList.add('card');
        adminQuestionDiv.classList.add('col-10');
        adminQuestionDiv.classList.add('mt-1');
        adminQuestionBody.classList.add('card-body');

        // Student DOM elements
        const studentQuestionDiv = document.createElement('div');
        const studentQuestionBody = document.createElement('div');
        studentQuestionBody.innerHTML = `<a href="./student.html?id=${quiz.quizId}&quizName=${quiz.name}"><h5 class="card-title">Quiz ${questionNum++} : ${quiz.name}</h5></a>`;
        studentSection.appendChild(studentQuestionDiv);
        studentQuestionDiv.appendChild(studentQuestionBody);
        studentQuestionDiv.classList.add('card');
        studentQuestionDiv.classList.add('col-10');
        studentQuestionDiv.classList.add('mt-1');
        studentQuestionBody.classList.add('card-body');
    }
}