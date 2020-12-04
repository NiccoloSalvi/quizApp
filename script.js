var quizData = [
    {
        question: "Which is the capital of ",
        a: "",
        b: "",
        c: "",
        d: "",
        e: "",
        f: "",
        g: "",
        correct: "",
        answered: ""
    },
    {
        question: "What are the borders of ",
        a: "",
        b: "",
        c: "",
        d: "",
        e: "",
        f: "",
        g: "",
        correct: "",
        answered: ""
    },
    {
        question: "What is the population of ",
        a: "",
        b: "",
        c: "",
        d: "",
        e: "",
        f: "",
        g: "",
        correct: "",
        answered: ""
    },
    {
        question: "Which is the flag of ",
        a: "",
        b: "",
        c: "",
        d: "",
        e: "",
        f: "",
        g: "",
        correct: "",
        answered: ""
    }
];

var questionLetters = ["a", "b", "c", "d", "e"]; // numero di opzioni
var questionsText = ["capital", "borders", "population", "flag"]; // domande possibili
var indexQuestion = 0; // indice delle domande
var score = 0; // punteggio ottenuto, incrementato ad ogni risposta corretta
var result; // array di tutti gli stati
var wrongQuestions = [];
var indexWrongQuestion = 0;

// funzione che crea le opzioni html
function createOptions() {
    questionLetters.forEach(element => {
        li = document.createElement("li"); // opzione dell'elenco

        inp = document.createElement("input");
        inp.type = "radio";
        inp.id = element;
        inp.onchange = function() {
            selectedOption(element); // onchange viene eseguita la funzione
        }
        li.appendChild(inp);

        lab = document.createElement("label");
        lab.id = element + "_text";
        lab.for = element;
        li.appendChild(lab);

        im = document.createElement("img");
        im.id = element + "_img";
        li.appendChild(im);
        
        document.getElementById("options").appendChild(li);
    });
}

// ottiene dati dall'api di tutti i paesi del mondo
async function getData() {
    createOptions(); // creato l'elenco delle opzioni

    var countries = new Promise(resolve => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "https://restcountries.eu/rest/v2/all", true);

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(this.responseText));
            }
        }
        xhttp.send();
    });

    return await countries;
}

getData().then(function(res) { // una volta effettuato il caricamento dei dati, chiesti all'api
    result = res; // variabili globale 
    createQuestions(); // creazione delle domande
    nextQuestion();
});

