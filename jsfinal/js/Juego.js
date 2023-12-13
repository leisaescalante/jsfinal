    let canvas = document.querySelector('.canvas');
    let ctx = canvas.getContext('2d');

    let filas, cols ,timeGame;

    //Fichas por jugador
    let tablero;
    let endedGame = false;;

    // 'x' en linea, depende de la dimension de tablero
    let limite;

    let crono;

    let fichas1 = [],
        fichas2 = [];

    let fichaSelected;
    let fichaSelectedPosX;
    let fichaSelectedPosY;

    //select tablero
    let tagTablero = document.querySelector('#selectTablero');
    let tagTableroPU = document.querySelector('#selectTableroPU');

    let imgTablero = new Image();
    imgTablero.src = "./images/fondoTablero2.jpg";

    let imgFicha = new Image();
    imgFicha.src = "./images/Ficha.png";

    // inicia el selector de jugador
    let jugadorActual;

    //Color y nombre por defecto de los jugadores
    let Jugador1 = new Jugador('#F37A15', 'Jugador 1');

    let Jugador2 = new Jugador('#3F5BCF', 'Jugador 2');

    setBtnColors();

    setBtnsColorListeners("button_color_1", Jugador1);
    setBtnsColorListeners("button_color_2", Jugador2);

    //Cuando se inicia el juego se hace un sorteo a ver quien arranca primero
    document.querySelector('#btn-sorteo').addEventListener("click", function() {
        setPlayersNames();
        startGame(Jugador1, Jugador2, tagTablero);
        document.querySelector("#btn-sorteo").style.display='none';

    });

    //En caso de querer reiniciar
    let buttons = document.querySelectorAll(".btn-restart");

    buttons.forEach(b => {
        b.addEventListener("click", () => {
            restart();
        });
    });

    //Si no se termino el juego, permite seleccionar una ficha del color correspondiente
    canvas.addEventListener("mousedown", function(e) {
        let array;
        if (jugadorActual == Jugador1.name) {
            array = fichas1;
        } else {
            array = fichas2;
        }

        //Si no se termino el juego, puedo seguir moviendo fichas
        if (!endedGame) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].isInside(e.clientX, e.clientY, canvas)) {
                    fichaSelected = array[i];
                    fichaSelectedPosX = fichaSelected.posX;
                    fichaSelectedPosY = fichaSelected.posY;
                    //Aca cuando selecciono una ficha
                }
            }
        }
    });

    //Si seleccionó una ficha la arrastra.
    canvas.addEventListener("mousemove", function(e) {
        if (fichaSelected) {
            fichaSelected.posX = e.layerX;
            fichaSelected.posY = e.layerY;

            tablero.drawFicha(fichaSelected.relleno, fichaSelected.posX, fichaSelected.posY);
            reDrawTable();
        }
    });

    //Cuando levanta el dedo del mouse, checkea si solto la ficha en un lugar, etc
    canvas.addEventListener("mouseup", function(e) {
        tablero.isInRangeX(2);
        if (fichaSelected != null) {

            let winnerName;
            let rect = canvas.getBoundingClientRect();
            fichaX = e.clientX - rect.left;

            let posInX = tablero.getXFromPx(fichaX);
            //35 seria el radius de la ficha

            //checkear si esta arriba del tablero
            if ((fichaSelected.posY + 35) < tablero.posY && tablero.isInRangeX(fichaSelected.posX)) {

                //Si pudo colocar la ficha en el lugar elegido
                if (tablero.colocarFichaInTablero(fichaSelected, posInX) == true) {


                    //Remueve esa ficha desde el array de fichas
                    if (jugadorActual == Jugador1.name) {
                        removeFromArray(fichas1, fichaSelected);
                    } else {
                        removeFromArray(fichas2, fichaSelected);
                    }

                    //Recalcula los vecinos de todas las fichas
                    tablero.refreshVecinosOfFichas();
                    reDrawTable();

                    //Comprueba las condiciones de corte
                    let fullTablero = tablero.checkTableroLleno();
                    endedGame = fichaSelected.checkWinGame(1,
                        // fichaSelected.vecinos, fichaSelected.jugador,
                        limite);

                    winnerName = fichaSelected.jugador;

                    if (!endedGame && fullTablero != true) {
                        //Switch players
                        if (jugadorActual == Jugador1.name) {
                            jugadorActual = Jugador2.name;
                        } else {
                            jugadorActual = Jugador1.name;
                        }
                        toggleTurn(jugadorActual, Jugador1);
                    } else {

                        //Termina el juego
                        let retorno;

                        if (endedGame) retorno = "Ganó jugador " + winnerName;
                        else retorno = "se finalizó por tablero lleno";

                        endGame(retorno);
                        //bloquear todos los listener de las fichas
                        endedGame = true;
                    }
                }
            } else {
                fichaSelected.posX = fichaSelectedPosX;
                fichaSelected.posY = fichaSelectedPosY;

                reDrawTable();
            }
            fichaSelected = null;
        }
    });

    //Cuando se quiere reiniciar
    function restart() {
        clearInterval(crono.ticker);
        endedGame = false;
        togglePopup(document.querySelector(".popup_container"));
        startGame(Jugador1, Jugador2, tagTableroPU);
    }

    //Lógica del juego
    function startGame(Jugador1, Jugador2, table) {
        clearGameSpace();
        fichas1 = [], fichas2 = [];
        let numRandom = Math.round(Math.random() * 10);

        endedGame = false

        let player1_banner = document.querySelector(".j1");
        let player2_banner = document.querySelector(".j2");

        //Setea colores a los jugadores
        player1_banner.style.color = Jugador1.color;
        player2_banner.style.color = Jugador2.color;

        //Setea los nombres
        player1_banner.innerHTML = Jugador1.name;
        player2_banner.innerHTML = Jugador2.name;

        //Trae el tamanio deseado del tablero desde el select
        let valueBoard = table.value;
        let arrColsRows = valueBoard.split('x');
        filas = arrColsRows[0];
        cols = arrColsRows[1];
        limite = arrColsRows[2];
        timeGame = arrColsRows [3];
        limite = parseInt(limite);

        tablero = new Tablero(filas, cols, ctx, imgFicha, imgTablero);


        //Saca la cuenta de cuantas fichas por jugador
        let fichasPorJugador = Math.floor(((filas * cols) - 1) / 2);

        //arranca un jugador segun el "sorteo"
        if (numRandom > 4.5) {
            jugadorActual = Jugador1.name;
        } else {
            jugadorActual = Jugador2.name;
        }
        //agrega las fichas por jugador
        for (let i = 0; i <= fichasPorJugador; i++) {
            fichas1[i] = new Ficha(Jugador1.name, Jugador1.color);
            fichas2[i] = new Ficha(Jugador2.name, Jugador2.color);
        }


        reDrawTable();

        //dibuja de quien es el turno
        toggleTurn(jugadorActual, Jugador1);

        tablero.drawTablero();
        tablero.drawCasilleros();

        //dibuja las fichas de cada jugador
        tablero.colocarIdleFichas(fichas1, fichas2);

        crono = new Cronometro(timeGame, 0);


    }


    //Asigna los nombres en base a los inputs
    function setPlayersNames() {
        //Si puso algun nombre se lo setea
        if (document.querySelector("#nameP1").value !== '') {
            Jugador1.name = document.querySelector("#nameP1").value;
        }
        if (document.querySelector("#nameP2").value !== '') {
            Jugador2.name = document.querySelector("#nameP2").value;
        }
    }

    //recibe los valores que manda el tablero selecionado
    function reglasGame(table){
        
    }

    //Redibuja todo el canvas.
    function reDrawTable() {
        ctx.fillStyle = "#005392";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        tablero.drawTablero();
        tablero.drawCasilleros();
        tablero.refreshTablero();
        tablero.refreshIdleFichas(fichas1, fichas2);
    }

    //Remueve del array sin alterar el orden
    function removeFromArray(array, obj) {
        let index = array.indexOf(obj);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    //Mostrar que finalizó el juego
    function endGame(string) {
        let container = document.querySelector(".popup_container");
        togglePopup(container);
        document.querySelector("#popup_reason").innerHTML = string;
        
    }

    function togglePopup(container) {
        if (container.classList.contains("popup_container_hidden")) {
            container.classList.add("popup_container_shown");
            container.classList.remove("popup_container_hidden");
        } else {
            container.classList.remove("popup_container_shown");
            container.classList.add("popup_container_hidden");
        }
    }

    //Listeners de click de los botones para elegir el color
    function setBtnsColorListeners(clase, jugador) {
        let select_player_btns = document.querySelectorAll("." + clase);
        select_player_btns.forEach(btn => {
            btn.addEventListener("click", function() {
                jugador.color = btn.id;
            });
        });
    }

    //Quita los inputs y reglas que ocupan espacio una vez arrancado el juego
    function clearGameSpace() {
        document.querySelector(".game_misc").classList.add("game_misc_hidden");

        setTimeout(function() {
            document.querySelector(".game_misc").classList.add("no_display");
            document.querySelector(".canvas_container").classList.remove("canvas_container_top");
            document.querySelector(".banner").classList.remove("banner_margin");
        }, 1000);
    }

    //Alterna el cartel de "TURNO DE" entre los jugadores
    function toggleTurn(jActual, j1) {

        if (jActual == j1.name) {
            addToView(".j1");
            removeFromView(".j2");
        } else {
            removeFromView(".j1");
            addToView(".j2");
        }
    }

    //Remueve las clases que permiten que sea visible el "TURNO DE".
    function removeFromView(j) {
        let sign = document.querySelector(j).previousElementSibling;
        let container = sign.parentElement;

        container.classList.remove("widen");
        sign.classList.add("hidden");
        sign.classList.remove("shown");
    }

    //Añade las clases que permiten que sea visible el "TURNO DE".
    function addToView(j) {
        let sign = document.querySelector(j).previousElementSibling;
        let container = sign.parentElement;

        container.classList.add("widen");
        sign.classList.remove("hidden");
        sign.classList.add("shown");
    }

    //Setea los colores de los botones en base a su id
    function setBtnColors() {
        let players_btns = document.querySelectorAll(".color_rect");
        players_btns.forEach(rect => {
            let btn = rect.parentElement;
            rect.style.backgroundColor = btn.id;
        });
    }

    //Calcula y muestra el tiempo en el cronometro
    function setTime(min, sec) {
        let total_time;

        if (min < 10) {
            total_time = "0" + min;
        } else total_time = min;

        total_time += ":";

        if (sec < 10) {
            total_time += "0" + sec;
        } else total_time += sec;

        document.querySelector("#time").innerHTML = total_time;
    }