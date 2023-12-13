'use strict';

class Ficha {
    posX;
    posY;
    jugador;
    relleno;
    vecinos;

    constructor(jugador, relleno) {
        this.jugador = jugador;
        this.relleno = relleno;
    }

    setposY(y) {
        this.posY = y;
    }

    setPosX(x) {
        this.PosX = x;
    }

    setJugador(jugador) {
        this.jugador = jugador;
    }

    setVecinos(vecinos) {
        this.vecinos = vecinos;
    }

    //Calcula si el mouse esta dentro de una ficha
    isInside(x, y, canvas) {
        let rect = canvas.getBoundingClientRect();
        let distancia, restaPuntos, fichaX, fichaY;
        fichaX = x - rect.left;
        fichaY = y - rect.top;
        restaPuntos = Math.pow(fichaX - this.posX, 2) + Math.pow(fichaY - this.posY, 2);
        distancia = Math.sqrt(restaPuntos);
        let unNumber = 35;

        if (distancia < unNumber) {
            return true
        }
    }



    //en base a la ficha que llama a esta función, se busca recursivamente una linea con el dueño de la ficha
    checkWinGame(cant, limite, orientacion = null) {

        //Cond de corte
        if (cant == limite) {
            return cant;
        } else {
            //Estoy en la ficha madre
            if (orientacion == null) {
                //0 = arriba der
                //1 = der
                //2 = abajo der
                //3 = abajo
                //4 = abajo izq
                //5 = izq
                //6 = arriba izq

                for (let i = 0; i < 4; i++) {
                    switch (i) {
                        case 0:
                            //Caso diagonal arriba_derecha - abajo_izq
                            if (this.checkLine(limite, 0, 4)) {
                                return true;
                            }

                        case 1:
                            //Caso horizontal derecha-izquierda
                            if (this.checkLine(limite, 1, 5)) {
                                return true;
                            }

                        case 2:
                            //Caso diagonal abajo_derecha - arriba_izquierda
                            if (this.checkLine(limite, 2, 6)) {
                                return true;
                            }
                        case 3:
                            //Caso vertical solo abajo
                            if (this.checkSingleLine(limite, 3)) {
                                return true;
                            }
                    }
                }
                return false;
            } else {
                //Estoy en una ficha secundaria, porque tengo seteada orientacion
                if (this.vecinos[orientacion] != null) {
                    if (this.vecinos[orientacion].jugador == this.jugador) {
                        let resultado = this.vecinos[orientacion].checkWinGame(cant + 1, limite, orientacion);
                        return resultado;
                    } else return cant;
                } else return cant;
            }
        }
    }

    //Pa chequear la ficha de abajo
    checkSingleLine(limite, or) {
        let resultado1 = this.getVecinoCant(this.vecinos[or], 1, limite, or);
        if (resultado1 == limite) return true;
    }

    //Chequear de a pares
    checkLine(limite, or1, or2) {
        //Or1 = Orientacion 1
        //Or2 = Orientacion 2

        let resultado1 = 0;
        let resultado2 = 0;

        resultado1 = this.getVecinoCant(this.vecinos[or1], 0, limite, or1);
        if (resultado1 == limite) return true;

        resultado2 = this.getVecinoCant(this.vecinos[or2], 0, limite, or2);
        if (resultado2 == limite) return true;
        else {
            if ((resultado1 + resultado2 + 1) >= limite) {
                return true;
            }
        }
    }

    //Obtiene recursivamente cuantas fichas con esa orientacion hay
    getVecinoCant(vecino, cant, limite, orientacion) {
        if (vecino != null) {
            if (vecino.jugador == this.jugador) {
                return vecino.checkWinGame(cant + 1, limite, orientacion);
            } else return 0;
        } else return 0;
    }
}