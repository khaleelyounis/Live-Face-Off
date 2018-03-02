import React, { Component } from 'react';
import '../assets/css/gameBoard.css';
import deck from './deck';
import CardClicked from './cardClicked';
import GameInfoModal from './gameInfoModal';
import EndGameModal from "./endGameModal";
import LandingBG from '../assets/images/gameBG3.png';

class GameBoard extends Component {
    constructor(props) {
        console.log("GameBoard props :", props);
        super(props)
        this.state = {
            players: [1],
            playerHand1: [],
            clickedCards: [false, false, false, false, false],
            player1Total: null,
            gameMessage: 'Click on up to 3 cards then discard',
            displayEndGameModal: false,
            displayInfoModal: false
        }

        this.roomKeyId = sessionStorage.getItem('roomKey');
        this.deck = [];
        this.discardPile = [];
        this.discardArr = [];
        this.roundCounter = 1;
        this.finalScore = [];

        this.displayEndGame = this.displayEndGame.bind(this);
        this.closeEndGameModal = this.closeEndGameModal.bind(this);
        this.dealInitialHand = this.dealInitialHand.bind(this);
        this.cardsToDiscard = this.cardsToDiscard.bind(this);
        this.discardCardBtn = this.discardCardBtn.bind(this);
        this.displayInfo = this.displayInfo.bind(this);
        this.closeInfoModal = this.closeInfoModal.bind(this);
    }

    displayEndGame() {
        this.setState({
            displayEndGameModal: true,
        })

    }

    closeEndGameModal() {
        this.roundCounter = 1;
        this.discardArr = [];
        this.setState({
            displayEndGameModal: false,
            playerHand1: [],
            player1Total: null,
            gameMessage: 'Click on up to 3 cards then discard'
        }, () => {
            debugger;
            this.dealInitialHand();
        });
    }

    displayInfo() {
        this.setState({
            displayInfoModal: true
        })
    }

    closeInfoModal() {
        this.setState({
            displayInfoModal: false
        })
    }

    componentDidMount() {
        this.shuffleDeck();
        this.dealInitialHand();
    }

    shuffleDeck() {
        this.deck = deck.sort(function () { return 0.5 - Math.random(); });
    }

    dealInitialHand() {

        const numOfPlayers = this.state.players.length;
        const hand1 = [];
        let cardCounter = 5;

        for (let cardCountIndex = 0; cardCountIndex < cardCounter; cardCountIndex++) {
            hand1.push(this.deck.shift());
        }

        let player1Total = this.currentPointTotal(hand1);

        this.setState({
            playerHand1: [...hand1],
            player1Total
        });
    }

    discardCardBtn() {
        this.discardCards(this.discardArr);
    };

    cardsToDiscard(event) {
        var oldClickedCards = this.state.clickedCards.slice();
        let cardPosition = parseInt((event.target.className).slice(-1));
        oldClickedCards[cardPosition] = true;
        this.discardArr.push(cardPosition);
        this.setState({
            clickedCards: oldClickedCards
        })
    };

    discardCards(deleteIndexArray) {
        if (deleteIndexArray.length > 3 || deleteIndexArray.length < 1) {
            const newMessage = 'You must only discard 1 to 3 cards per turn';
            this.setState({
                gameMessage: newMessage,
                clickedCards: [false, false, false, false, false]
            });
            this.discardArr = [];
            return;
        }

        if (this.deck.length < deleteIndexArray.length) {
            debugger;
            for (let discardPileIndex = 0; 0 <= this.discardPile.length; discardPileIndex++) {
                let oldCard = this.discardPile.pop();
                this.deck.push(oldCard);
            }
        }

        deleteIndexArray.sort(function (a, b) { return b - a });
        let currentPlayersHand = this.state.playerHand1;
        for (let cardIndex = 0; cardIndex < deleteIndexArray.length; cardIndex++) {
            let currentCard = currentPlayersHand.splice(deleteIndexArray[cardIndex], 1);
            this.discardPile.push(currentCard[0]);
            let newCard = this.deck.pop();
            currentPlayersHand.push(newCard);
        }

        this.roundCounter++;
        let player1Total = this.currentPointTotal(this.state.playerHand1);
        this.setState({
            playerHand1: currentPlayersHand,
            player1Total,
            gameMessage: 'Click on up to 3 cards to discard',
            clickedCards: [false, false, false, false, false]
        });

        this.discardArr = [];
        if (this.roundCounter === 10) {
            this.endGame();
        }
    };

    currentPointTotal(currentHand) {
        let currentPointTotal = 0;
        for (let cardIndex = 0; cardIndex < 5; cardIndex++) {
            currentPointTotal += currentHand[cardIndex].value;
        }
        return currentPointTotal;
    }

    endGame() {
        const finalScore = this.state.player1Total;
        this.finalScore.push(finalScore);
        this.displayEndGame();
    };

    renderCards(count) {
        let cards = [];
        for (let index = 0; index < count; index++) {
            cards.push(<CardClicked key={index} handleClick={this.cardsToDiscard} className={'playerCard' + index} style={this.state.playerHand1[index].image} clickedStatus={this.state.clickedCards[index]} />)
        }
        return cards;
    }

    render() {

        let styles = {
            backgroundSize: 'contain',
            backgroundImage: 'url(' + LandingBG + ')'
        };

        const { playerHand1, player1Total, gameMessage, displayInfoModal, displayEndGameModal } = this.state;

        if (!playerHand1[0] || !playerHand1[1] || !playerHand1[2] || !playerHand1[3]) {
            return (
                <div className="instructions">
                    <h3>Deal 52</h3>
                    <ul>Instructions
                    <li>Deal 52 is a 5 card per hand game where lowest point total wins after 10 rounds</li>
                        <li>When each hand is delt you must discard at least 1 card per round but not more than 3 cards</li>
                        <li>The point total per each card the value on the face with Jacks, Queens and Kings all having a 10 point value</li>
                        <li>Ace is the best card with a 1 point value</li>
                        <li>Once your hand is delt click on the high value cards you would like to discard</li>
                        <li>Then click the discard button below for those cards to be replaced</li>
                    </ul>
                    <button onClick={this.dealInitialHand} className="waves-effect waves-light btn blue-grey darken-2" type="submit">Start Game</button>
                </div>
            )
        }
        return (
            <div className="gameArea" style={styles} >
                {this.renderCards(5)}
                <div className="bottomInfo col s12">
                    <div className="col s4 left-align">
                        <h6 className="gameMessage">{gameMessage}</h6>
                    </div>
                    <div className="col s3 center-align">
                        <button onClick={this.discardCardBtn} className="waves-effect waves-light btn brown darken-4 center-align" type="submit">Discard Cards</button>
                    </div>
                    <div className="col s2">
                        <button onClick={this.displayInfo} className="waves-effect waves-light btn brown darken-4" type="button">Game Info</button>
                    </div>
                    <div className="col s3">
                        <h6 className="right-align gameTotals">Current Round : {this.roundCounter}/10 </h6>
                        <h6 className="right-align gameTotals">Total Points : {player1Total}</h6>
                    </div>
                </div>
                <EndGameModal display={displayEndGameModal} close={this.closeEndGameModal} points={player1Total} />
                <GameInfoModal gameType='deal52' display={displayInfoModal} close={this.closeInfoModal} roomKey={this.roomKeyId} />
            </div>
        );
    }
}

export default GameBoard;

