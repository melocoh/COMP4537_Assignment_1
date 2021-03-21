const container = document.getElementsByClassName('container')[0];
const btnAdd = document.getElementById('btnAdd');
const btnSave = document.getElementById('btnSave');
let postBtn;
let questionsContainer = [];
let questionCounter = 1;
let quizId = -1;

// Create question
const createQuestion = (q, inEditMode = false) => {

  /**@type {Object} */
  let question = {};

  // Array that keeps track of user inputs
  let inputs = [];

  let choice_elements = [];

  // Create Question form elements
  const questionCard = document.createElement('div');
  const contentContainer = document.createElement('div');
  const questionNumber = document.createElement('label');
  const questionInput = document.createElement('input');
  const editButton = document.createElement('button');

  if (inEditMode)
    questionNumber.innerHTML = 'Q.' + questionCounter;
  else
    questionNumber.innerHTML = 'Create New Question';

  // Pushes input from the form into an array
  inputs.push(questionInput);

  // Sets attribute for the input elements
  questionInput.setAttribute('type', 'text');
  questionInput.setAttribute('value', `${q.questionBody}`);
  questionInput.setAttribute('placeholder', `write a question`);
  editButton.setAttribute('value', 'Edit');
  questionCard.id = q.questionId;

  // Sets boostrap styling elements
  questionCard.classList.add('card');
  questionCard.classList.add('p-5');
  questionCard.classList.add('row');
  questionCard.classList.add('form-group');
  questionNumber.classList.add('col-m-2');
  questionNumber.classList.add('col-form-label');
  contentContainer.classList.add('col-sm-10');
  questionInput.classList.add('form-control');

  // Appends containers, form, input etc.
  container.appendChild(questionCard);
  questionCard.appendChild(questionNumber);
  questionCard.appendChild(contentContainer);
  contentContainer.appendChild(questionInput);

  // Remote form for choices
  for (let i = 0; i < 4; i++) {
    const newFormChecker = document.createElement('div');
    const checker = document.createElement('input');
    const label = document.createElement('input');
    inputs.push(checker);
    inputs.push(label);
    choice_elements[i] = {};
    choice_elements[i]['choiceBody'] = label;
    choice_elements[i]['isCorrect'] = checker;
    choice_elements[i]['choiceId'] = q.choices[i].choiceId;

    newFormChecker.classList.add('form-check');

    // while in edit mode, it disables checker and label editing
    if (inEditMode) {
      checker.disabled = true;
      label.disabled = true;
    }

    // sets the attribute for the input to radio buttons
    checker.setAttribute('type', 'radio');
    checker.setAttribute('name', 'radio' + `${questionCounter}`);
    checker.classList.add('form-check-input');
    newFormChecker.classList.add('mt-3');
    label.setAttribute('type', 'text');
    label.classList.add('choices');

    // if a choice exists
    if (q.choices[i]) {

      // 
      label.setAttribute('value', `${q.choices[i].choiceBody}`);
      if (q.choices[i].isCorrect == 1) {
        checker.checked = true;
      }
    }

    questionCard.appendChild(newFormChecker);
    newFormChecker.appendChild(checker);
    newFormChecker.appendChild(label);

    if (inEditMode) {
      if (q.choices[i]) {
        label.id = q.choices[i].id;
      }
    }
  }

  let getChoicesData = () => {
    let data = [];
    for (let i = 0; i < choice_elements.length; i++) {
      let obj = newChoice(choice_elements[i]['choiceBody'].value, choice_elements[i]['isCorrect'].checked, choice_elements[i]['choiceId']);
      data[i] = obj;
    }
    return data
  }

  // Toggles edit mode
  if (inEditMode) {
    questionInput.disabled = true;
    editButton.classList.add('btn');
    editButton.classList.add('btn-success');
    editButton.classList.add('mt-3');
    editButton.innerHTML = 'edit';
    editButton.notupdating = false;
    questionCard.appendChild(editButton);
    questionCard.classList.add('not-edit');

    editButton.addEventListener('click', () => {
      console.log('testing inedit');
      if (!editButton.notupdating) {
        for (let input of inputs) {
          input.disabled = false;
          questionCard.classList.add('edited');
          questionCard.classList.remove('not-edit');
        }
        editButton.innerText = 'update';
      } else {
        alert('do update function')

        for (let input of inputs) {
          input.disabled = true;
          questionCard.classList.add('edited');
          questionCard.classList.remove('not-edit');
        }
        editButton.innerText = 'edit';
      }
      editButton.notupdating = !editButton.notupdating
    });
  } else {
    editButton.classList.add('btn');
    editButton.classList.add('btn-success');
    editButton.classList.add('mt-3');
    editButton.innerHTML = 'post question';
    questionCard.appendChild(editButton);
    questionCard.classList.add('not-edit');
    console.log('loaded post button');
    editButton.id = 'postbutton';

    editButton.addEventListener('click', () => {
      alert('do post function');

      question['questionBody'] = questionInput.value;
      question['questionId'] = q.questionId;
      question['quizId'] = quizId;
      question['choices'] = getChoicesData();

      postQuestion(question);

    })
  }

  if (inEditMode)
    questionCounter++;
};

