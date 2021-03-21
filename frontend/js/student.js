const container = document.getElementsByClassName('container')[0];
const answerKey = [];
const btnSubmit = document.getElementById('btnSubmit');

// windows load
window.onload = function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const quizName = urlParams.get('quizName');
    const header = document.createElement('h1');
    header.innerHTML = quizName;
    document.getElementsByClassName('container')[0].appendChild(header);

    const xhttp = new XMLHttpRequest();
    xhttp.open(
        'GET',
        `https://melody-oh-server.herokuapp.com/student/quizzes/questions/${urlParams.get('id')}`,
        true
    );
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const questions = JSON.parse(this.responseText);
            let prevQuestionId = 0;
            let counter = 1;
            if (questions.length === 0) {
                document.getElementsByClassName('container')[0].innerHTML +=
                    '<h3>No question</h3>';
            }

            console.log(questions);
            for (let question of questions) {

                // if the questionId is unique
                if (prevQuestionId != question.questionId) {
                    const newQuestion = document.createElement('div');
                    const questionNumber = document.createElement('h3');
                    questionNumber.innerHTML = 'Q.' + counter + ' ' + question.questionBody;

                    newQuestion.classList.add('card');
                    newQuestion.classList.add('p-5');
                    container.appendChild(newQuestion);
                    newQuestion.appendChild(questionNumber);

                    prevQuestionId = question.questionId;
                    counter++;
                }

                const forms = document.getElementsByClassName('card');
                const form = forms[forms.length - 1];
                const newFormChecker = document.createElement('div');
                const checker = document.createElement('input');
                const label = document.createElement('label');

                newFormChecker.classList.add('form-check');
                checker.id = question.choiceId;
                checker.setAttribute('type', 'radio');
                checker.setAttribute('name', `${question.questionId}`);
                checker.setAttribute('value', `${question.choiceId}`);
                checker.classList.add('form-check-input');
                label.classList.add('form-check-label');

                label.innerHTML = question.choiceBody;
                form.appendChild(newFormChecker);
                newFormChecker.appendChild(checker);
                newFormChecker.appendChild(label);

                if (question.isCorrect == 1) {
                    answerKey.push(question.choiceId);
                }
            }
            console.log(answerKey);
        }
    };
};

// Submit button
btnSubmit.addEventListener('click', () => {
    const cards = document.getElementsByClassName('card');
    const total = cards.length;
    let right = 0;
    for (let card of cards) {
        const answers = card.getElementsByClassName('form-check-input');
        for (let answer of answers) {
            if (answer.checked) {
                if (answerKey.includes(parseInt(answer.id))) {
                    right++;
                }
            }
        }
    }
    alert(`Your grade is ${Math.round((right / total) * 10000) / 100}%`);
});

// Back button
document.getElementById('back').addEventListener('click', () => {
    window.history.back();
});