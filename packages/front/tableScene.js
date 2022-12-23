import { createServer } from "./server.js";

let cardParams = {

    width: 223,
    height: 312,

    opponentScale: 0.3,
    pocketScale: 0.5
}

class PokerTable extends Phaser.Scene {

    betButton
    foldButton

    constructor() {
        super("PokerTable");
        // console.log(this.server);
        this.suits = { 'spade': 0, 'club': 1, 'diamond': 2, 'heart': 3 }
        this.deck = {
            'heart': [],
            'diamond': [],
            'club': [],
            'spike': []
        };
        let seats = []
        seats[1] = { x: 250, y: 550, cardsSprites: [] }
        seats[2] = { x: 250, y: 230, cardsSprites: [] }
        seats[3] = { x: 660, y: 230, cardsSprites: [] }
        seats[4] = { x: 660, y: 550, cardsSprites: [] }
        /*
        seats[5] = { x: 710, y: 230, cardsSprites: [] }
        seats[6] = { x: 850, y: 280, cardsSprites: [] }

        seats[7] = { x: 800, y: 450, cardsSprites: [] }
        seats[8] = { x: 500, y: 550, cardsSprites: [] }
        seats[9] = { x: 200, y: 450, cardsSprites: [] }
        */
        this.seats = seats

        let flop = []
        flop[0] = { x: 400, y: 370, cardsSprite: [] }
        flop[1] = { x: 480, y: 370, cardsSprite: [] }
        flop[2] = { x: 560, y: 370, cardsSprite: [] }
        this.flop = flop

        this.server = createServer(this)
    }
    hidePlayingButtons() {
        this.betButton.x = -100
        this.betButton.y = -100
        this.foldButton.x = -100
        this.foldButton.y = - 100
    }
    buildPlayingButtons() {
        console.log(this);
        this.betButton = this.add.text(-100, -100, 'Miser', { fontSize: '50px', backgroundColor: '#ddd', color: '#000' });
        this.betButton.setInteractive({ useHandCursor: true });
        this.betButton.on('pointerdown', () => {
            console.log('mise...');
            this.server.emit("bet", { seat: this.player.seat, amount: 100 });
            this.hidePlayingButtons()
        });
        this.foldButton = this.add.text(-100, -100, 'Passer', { fontSize: '50px', backgroundColor: '#ddd', color: '#000' });
        this.foldButton.setInteractive({ useHandCursor: true });
        this.foldButton.on('pointerdown', () => {
            console.log('passer...');
            this.server.emit("fold", this.player.seat);
        });
    }
    preload() {

        // loading the sprite sheet with all cards
        this.load.spritesheet("cards", "./assets/cards.png", {
            frameWidth: cardParams.width,
            frameHeight: cardParams.height
        });
        this.load.image('tabouret','assets/tabouret_poker.png')
        this.load.image('tablepoker','assets/table_poker.png')
    }
    create() {
        
        var table = this.add.image(490,410,'tablepoker')
        table.setScale(1.3)

        //this.add.ellipse(500, 400, 800, 410, '0x8B4513')
        this.server.emit("listSeats")
        //this.add.ellipse(500, 400, 740, 360, '0x006400')

        var tab1 = this.add.image(690,150,'tabouret')
        tab1.setScale(0.5)
        var tab2 = this.add.image(300,670,'tabouret')
        tab2.setScale(0.5)
        var tab3 = this.add.image(690,670,'tabouret')
        tab3.setScale(0.5)
        var tab4 = this.add.image(300,150,'tabouret')
        tab4.setScale(0.5)
/*
        var tab1surbr = this.add.image(690,150,'tabouretsurbri')
        tab1surbr.setScale(0.5)
        var tab2surbr = this.add.image(300,670,'tabouretsurbri')
        tab2surbr.setScale(0.5)
        var tab3surbr = this.add.image(690,670,'tabouretsurbri')
        tab3surbr.setScale(0.5)
        var tab4surbr = this.add.image(300,150,'tabouretsurbri')
        tab4surbr.setScale(0.5)
*/
        
        console.log("build!");
        this.buildPlayingButtons()
        this.server.emit("listSeats")

    }

    createCard(card, scale) {

        let suitIdx = 4, rankIdx = 0 //blue cover idx in spritesheet
        if (card) {
            suitIdx = this.suits[card.suit]
            rankIdx = card.rank - 1
        }

        let idx = (suitIdx * 13) + rankIdx
        let sprite = this.add.sprite(- cardParams.width * scale, this.game.config.height / 2, "cards", idx);
        sprite.x = -500
        sprite.y = -500
        sprite.setScale(scale);
        return sprite;

    }

