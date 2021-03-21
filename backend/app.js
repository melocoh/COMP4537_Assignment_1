"use strict";

const {
    query
} = require('express');
// Express dependencies
const express = require('express');
const app = express();
app.use(express.json());
const mysql = require("mysql");

// Port connection
const PORT = process.env.PORT || 9999;

// DB Credentials
const con = mysql.createPool({
    host: "us-cdbr-east-03.cleardb.com",
    user: "bdf2f88fb39ca9",
    password: "79001dcf",
    database: "heroku_0f80536d3e66f68",
});

// Request Credentials
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

// Default route
app.get('/', (req, res) => {
    res.send("Welcome to Melody's server for the COMP 4537: Individual Assignment.");
});

// [GET] Selects all queries from Quiz Table for Admins
app.get('/admin/quizzes', (req, res) => {

    const query = `select * from Quizzes`;

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.json(result);
    });
});

// [POST] Inserts data into Quiz Table from Admin
app.post('/admin/quizzes', (req, res) => {

    let name = req.body.name;
    let query = `insert into Quizzes (name) values ("${name}")`;

    console.log(req.body.name);
    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.json(result);
    });
});

// [POST] Inserts data into Question Table from Admin
app.post('/admin/questions', (req, res) => {

    console.log(req.body);

    let quizId = req.body.quizId;
    let questionBody = req.body.questionBody;
    let choices = req.body.choices;
    let totalQuery = {};

    let questionsQuery = `insert into Questions (quizId, questionBody) values ("${quizId}", "${questionBody}")`;

    // commits questions into Questions Table
    con.query(questionsQuery, async (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        // res.json(result);

        totalQuery['question'] = result;
        new Promise((resolve, reject) => {
            totalQuery['choices'] = [];
            let choicesQuery = `insert into Choices (questionId, choiceBody, isCorrect) values("${result.insertId}","${choices[0].choiceBody}", ${choices[0].isCorrect ? 'TRUE' : 'FALSE'}),`;
            for (let i = 1; i < choices.length; i++) {
                choicesQuery += `("${result.insertId}","${choices[i].choiceBody}", ${choices[i].isCorrect ? 'TRUE' : 'FALSE'})`;

                if (i == choices.length - 1) {
                    choicesQuery += ';'
                } else {
                    choicesQuery += ','
                }
            }
            con.query(choicesQuery, (error, result2) => {
                if (error) {
                    res.send(error);
                    throw error;
                }

                totalQuery['choices'] = result2;
                resolve(totalQuery);
            });
        }).then((re) => {
            console.log(re);
            res.json(re);
        })

    });
});

app.get('/admin/quizzes/questions/:id', (req, res) => {

    let quizId = req.params.id;

    let query = `select Questions.*` +
        `from Questions where Questions.quizId=${quizId}`;

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.json(result);
    });
});


// [GET] Selects all queries Question Table from Admin
// where quiz matches the parameter
app.get('/admin/quizzes/questions/:id', (req, res) => {

    let quizId = req.params.id;

    let query = `select Questions.*, Choices.* ` +
        `from Questions join Choices on Questions.questionId=Choices.questionId ` +
        `where Questions.quizId=${quizId}`;

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.json(result);
    });
});

app.get('/admin/quizzes/questions/:id/choices', (req, res) => {

    let quizId = req.params.id;

    let query = `select qu.questionId,c.choiceId,c.choiceBody,c.isCorrect ` +
        `from Quizzes q join Questions qu on q.quizId=qu.quizId ` +
        `join Choices c on qu.questionId=c.questionId ` +
        `where q.quizId=${quizId} order by qu.questionId`;

        console.log('Running query');
    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }

        res.json(result);
    });
})

// [PUT] Updates question and choices from Admin
app.put('/admin/questions', (req, res) => {

    let questionBody = req.body.questionBody;
    let questionId = req.body.questionId;

    // if questionBody exists, update it in the db
    if (questionBody) {

        let updateQuestionQuery = `update Questions set questionBody = '${questionBody}' where questionId = ${questionId}`;

        // commits query for updating Question 
        con.query(updateQuestionQuery, (err, result) => {
            if (err) {
                res.json(err);
                throw err;
            }
        });
    }

    // for every choice in the questions
    for (let choice of req.body.choices) {

        let choiceQueries;

        let questionId = req.body.questionId;
        let choiceBody = choice.choiceBody;
        let isCorrect = choice.isCorrect;
        let choiceId = choice.choiceId;

        // [inserting new choice] 
        // if choiceId is null, insert new row 
        if (choiceId == null) {
            choiceQueries = `insert into Choices (questionId, choiceBody, isCorrect) values("${questionId}","${choiceBody}", "${isCorrect ? 'TRUE' : 'FALSE'}");`;

            // [deleting a choice] 
            // if choiceBody is null, delete row
        } else if (choice.choiceBody == '') {
            choiceQueries = `delete from Choices where choiceId = ${choiceId}`;

            // [updates all the choices in the question] 
            // if the above tests pass, updates the choice
        } else {
            choiceQueries = `update Choices set choiceBody = '${choiceBody}', isCorrect =${isCorrect ? 'TRUE' : 'FALSE'} where choiceId = ${choiceId}`;
        }

        // commits query for updating Choices
        con.query(choiceQueries, (err, result) => {
            if (err) {
                console.log(err);
                res.json(err);
                throw err;
            }
        });
    }
});

// [GET] Selects all queries from quiz table for Students
app.get('/student/quizzes', (req, res) => {

    const query = `select * from Quizzes`;

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.json(result);
    });
});

// [GET] Selects all queries Question Table from Student
// where quiz matches the parameter
app.get('/student/quizzes/questions/:id', (req, res) => {

    let quizId = req.params.id;
    let query = `select Questions.*, Choices.* from Questions, Choices where Questions.quizId = ${quizId} AND Choices.questionId = Questions.questionId`;

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.json(result);
    });
});

// [GET] Deletes queries from Quizzes Table
app.get('/delete/quizzes', (req, res) => {

    const query = 'delete from Quizzes;';

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.send(result);
    });
});

// [GET] Deletes queries from Questions Table
app.get('/delete/questions', (req, res) => {

    const query = 'delete from Questions;';

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.send(result);
    });
});

// [GET] Deletes queries from Choices Table
app.get('/delete/choices', (req, res) => {

    const query = 'delete from Choices;';

    con.query(query, (err, result) => {
        if (err) {
            res.send(err);
            throw err;
        }
        res.send(result);
    });
});

// Error
app.get("*", (req, res) => {
    res.send("not found");
});

// Listening
app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
});