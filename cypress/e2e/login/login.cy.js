import { loginRequestSchema, loginResponseSchema } from "../../contracts/loginContract";
import Joi from 'joi';

describe('Login - Serverest', () => {
    const payload = {
        email: 'fulano@qa.com',
        password: 'teste'
    }

    it('Deve realizar login com sucesso e validar contratos', () => {
        cy.validatePayload(loginRequestSchema, payload).then(validation => {
            expect(validation.error).to.be.undefined
        })
        cy.loginRequest(payload, (response) => {
            expect(response.status).to.eq(200)
            const responseValidation = loginResponseSchema.validate(response.body)
            expect(responseValidation.error).to.be.undefined
        })
    })

    it('Não deve logar com senha incorreta', () => {
        const payload = {
            email: 'fulano@qa.com',
            password: 'senhaerrada'
        }
        cy.validatePayload(loginRequestSchema, payload).then(validation => {
            expect(validation.error).to.be.undefined
        })
        cy.loginRequest(payload, (response) => {
            expect(response.status).to.eq(401)
            expect(response.body).to.have.property('message')
            expect(response.body.message).to.contain('Email e/ou senha inválidos')
        })
    })

    it('Não deve permitir login com e-mail em formato inválido', () => {
        const payload = {
            email: 'email-invalido',
            password: 'teste'
        }
        cy.validatePayload(loginRequestSchema, payload).then(validation => {
            expect(validation.error).to.not.be.undefined
            expect(validation.error.details[0].message).to.contain('"email" must be a valid email')
        })

        cy.loginRequest(payload, (response) => {
            expect(response.status).to.eq(400)
            expect(response.body).to.have.property('email')
            expect(response.body.email).to.contain('email deve ser um email válido')
        })
    })

    it('Não deve permitir login com campos obrigatórios vazios', () => {
        const payload = {
            email: '',
            password: ''
        }
        cy.validatePayload(loginRequestSchema, payload, { abortEarly: false }).then(validation => {
            expect(validation.error).to.not.be.undefined
            const errorMessages = validation.error.details.map(detail => detail.message)
            expect(errorMessages).to.include('"email" is not allowed to be empty')
            expect(errorMessages).to.include('"password" is not allowed to be empty')
        })

        cy.loginRequest(payload, (response) => {
            expect(response.status).to.eq(400)

            expect(response.body).to.have.property('email')
            expect(response.body.email).to.contain('email não pode ficar em branco')

            expect(response.body).to.have.property('password')
            expect(response.body.password).to.contain('password não pode ficar em branco')
        })
    })

    it('Não deve permitir login com tipo inválido no e-mail', () => {
        const payload = {
            email: 12345,
            password: 'senha'
        }
        cy.validatePayload(loginRequestSchema, payload, { abortEarly: false }).then(validation => {
            expect(validation.error).to.not.be.undefined

            const messages = validation.error.details.map(d => d.message)
            expect(messages[0]).to.contain('"email" must be a string')
        })


        cy.loginRequest(payload, (response) => {
            expect(response.status).to.eq(400)

            expect(response.body).to.have.property('email')
            expect(response.body.email).to.contain('email deve ser uma string')
        })
    })

    it('Não deve permitir login com tipo inválido na senha', () => {
        const payload = {
            email: 'fulano@qa.com',
            password: true
        }
        cy.validatePayload(loginRequestSchema, payload, { abortEarly: false }).then(validation => {
            expect(validation.error).to.not.be.undefined
            const messages = validation.error.details.map(d => d.message)
            expect(messages[0]).to.contain('"password" must be a string')
        })
        
        cy.loginRequest(payload, (response) => {
            expect(response.status).to.eq(400)

            expect(response.body).to.have.property('password')
            expect(response.body.password).to.contain('password deve ser uma string')
        })
    })
})