function createQuestions() {
    var max = result.length; // massimo, coincide con il numero di tutti i paesi del mondo
    var min = 0; // minimo corrisponde a 0
    var num;

    for (indQuestion = 0; indQuestion < questionsText.length; indQuestion++) { // per ogni domanda 
        num = Math.floor(Math.random() * (max - min)) + min; // numero casuale, per estrarre il paese, della risposta corretta
        while (result[num][questionsText[indQuestion]] == "") { // rimani nel ciclo fino a quando non viene trovato un paese che ha un valore non nullo del campo desiderato
            // ci sono paesi dei quali non è segnata la capitale
            num = Math.floor(Math.random() * (max - min)) + min; // ricalcolo del numero casuale
        }

        quizData[indQuestion].question = quizData[indQuestion].question.split("of")[0] + "of "; // modifica della domanda, altrimenti i nomi rimangono scritti e vengono aggiunti quelli nuovi
        quizData[indQuestion].question += result[num].name + "?"; // concatenazione e formazione della domanda
        var x = Math.floor(Math.random() * (questionLetters.length - min)) + min; // numero casuale che indica l'opzione corretta alla domanda
        
        // nel caso dei confini, viene formattata la stringa
        if (questionsText[indQuestion] == "borders") {
            questionLetters.forEach(el => {
                quizData[indQuestion][el] = "";
            });
            result[num][questionsText[indQuestion]].forEach(element => { // per ogni elemento nel vettore
                var index = result.findIndex(function(item) {
                    return item.alpha3Code === element; // trovato indice del paese, dato un suo elemento
                });
                quizData[indQuestion][questionLetters[x]] += result[index].name; // concatenazione dell'opzione corretta
                
                if (result[num][questionsText[indQuestion]].indexOf(element) != result[num][questionsText[indQuestion]].length - 1) { // se non è l'ultimo elemento del vettore, viene concatenata una virgola
                    quizData[indQuestion][questionLetters[x]] += ", ";
                }
            });
        } else {
            quizData[indQuestion][questionLetters[x]] = result[num][questionsText[indQuestion]]; // il testo, nel caso delle altre domande, non viene formattato
        }
        quizData[indQuestion].correct = questionLetters[x]; // indice dell'opzione corretta
        
        for (var i = 0; i < questionLetters.length; i++) { // indice delle opzioni
            if (i != x) { // se l'indice è diverso da quello della risposta corretta
                y = Math.floor(Math.random() * (max - min)) + min; // calcolo del numero casuale del paese
                while (y == num || result[y][questionsText[indQuestion]] == "") { // rimani nel ciclo fino a quando viene trovato un paese, il cui campo scelto è nulllo
                    // oppure, fino a quando il numero casuale è uguale a quello del paese dell'opzione corretta
                    y = Math.floor(Math.random() * (max - min)) + min;
                }
                // nel caso dei confini, viene formattata la stringa
                if (questionsText[indQuestion] == "borders") { 
                    result[y][questionsText[indQuestion]].forEach(element => { // per ogni elemento nel vettore
                        var index = result.findIndex(function(item) {
                            return item.alpha3Code === element; // trovato indice del paese, dato un suo elemento
                        });
                        quizData[indQuestion][questionLetters[i]] += result[index].name; // concatenazione dell'opzione
                        
                        if (result[y][questionsText[indQuestion]].indexOf(element) != result[y][questionsText[indQuestion]].length - 1) { // se non è l'ultimo elemento del vettore, viene concatenata una virgola
                            quizData[indQuestion][questionLetters[i]] += ", ";
                        }
                    });
                } else {
                    quizData[indQuestion][questionLetters[i]] = result[y][questionsText[indQuestion]];
                }
            }
        }
    }
}

function decolorOptions() {
    questionLetters.forEach(el => {
        document.getElementById(el).checked = false;
        document.getElementById(el + "_text").style.fontWeight = "normal";
        document.getElementById(el + "_text").style.color = "black";
    });
}

function nextQuestionError() {
    deselectOptions();
    decolorOptions();

    var ind = wrongQuestions[indexWrongQuestion];
    document.getElementById("questionText").innerHTML = quizData[ind].question; // testo della nuova domanda
    if (ind == 3) {
        questionLetters.forEach(el => {
            document.getElementById(el + "_img").style.display = "inline";
            if (el == quizData[ind].correct) {
                document.getElementById(el).checked = true;
            }
            document.getElementById(el + "_text").style.display = "none";
            document.getElementById(el + "_img").src = quizData[ind][el]; // immagine
            document.getElementById(el + "_img").style.display = "inline";
        });
    } else {
        questionLetters.forEach(el => {
            document.getElementById(el + "_text").style.display = "inline";
            if (el == quizData[ind].answered) {
                document.getElementById(el + "_text").style.color = "red"; // testo delle opzioni possibili
                document.getElementById(el + "_text").style.fontWeight = "bold";
            }
            if (el == quizData[ind].correct) {
                document.getElementById(el + "_text").style.color = "green"; // testo delle opzioni possibili
                document.getElementById(el + "_text").style.fontWeight = "bold";
                document.getElementById(el).checked = true;
            }
            document.getElementById(el + "_img").style.display = "none";
            document.getElementById(el + "_text").innerHTML = quizData[ind][el]; // testo delle opzioni possibili
        });
    }

    indexWrongQuestion++;
    if (indexWrongQuestion == wrongQuestions.length) {
        score = 0; // punteggio azzerato
        indexQuestion = 0; // indice azzerato
        indexWrongQuestion = 0;
        wrongQuestions = [];
        
        createQuestions(); // ricreate nuove domande
        document.getElementById("submit").innerHTML = "Play Again"; // cambio testo del bottone
        document.getElementById("options").style.display = 'block'; // le opzioni delle risposte ritornano visibili
        document.getElementById("submit").onclick = test; // al click del bottone, viene eseguita la seguente funzione
    }
}

