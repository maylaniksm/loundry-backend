const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const md5 = require('md5')

// call model
const user = require("../models/index").tb_user

// allow request body
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.post('/', async (req,res) => {
    // put data
    let data = {
        username: req.body.username,
        password: md5(req.body.password)
    }
    let result = await user.findOne({where:data})

    if(result === null){
        res.status(403).json({
            message: "invalid username or password",
            logged: false
        })
    } else {
        // jwt
        let jwtHeader = {
            algorithm: "HS256",
            // expiresIn: exp.expToken // 1s 1h 1d 1w 1y
        }

        let payload = {
            data: result
        }
        
        let secretKey = "tesukl"

        let token = jwt.sign(payload, secretKey, jwtHeader)
        res.json({
            data: result,
            token: token,
            logged: true
        })
    }
})
app.get('/me', async(req,res)=>{
    // get jwt from header
    let header = req.headers.authorization
    let token = null

    if(header != null){
        // get token from second side
        token = header.split(" ")[1]
    }

    if(token == null){
        res.status(403).json({
            message: "unauthorized"
        })
    } else {
        // jwt
        let jwtHeader = {
            algorithm: "HS256"
        }
        
        let secretKey = "tesukl"

        jwt.verify(token, secretKey, jwtHeader, (err, user) => {
            if(err){
                res.status(403).json({
                    message: "Invalid or expired token",
                    Token: token
                })
            }else{
                res.json({
                    user: user.data
                })
            }
        }) 
    }
})

module.exports = app