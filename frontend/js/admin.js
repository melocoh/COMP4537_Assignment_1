// DOM Elements
const container = document.getElementsByClassName('container')[0];
let postButton;

// Question counter
let questionNum = 1;

// Default quizId for undefined elements
let quizId = -1;

// Server path
const PATH = "http://localhost:9999";

// Back button that takes you to index
document.getElementById('back').addEventListener('click', () => {
  location.href = 'index.html';
});

// newQuestion object to send to the server
const newQuestion = (questionBody = '', questionId, choice = [], quizId = null) => {
  return {
    questionBody,
    questionId,
    quizId,
    choices: choice
  };
};

// newChoice object to send to the server
const newChoice = (choiceBody, isCorrect, choiceId) => {
  return {
    choiceBody: choiceBody,
    isCorrect: isCorrect,
    choiceId: choiceId,
  };
}

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

// Create question
const generateQuestions = (questionObj, inEditMode = false) => {

  // Questions object 
  let question = {};

  // Array that keeps track of user inputs
  let inputs = [];

  // array of choice DOM elements
  let choiceElements = [];

  // Create Question form elements
  const questionDiv = document.createElement('div');
  const questionContainer = document.createElement('div');
  const questionNumLabel = document.createElement('choiceText');
  const questionInput = document.createElement('input');
  const editButton = document.createElement('button');
  const addChoiceButton = document.createElement('button');
  const removeChoiceButton = document.createElement('button');

  // Sets attribute for the input elements
  questionInput.setAttribute('type', 'text');
  questionInput.setAttribute('value', `${questionObj.questionBody}`);
  questionInput.setAttribute('placeholder', `write a question`);
  editButton.setAttribute('value', 'Edit');
  addChoiceButton.setAttribute('value', 'AddChoice');
  removeChoiceButton.setAttribute('value', 'RemoveChoice');

  // Sets bootsrap styling elements
  questionDiv.classList.add('card');
  questionDiv.classList.add('p-5');
  questionDiv.classList.add('row');
  questionDiv.classList.add('form-group');
  questionNumLabel.classList.add('col-m-2');
  questionNumLabel.classList.add('col-form-choiceText');
  questionContainer.classList.add('col-sm-10');
  questionInput.classList.add('form-control');
  addChoiceButton.classList.add('btn');
  addChoiceButton.classList.add('btn-success');
  addChoiceButton.classList.add('mt-3');
  addChoiceButton.innerHTML = 'Add Choice';
  removeChoiceButton.classList.add('btn');
  removeChoiceButton.classList.add('btn-success');
  removeChoiceButton.classList.add('mt-3');
  removeChoiceButton.innerHTML = 'Remove Choice';

  // Appends containers, form, input etc.
  container.appendChild(questionDiv);
  questionDiv.appendChild(questionNumLabel);
  questionDiv.appendChild(questionContainer);
  questionDiv.appendChild(addChoiceButton);
  questionDiv.appendChild(removeChoiceButton);
  questionContainer.appendChild(questionInput);

  // Sets Title in the divs
  if (inEditMode) {
    addChoiceButton.disabled = true;
    removeChoiceButton.disabled = true;
    questionNumLabel.innerHTML = 'Question ' + questionNum + " :";
  } else { // Unless it's the create question form
    questionNumLabel.innerHTML = 'Create New Question';
  }

  // Pushes input from the form into an array
  inputs.push(questionInput);

  // Sets id of the divs to questionId
  questionDiv.id = questionObj.questionId;

  // Remote form for choices
  for (let i = 0; i < questionObj.choices.length; i++) {

    // 
    const choiceInputForm = document.createElement('div');
    const radioInput = document.createElement('input');
    const choiceText = document.createElement('input');
    inputs.push(radioInput);
    inputs.push(choiceText);
    choiceElements[i] = {};
    choiceElements[i]['choiceBody'] = choiceText;
    choiceElements[i]['isCorrect'] = radioInput;
    choiceElements[i]['choiceId'] = questionObj.choices[i].choiceId;

    choiceInputForm.classList.add('form-check');

    // while in edit mode, it disables radioInput and choiceText editing
    if (inEditMode) {
      radioInput.disabled = true;
      choiceText.disabled = true;
    }

    // sets the attribute for the input to radio buttons
    radioInput.setAttribute('type', 'radio');
    radioInput.setAttribute('name', 'radio' + `${questionNum}`);
    radioInput.classList.add('form-check-input');
    choiceInputForm.classList.add('mt-3');
    choiceText.setAttribute('type', 'text');
    choiceText.classList.add('choices');

    // if a choice exists
    if (questionObj.choices[i]) {

      // sets boolean true if the remote buttons are checked
      choiceText.setAttribute('value', `${questionObj.choices[i].choiceBody}`);
      if (questionObj.choices[i].isCorrect == 1) {
        radioInput.checked = true;
      }
    }

    // Appends DOM elements
    questionDiv.appendChild(choiceInputForm);
    choiceInputForm.appendChild(radioInput);
    choiceInputForm.appendChild(choiceText);

    // Sets the id of the choiceText to choiceId
    if (inEditMode) {
      if (questionObj.choices[i]) {
        choiceText.id = questionObj.choices[i].choiceId;
      }
    }
  }

  // Takes Choice data and pushes it into array
  let getChoicesData = () => {
    let data = [];
    for (let i = 0; i < choiceElements.length; i++) {
      let obj = newChoice(choiceElements[i]['choiceBody'].value, choiceElements[i]['isCorrect'].checked, choiceElements[i]['choiceId']);
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
    questionDiv.appendChild(editButton);
    questionDiv.classList.add('not-edit');

    editButton.addEventListener('click', () => {
      console.log('testing inedit');

      addChoiceButton.disabled = false;
      removeChoiceButton.disabled = false;

      if (!editButton.notupdating) {
        for (let input of inputs) {
          input.disabled = false;
          questionDiv.classList.add('edited');
          questionDiv.classList.remove('not-edit');
        }
        editButton.innerText = 'update';
      } else {

        const updatedQuestion = {
          choices: []
        };
        updatedQuestion["questionBody"] = questionInput.value;
        updatedQuestion["questionId"] = questionObj.questionId;
        updatedQuestion["quizId"] = quizId;
        let i = 0;
        for (let input of questionDiv.getElementsByClassName('form-check')) {
          console.log(i++);
          updatedQuestion.choices.push({
            choiceBody: input.getElementsByTagName('input')[1].value,
            isCorrect: input.getElementsByTagName('input')[0].checked ? true : false,
            choiceId: input.getElementsByTagName('input')[1].id
          })
        }
        console.log(updatedQuestion);

        if (!isValidQuestion(updatedQuestion)) {
          alert('No blank choices are allowed. There must be a correct answer selected.')
          return;
        }

        putQuestion(updatedQuestion);

        addChoiceButton.disabled = true;
        removeChoiceButton.disabled = true;

        for (let input of inputs) {
          input.disabled = true;
          questionDiv.classList.add('edited');
          questionDiv.classList.remove('not-edit');
        }
        editButton.innerText = 'edit';
      }
      editButton.notupdating = !editButton.notupdating
    });
  } else { // Not edit mode
    editButton.classList.add('btn');
    editButton.classList.add('btn-success');
    editButton.classList.add('mt-3');
    editButton.innerHTML = 'post question';
    questionDiv.appendChild(editButton);
    questionDiv.classList.add('not-edit');
    console.log('loaded post button');
    editButton.id = 'postbutton';

    editButton.addEventListener('click', () => {
      alert('do post function');

      question['questionBody'] = questionInput.value;
      question['questionId'] = questionObj.questionId;
      question['quizId'] = quizId;
      question['choices'] = getChoicesData();

      if (!isValidQuestion(question)) {
        alert('No blank choices are allowed. There must be a correct answer selected.')
        return;
      }

      postQuestion(question);
    })
  }

  // Add choice option
  addChoiceButton.addEventListener("click", () => {
    const inputs = questionDiv.getElementsByClassName("form-check");
    if (inputs.length >= 4 && !inputs[inputs.length - 1].className.includes('hidden')) {
      return;
    }
    if (inputs[inputs.length - 2].className.includes('hidden')) {
      inputs[inputs.length - 2].style.visibility = "visible";
      inputs[inputs.length - 2].classList.remove("hidden");
      return;
    }

    if (inputs[inputs.length - 1].className.includes('hidden')) {
      inputs[inputs.length - 1].style.visibility = "visible";
      inputs[inputs.length - 1].classList.remove("hidden");
      return;
    }
    const newInputDiv = document.createElement("div");
    const newRadio = document.createElement("input");
    const newInput = document.createElement("input");

    // QuestionDiv
    newInputDiv.classList.add("form-check");
    newInputDiv.classList.add("mt-3");
    newRadio.setAttribute("type", "radio");
    newRadio.setAttribute(
      "name",
      questionDiv.getElementsByClassName("form-check-input")[0].name
    );
    newRadio.classList.add("form-check-input");

    newInput.setAttribute("type", "text");
    newInput.classList.add("choices");

    newInputDiv.appendChild(newRadio);
    newInputDiv.appendChild(newInput);
    inputs[inputs.length - 1].parentNode.insertBefore(
      newInputDiv,
      inputs[inputs.length - 1].nextSibling
    );
  });

  // Remove choice option
  removeChoiceButton.addEventListener("click", () => {
    const inputs = questionDiv.getElementsByClassName("form-check");
    const lastInput = inputs[inputs.length - 1];
    if (lastInput.className.includes('hidden')) {
      inputs[inputs.length - 2].style.visibility = "hidden";
      inputs[inputs.length - 2].classList.add("hidden");
      inputs[inputs.length - 2].getElementsByTagName('input')[1].value = ''
    }
    lastInput.style.visibility = "hidden";
    lastInput.classList.add("hidden");
    lastInput.getElementsByTagName('input')[1].value = ''

  });

  // Increments question number
  if (inEditMode)
    questionNum++;
};

// Creates a new question and set of choices by using the POST method
function postQuestion(question) {
  const xhttp = new XMLHttpRequest();
  xhttp.open(
    'POST',
    PATH + '/admin/questions',
    true
  );
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify(question));
  console.log(question);
  xhttp.onreadystatechange = function () {

    // Successful connection
    if (this.readyState == 4 && this.status == 200) {
      
      // create question
      let res = JSON.parse(this.response);
      let questionId = res.question.insertId;
      let choices = [];
      console.log(res.choices);
      for (let i = 0; i < res.choices.affectedRows; i++) {
        choices[i] = newChoice(question.choices[i].choiceBody, question.choices[i].isCorrect, res.choices.insertId + i);
      }
      console.log(newQuestion(question.questionBody, questionId, choices, quizId))
      generateQuestions(newQuestion(question.questionBody, questionId, choices, quizId), true);
    }
    location.reload();
  };
}

