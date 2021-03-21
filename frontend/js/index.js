const adminSection = document.getElementById('adminSection');
const studentSection = document.getElementById('studentSection');
const btnCreate = document.getElementById('btnCreate');

window.onload = () => {
    const xhttp = new XMLHttpRequest();
    xhttp.open(
        'GET',
        'https://melody-oh-server.herokuapp.com/admin/quizzes',
        true
    );
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const quizzes = JSON.parse(this.responseText);
            console.log(quizzes);

            // if there are no quizzes
            if (quizzes.length === 0) {
                adminSection.innerHTML += '<h3>No quizzes<h3>';
            }

            let i = 1;

            // for each quiz in the quizzes object
            for (let quiz of quizzes) {

                // Admin card elements
                const adminCard = document.createElement('div');
                const adminCardBody = document.createElement('div');
                adminCardBody.innerHTML = `<a href="./admin.html?id=${quiz.quizId}&quizName=${quiz.name}"><h5 class="card-title">Quiz ${i} : ${quiz.name}</h5></a>`;
                adminSection.appendChild(adminCard);
                adminCard.appendChild(adminCardBody);
                adminCard.classList.add('card');
                adminCard.classList.add('col-10');
                adminCard.classList.add('mt-1');
                adminCardBody.classList.add('card-body');

                // Student card elements
                const studentCard = document.createElement('div');
                const studentCardBody = document.createElement('div');
                studentCardBody.innerHTML = `<a href="./student.html?id=${quiz.quizId}&quizName=${quiz.name}"><h5 class="card-title">Quiz ${i++} : ${quiz.name}</h5></a>`;
                studentSection.appendChild(studentCard);
                studentCard.appendChild(studentCardBody);
                studentCard.classList.add('card');
                studentCard.classList.add('col-10');
                studentCard.classList.add('mt-1');
                studentCardBody.classList.add('card-body');
            }
        }
    };
};

btnCreate.addEventListener('click', () => {

    const input = document.getElementById('quizName');
    
    if (input.value) {
        console.log(input.value);
        const xhttp = new XMLHttpRequest();
        xhttp.open(
            'POST',
            'https://melody-oh-server.herokuapp.com/quizzes',
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