// Access createClient from the Supabase CDN
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// connect to api
let url = 'https://opentdb.com/api.php?amount=1&category=17&type=multiple'
//add a global scope of add points function here
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
async function checkAnswer(answer) {
    if (answer === correctAnswer) {
        alert("Shrektacular! Shrek is proud of you");
        await updatePoints();
        await displayPoints();
    } else {
        alert("Wrong! Shrek ate your onion. GO CRY IN YOUR SWAMP YOU ONIONLESS LOSER");
    }
    setTimeout(requestTrivia, 1000); //this makes it wait a second before loading the next question so that the api doesnt freak out
}
//connects the html buttons to the check answer function so that the choices display on the button
document.getElementById('btn1').addEventListener('click', function() {
    checkAnswer(document.getElementById('btn1').innerText);});
document.getElementById('btn2').addEventListener('click', function() {
    checkAnswer(document.getElementById('btn2').innerText);});
document.getElementById('btn3').addEventListener('click', function() {
    checkAnswer(document.getElementById('btn3').innerText);});
document.getElementById('btn4').addEventListener('click', function() {
    checkAnswer(document.getElementById('btn4').innerText);});

//POINTS SYSTEM
async function updatePoints() {
    const sessionData = await supabase.auth.getSession();
    const userId = sessionData.data.session.user.id;

    const result = await supabase
        .from('finalproject')
        .select('points')
        .eq('user_id', userId)
        .maybeSingle();

    if (result.data === null) {
        await supabase.from('finalproject').insert({ user_id: userId, points: 1 });
    } else {
        await supabase.from('finalproject').update({ points: result.data.points + 1 }).eq('user_id', userId);
    }
}

async function displayPoints() { //modified from old project and also googled a bunch of stuff
    const sessionData = await supabase.auth.getSession();
    const userId = sessionData.data.session.user.id;

    const result = await supabase
        .from('finalproject')
        .select('points')
        .eq('user_id', userId)
        .maybeSingle();

    if (result.data !== null) {
        document.getElementById('points').innerText = "Points: " + result.data.points;
    }
}

// Function to read tasks
async function getTasks() {
    const { data, error: userError } = await supabase.auth.getUser();
    console.log("User data:", data);
    const user = data?.user; // Access the user from the data object

    if (userError || !user) {
        console.error("Error fetching user or user not logged in:", userError);
        return [];
    }

    const { data: tasks, error } = await supabase
        .from('finalproject')
        .select('*')
        .eq('user_id', user.id); // Filter tasks by the logged-in user's ID

    if (error) {
        console.error('Error fetching points:', error);
        return [];
    } else {
        console.log('Points fetched:', tasks);
        return tasks;
    }
}

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
        document.getElementById('login-zone').style.display = 'none';
        requestTrivia();
        await displayPoints();
    }
}
// Log out the current user
async function logOut() {
    localStorage.clear(); //this prevents the auto sign in
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    else {
        console.log("User logged out");
    };
}

document.getElementById("login-btn").addEventListener("click", () => {
    logIn(
        document.getElementById("email").value,
        document.getElementById("password").value
    );
});

document.getElementById("logout-btn").addEventListener("click", () => {
    logOut();
    console.log(session.user);
    debugger;
});

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
        document.getElementById('login-zone').style.display = 'none';
        await requestTrivia();
    } else {
        console.log("No active session found.");
    }
}

// Listen for authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
        console.log("User signed out.");
        setTimeout(() => location.reload(), 500);
    }
});

checkSession();