// Updates questions and choices by using the PUT function
function putQuestion(question) {

  alert('do update function')

  const xhttp = new XMLHttpRequest();
  xhttp.open(
    'PUT',
    PATH + '/admin/questions',
    true
  );
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify(question));
  console.log(question);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      let res = JSON.parse(this.response);

      console.log(this.response)

      let choices = [];
      console.log(res.choices);
      for (let i = 0; i < res.choices.affectedRows; i++) {
        choices[i] = newChoice(question.choices[i].choiceBody, question.choices[i].isCorrect, res.choices.insertId + i);
      }
    }
  }
  location.reload();
}

// Turns choices array into an object of choices for each question
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

// Grabs choices that are specific to the question
function getSpecChoices(questions) {

  console.log("Getting choices");
  const xhttp = new XMLHttpRequest();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  xhttp.open(
    'GET',
    PATH + `/admin/quizzes/questions/${urlParams.get('id')}/choices`,
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
          '<h3>No questions available for this quiz</h3>';
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

// Gets all the questions for the specific quiz
function getQuestions() {
  console.log("Getting questions");
  const xhttp = new XMLHttpRequest();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  xhttp.open(
    'GET',
    PATH + `/admin/quizzes/questions/${urlParams.get('id')}`,
    true
  );
  xhttp.send();
  xhttp.onreadystatechange = function () {
    // successful connection
    if (this.readyState == 4 && this.status == 200) {
      const questions = JSON.parse(this.responseText);

      if (questions.length === 0) {
        document.getElementsByClassName('container')[0].innerHTML +=
          '<h3>No questions available for this quiz. Create a new one.</h3>';
      }
      getSpecChoices(questions);
    }
  };
}

// Displays the questions in the DOM
function buildQuestions(questions) {
  console.log(questions);

  for (let question of questions) {
    generateQuestions(question, true);
  }
}

// Gets the user input from the choices and stores
// it in to manageable json array
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

// Windows load
function load() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const quizName = urlParams.get('quizName');
  quizId = parseInt(urlParams.get('id'));
  const header = document.createElement('h1');
  header.innerHTML = quizName;
  document.getElementsByClassName('container')[0].appendChild(header);
  generateQuestions(newQuestion('', -1, [newChoice('', false, -1), newChoice('', false, -1), newChoice('', false, -1), newChoice('', false, -1)]), false);
  postButton = document.getElementById('postButton');
  getQuestions();
};