function test() {
    deselectOptions();
    decolorOptions();

    document.getElementById("options").style.display = 'block';
    questionLetters.forEach(el => {
        document.getElementById(el + "_img").style.display = "none";
        document.getElementById(el + "_text").style.display = "inline";
    });
    nextQuestion();
    document.getElementById("submit").innerHTML = "Submit"; 
    document.getElementById("submit").onclick = submitAnswer;
}

// controlla se è stata selezionata una risposta
function checkAnswer() {
    // ritorna la lettera della risposta selezionata
    ch = undefined;
    questionLetters.forEach(el => {
        if (document.getElementById(el).checked) {
            ch = el;
        }
    });
    quizData[indexQuestion].answered = ch;
    return ch;
}

// deseleziona tutte le risposte, prima di caricare la domanda successiva
function deselectOptions() {
    questionLetters.forEach(el => {
        document.getElementById(el).checked = false;
    });
}

// funzione invocata ogni volta viene selezionata un'opzione delle risposte
function selectedOption(id) {
    // prima di selezionare l'opzione, tutte le altre vengono deselezionate,
    // per evitare di fare il submit con due o più risposte
    deselectOptions();
    document.getElementById(id).checked = true;
}

// funzione invocata al click del bottone
function submitAnswer() {
    if (checkAnswer()) { // se è stata selezionata una risposta
        if (checkAnswer() == quizData[indexQuestion].correct) { // se la risposta selezionata, coincide con quella della soluzione
            score++; // punteggio aumentato
        } else {
            wrongQuestions.push(indexQuestion);
        }
        deselectOptions(); // deselezionate tutte le opzioni
        indexQuestion++; // incrementato l'indice delle risposte
        if (indexQuestion < quizData.length) {
            nextQuestion(); // se rimangono delle domande, viene caricata la risposta successiva
        } else {
            // quiz finitox
            document.getElementById("questionText").innerHTML = "You answered correctly at " + score + "/" + quizData.length + " questions!"; // display del punteggio ottenuto
            if (score == quizData.length) {
                document.getElementById("submit").innerHTML = "Play Again";
                document.getElementById("submit").onclick = function() { // al click del bottone
                    score = 0; // punteggio azzerato
                    indexQuestion = 0; // indice azzerato
                    
                    createQuestions();
                    document.getElementById("submit").innerHTML = "Submit"; // cambio testo del bottone
                    document.getElementById("options").style.display = 'block'; // le opzioni delle risposte ritornano visibili
                    questionLetters.forEach(el => {
                        document.getElementById(el + "_img").style.display = "none";
                        document.getElementById(el + "_text").style.display = "inline";
                    });
                    nextQuestion();
                    document.getElementById("submit").onclick = submitAnswer; // al click del bottone, viene eseguita la seguente funzione
                }
            } else {
                document.getElementById("submit").innerHTML = "Get Errors"; // cambio testo del pulsante
                document.getElementById("submit").onclick = function() { // al click del bottone
                    score = 0; // punteggio azzerato
                    indexQuestion = 0; // indice azzerato
                    indexWrongQuestion = 0;
                    document.getElementById("submit").innerHTML = "Next"; // cambio testo del bottone
                    if (score == quizData.length - 1)
                        document.getElementById("submit").innerHTML = "Play Again";
                    document.getElementById("submit").onclick = nextQuestionError; // al click del bottone, viene eseguita la seguente funzione

                    nextQuestionError();
                    document.getElementById("options").style.display = 'block'; // le opzioni delle risposte ritornano visibili
                }
            }
            document.getElementById("options").style.display = 'none'; // le opzioni delle risposte sono insivibili
       }
    }
}

// carica la prossima domanda
function nextQuestion() {
    document.getElementById("questionText").innerHTML = quizData[indexQuestion].question; // testo della nuova domanda
    if (indexQuestion == 3) {
        questionLetters.forEach(el => {
            document.getElementById(el + "_text").style.display = "none";
            document.getElementById(el + "_img").src = quizData[indexQuestion][el]; // testo delle opzioni possibili
            document.getElementById(el + "_img").style.display = "inline";
        });
    } else {
        questionLetters.forEach(el => {
            document.getElementById(el + "_img").style.display = "none";
            document.getElementById(el + "_text").innerHTML = quizData[indexQuestion][el]; // testo delle opzioni possibili
        });
    }
}