function postQuestion(question) {
  const xhttp = new XMLHttpRequest();
  xhttp.open(
    'POST',
    'http://127.0.0.1:9999/admin/questions',
    true
  );
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify(question));
  console.log(question);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // const data = JSON.parse(this.responseText);
      // create question
      console.log();
      let res = JSON.parse(this.response);

      let questionId = res.question.insertId;
      let choices = [];
      console.log(res.choices);
      for (let i = 0; i < res.choices.affectedRows; i++) {
        choices[i] = newChoice(question.choices[i].choiceBody, question.choices[i].isCorrect, res.choices.insertId + i);
      }
      console.log(newQuestion(question.questionBody, questionId, choices, quizId))
      createQuestion(newQuestion(question.questionBody, questionId, choices, quizId), true);
    }
  };
}


function updateQuestion(question) {
  const xhttp = new XMLHttpRequest();
  xhttp.open(
    'PUT',
    'http://127.0.0.1:9999/admin/questions',
    true
  );
  xhttp.setRequestHeader('Content-Type', 'application/json');

  xhttp.send(JSON.stringify(question));
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);
    }
  };
}

const groupBy = (data, key) => {
	return data.reduce((accumulator, item) => {

		const group = item[key];
		
		// This version removes the key from the object
		delete item[key]
		accumulator[group] = accumulator[group] || [];
		accumulator[group].push(item);

		return accumulator;
	}, {});
}

function getSpecChoices(questions) {

  console.log("Getting choices");
  const xhttp = new XMLHttpRequest();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  xhttp.open(
    'GET',
    `http://127.0.0.1:9999/admin/quizzes/questions/${urlParams.get('id')}/choices`,
    true
  );
  xhttp.send();
  xhttp.onreadystatechange = function () {
    // successful connection
    if (this.readyState == 4 && this.status == 200) {
      const choices = groupBy(JSON.parse(this.responseText), 'questionId');

      // if no questions, message appears
      if (choices.length === 0) {
        document.getElementsByClassName('container')[0].innerHTML +=
          '<h3>No question</h3>';
      } else {

        for (let i = 0; i < questions.length; i++) {
          const questionId = questions[i].questionId;
          questions[i].choices = choices[questionId];
        }
        
        buildQuestions(questions);
      }
    }
  };

}


function getQuestions() {

  console.log("Getting questions");
  const xhttp = new XMLHttpRequest();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  xhttp.open(
    'GET',
    `http://127.0.0.1:9999/admin/quizzes/questions/${urlParams.get('id')}`,
    true
  );
  xhttp.send();
  xhttp.onreadystatechange = function () {
    // successful connection
    if (this.readyState == 4 && this.status == 200) {
      const questions = JSON.parse(this.responseText);
      getSpecChoices(questions);
    }
  };
}

function buildQuestions(questions) {
  console.log(questions);
  // for (const key in choices) {
  //   if (Object.hasOwnProperty.call(choices, key)) {
  //     const element = choices[key];
      
  //   }
  // }

}

