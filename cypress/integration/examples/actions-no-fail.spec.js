/// <reference types="cypress" />

// if you want to debug when any test fails
// You likely want to put this in a support file,
// or at the top of an individual spec file
Cypress.on('fail', (runnable) => {

})

context('Actions', () => {
    beforeEach(() => {
        cy.visit('https://example.cypress.io/commands/actions')
    })


    // https://on.cypress.io/interacting-with-elements


    it.only('.submit() - submit a form', (done) => {
        // https://on.cypress.io/submit
        cy.get('.action-form')
            .find('[type="text"]').type('HALFOFF')

        cy.get('.action-form').submit()
            .next().then((conf) => {
                expect(conf).to.have.css('box-sizing', 'border-boxA')
                expect(conf).to.contain('Your worm has been submitted!')
                expect(conf).to.have.css('color', 'rgb(32, 181, 32)')
            }).then(() => {
                cy.log('RUN AFTER FAIL!')
            })
        cy.get('.action-btn').then((button) => {
            expect(button).to.contain('Clicak')
            done()
        })

        

    })

    it('.click() - click on a DOM element', () => {
        // https://on.cypress.io/click
        cy.get('.action-btn').click()

        // You can click on 9 specific positions of an element:
        //  -----------------------------------
        // | topLeft        top       topRight |
        // |                                   |
        // |                                   |
        // |                                   |
        // | left          center        right |
        // |                                   |
        // |                                   |
        // |                                   |
        // | bottomLeft   bottom   bottomRight |
        //  -----------------------------------

        // clicking in the center of the element is the default
        cy.get('#action-canvas').click()

        cy.get('#action-canvas').click('topLeft')
        cy.get('#action-canvas').click('top')
        cy.get('#action-canvas').click('topRight')
        cy.get('#action-canvas').click('left')
        cy.get('#action-canvas').click('right')
        cy.get('#action-canvas').click('bottomLeft')
        cy.get('#action-canvas').click('bottom')
        cy.get('#action-canvas').click('bottomRight')

        // .click() accepts an x and y coordinate
        // that controls where the click occurs :)

        cy.get('#action-canvas')
            .click(80, 75) // click 80px on x coord and 75px on y coord
            .click(170, 75)
            .click(80, 165)
            .click(100, 185)
            .click(125, 190)
            .click(150, 185)
            .click(170, 165)

        // click multiple elements by passing multiple: true
        cy.get('.action-labels>.label').click({ multiple: true })

        // Ignore error checking prior to clicking
        cy.get('.action-opacity>.btn').click({ force: true })
    })


})