    dealCard(card, x, y, cb) {
        this.tweens.add({
            targets: card,
            x: x,
            y: y,
            duration: 500,
            ease: "Cubic.easeOut",
            callbackScope: this,
            onComplete: cb
        });
    }

    showCards(seat, cards) {
        let card1 = this.createCard(cards[0], cardParams.opponentScale)
        let card2 = this.createCard(cards[1], cardParams.opponentScale)
        let oldCards = this.seats[seat].cardsSprites
        card1.x = oldCards[0].x
        card1.y = oldCards[0].y
        oldCards[0].destroy()
        oldCards[0] = card1
        card2.x = oldCards[1].x
        card2.y = oldCards[1].y
        oldCards[1].destroy()
        oldCards[1] = card2
    }
    dealOpenCards(seat, cards, isPocketCards) {
        let scale = cardParams.opponentScale
        if (isPocketCards) {
            scale = cardParams.pocketScale
        }
        let card1 = this.createCard(cards[0], cardParams.pocketScale)
        // card1.x = 0
        // card1.y = 0
        // this.seats[seat].cardsSprites = []
        console.log(seat, this.seats[seat], this.seats[seat].cardsSprites);
        this.seats[seat].cardsSprites.push(card1)
        this.dealCard(card1, this.seats[seat].x, this.seats[seat].y, () => {
            console.log("deal seat", seat);
            let card2 = this.createCard(cards[1], cardParams.pocketScale)
            // card2.x = 0
            // card2.y = 0
            this.seats[seat].cardsSprites.push(card2)
            this.dealCard(card2, this.seats[seat].x + (cardParams.width * scale) * 1.2, this.seats[seat].y)
        })
    }

    dealClosedCards(seat, isPocketCards) {
        let scale = cardParams.opponentScale
        if (isPocketCards) {
            scale = cardParams.pocketScale
        }
        let card1 = this.createCard(null, scale)
        console.log(seat, this.seats[seat], this.seats[seat].cardsSprites);
        console.log(card1, this.seats[seat].cardsSprites);
        // card1.x = 0
        // card1.y = 0
        this.seats[seat].cardsSprites.push(card1)
        this.dealCard(card1, this.seats[seat].x, this.seats[seat].y, () => {
            console.log("deal cover...");
            let card2 = this.createCard(null, scale)
            // card2.x = 0
            // card2.y = 0
            this.seats[seat].cardsSprites.push(card2)
            this.dealCard(card2, this.seats[seat].x + (cardParams.width * scale), this.seats[seat].y, () => {
                console.log("play...");
            })
        })
    }

    dealFlop(flop) {
        let scale = cardParams.opponentScale
        let card1 = this.createCard(flop[0], scale)
        this.flop[0].cardsSprite = card1
        this.dealCard(card1, this.flop[0].x, this.flop[0].y, () => {
            
            let card2 = this.createCard(flop[1], scale)
            this.flop[1].cardsSprite = card2
            this.dealCard(card2, this.flop[1].x, this.flop[1].y, () => {
                let card3 = this.createCard(flop[2], scale)
                this.flop[2].cardsSprite = card3
                this.dealCard(card3, this.flop[2].x, this.flop[2].y)
        
            })
        })
    }

    foldCards(seat) {

        let card1 = this.seats[seat].cardsSprites[0]
        let card2 = this.seats[seat].cardsSprites[1]
        this.dealCard(card1, -100, -100, () => {
            card1.destroy()
        })
        this.dealCard(card2, -100, -100, () => {
            card2.destroy()
        })
        this.seats[seat].cardsSprites = []
    }

    showPlayingButtons() {
        this.betButton.x = 350
        this.betButton.y = 680
        this.foldButton.x = 550
        this.foldButton.y = 680
    }
/*
    showTabouretRouge() {
        
        console.log("show!");
        this.tab1surbr.x = 350
        this.tab2surbr.y = 680
        this.tab3surbr.x = 550
        this.tab4surbr.y = 680
    }

    hideTabouretRouge() {
        console.log("hide!");
        this.tab1surbr.x = -350
        this.tab2surbr.y = -680
        this.tab3surbr.x = -550
        this.tab4surbr.y = -680
        this.tab1surbr.y = -350
        this.tab2surbr.x = -680
        this.tab3surbr.y = -550
        this.tab4surbr.x = -680
    }
*/
}

export { PokerTable }