function getChoices(index) {
  const cards = document.getElementsByClassName('card');
  const formData = {
    questionId: parseInt(card.id),
    choices: [],
  };
  const questionBody = card[index].getElementsByClassName('form-control')[0];
  const checkers = card[index].getElementsByClassName('form-check-input');
  const choices = card[index].getElementsByClassName('choices');

  for (let i = 0; i < 4; i++) {

    if (choices[i].value == '' && !card[index].className.includes('edited')) {
      continue;
    }

    if (choices[i].value == '') {
      continue;
    }

    if (checkers[i].checked) {
      formData.choices.push({
        choiceBody: choices[i].value,
        isCorrect: true,
        choiceId: parseInt(choices[i].id),
      });
    } else {
      formData.choices.push({
        choiceBody: choices[i].value,
        isCorrect: false,
        choiceId: parseInt(choices[i].id),
      });
    }
  }
  formData.questionBody = questionBody.value;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  formData.quizId = urlParams.get('id');

}

// NewQuestion object to send to the server
const newQuestion = (questionBody = '', questionId, choice = [], quizId = null) => {
  return {
    questionBody,
    questionId,
    quizId,
    choices: choice
  };
};

const newChoice = (choiceBody, isCorrect, choiceId) => {
  return {
    choiceBody: choiceBody,
    isCorrect: isCorrect,
    choiceId: choiceId,
  };
}

// Windows load
function load() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const quizName = urlParams.get('quizName');
  quizId = parseInt(urlParams.get('id'));
  const header = document.createElement('h1');
  header.innerHTML = quizName;
  document.getElementsByClassName('container')[0].appendChild(header);
  createQuestion(newQuestion('', -1, [newChoice('', false, -1), newChoice('', false, -1), newChoice('', false, -1), newChoice('', false, -1)]), false);
  postBtn = document.getElementById('postButton');
  getQuestions();
};

// Button event listener that creates a new question
btnAdd.addEventListener('click', (e) => {
  createQuestion(newQuestion(...Array(1), questionCounter, ...Array(1)), true);
});

// Saves all the questions
btnSave.addEventListener('click', (e) => {
  e.preventDefault();

  const cards = document.getElementsByClassName('card');

  const xhttp = new XMLHttpRequest();
  let msg = '';
  let counter = 1;

  for (let card of cards) {
    const formData = {
      questionId: parseInt(card.id),
      choices: [],
    };
    const questionBody = card.getElementsByClassName('form-control')[0];
    const checkers = card.getElementsByClassName('form-check-input');
    const choices = card.getElementsByClassName('choices');

    for (let i = 0; i < 4; i++) {

      if (choices[i].value == '' && !card.className.includes('edited')) {
        continue;
      }

      if (choices[i].value == '') {
        continue;
      }

      if (checkers[i].checked) {
        formData.choices.push({
          choiceBody: choices[i].value,
          isCorrect: true,
          choiceId: parseInt(choices[i].id),
        });
      } else {
        formData.choices.push({
          choiceBody: choices[i].value,
          isCorrect: false,
          choiceId: parseInt(choices[i].id),
        });
      }
    }
    formData.questionBody = questionBody.value;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    formData.quizId = urlParams.get('id');
    if (!isValidQuestion(formData) && !card.className.includes('not-edit')) {
      msg += `Question ${counter++} is not invalid\n`;
    } else if (card.className.includes('edited')) {
      xhttp.open(
        'PUT',
        'http://127.0.0.1:9999/admin/questions',
        true
      );
      xhttp.setRequestHeader('Content-Type', 'application/json');
      console.log(formData);
      xhttp.send(JSON.stringify(formData));
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          const data = JSON.parse(this.responseText);
        }
      };
    } else if (card.className.includes('not-edit')) {
      continue;
    } else {
      xhttp.open(
        'POST',
        'http://127.0.0.1:9999/admin/questions',
        true
      );
      xhttp.setRequestHeader('Content-Type', 'application/json');
      xhttp.send(JSON.stringify(formData));
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          const data = JSON.parse(this.responseText);
        }
      };
    }
  }
  msg += 'Saved';
  alert(msg);
  location.reload();
});

// Checks if the question is valid
function isValidQuestion(question) {
  if (question.questionBody == '') {
    return false;
  }
  for (let choice of question.choices) {
    if (choice.isCorrect && choice.choiceBody !== '') {
      return true;
    }
  }
  return false;
}

document.getElementById('back').addEventListener('click', () => {
  window.history.back();
});