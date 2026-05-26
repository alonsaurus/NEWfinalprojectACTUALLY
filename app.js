// Access createClient from the Supabase CDN
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// connect to api
let url = 'https://opentdb.com/api.php?amount=1&category=17&type=multiple'

let correctAnswer = "";

//reference: poemdb thing from a while ago
async function requestTrivia() {
        console.log("requestTrivia is running")
    const response = await fetch(url);
    const data = await response.json();
    const trivia = data.results[0];
//sets the given correct answer from the api as the correct answer out of the 4 choices
    document.getElementById('question').innerHTML = trivia.question;
    correctAnswer = trivia.correct_answer;
//shuffles the answers so that the correct answer isn't always in the same place https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/ 
    let answers = [trivia.correct_answer, ...trivia.incorrect_answers];
    answers.sort(() => Math.random() - 0.5);
//assigns the answers to the buttons after theyve been randomized
    document.getElementById('btn1').innerHTML = answers[0];
    document.getElementById('btn2').innerHTML = answers[1];
    document.getElementById('btn3').innerHTML = answers[2];
    document.getElementById('btn4').innerHTML = answers[3];
        console.log("done loading trivia");
}
//checks the answer, then reloads a new question
function checkAnswer(answer) {
    if (answer === correctAnswer) {
        alert("Shrektacular! Shrek is proud of you");
    } else {
        alert("Wrong! Shrek ate your onion. GO CRY IN YOUR SWAMP YOU ONIONLESS LOSER");
    }
    requestTrivia();
}
//connects the html buttons to the check answer function so that the choices display on the button
document.getElementById('btn1').onclick = function() { checkAnswer(document.getElementById('btn1').innerText); };
document.getElementById('btn2').onclick = function() { checkAnswer(document.getElementById('btn2').innerText); };
document.getElementById('btn3').onclick = function() { checkAnswer(document.getElementById('btn3').innerText); };
document.getElementById('btn4').onclick = function() { checkAnswer(document.getElementById('btn4').innerText); };



//FROM OLD PROJECT
// Sign up a new user
// async function signUp(email, password) {
//     const { data, error } = await supabase.auth.signUp({ email, password });

//     if (error) {
//         console.error("Sign-up error:", error.message);
//     } else if (data.user) {
//         console.log("User signed up:", data.user);
//     } else {
//         console.log("Sign-up successful, but no user data returned.");
//     }
// }
// Log in an existing user
async function logIn(email, password) {
    const { data: session, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error("Login error:", error);
    } else {
        console.log("User logged in:", session.user); // Access the user from the session object
        // Change UI to logged in state
        document.getElementById('task-submitter').style.display = 'block';
        document.getElementById('login-box').style.display = 'none';
        requestTrivia();
    }
}
// Log out the current user
async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    else {
        console.log("User logged out");
        location.reload();
    };
}

// Check for an existing session on page load
async function checkSession() {
    //defines the questions and the buttons so that the HTML can connect
const question = document.getElementById('question');
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error fetching session:", error);
    } else if (session) {
        console.log("User is already logged in:", session.user);
        // Change UI to logged in state
        document.getElementById('task-submitter').style.display = 'block';
        document.getElementById('login-box').style.display = 'none';
        await requestTrivia();
    } else {
        console.log("No active session found.");
    }
}

// Listen for authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        console.log("User signed in:", session.user);
    } else if (event === "SIGNED_OUT") {
        console.log("User signed out.");
    }
});

checkSession();