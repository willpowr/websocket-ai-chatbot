const WebSocket = require('ws');

RegExp.prototype.append = function(re) {
  return new RegExp(this.source + re.source, this.flags);
}

function startWsServer(wsPort) {
  const wss = new WebSocket.Server({ port: wsPort }, () => {
    console.log(`Websocket server running on ws://${wss.options.host || 'localhost'}:${wss.options.port}/`)
  })

  wss.onerror = (event) => {
    console.error("WebSocket error observed:", event)
  };

  wss.on('close', (event) => {
    console.log("This conversation is over!")
  })

  wss.on('connection', (ws) => {
    ws.send(`Hi, \n Thanks for joining me for a chat. How are you today?`)

    ws.on('message', (message) => {
      console.log('received: %s', message)

      const trimmedMessage = message.trim().toLowerCase()

      let iGetIt = false
      let response = ''
      let clientFeelsGood = false

      // const wellnessRegex = /(i('?| a)m)?.*((fine|good|(very well)|well|ok(ay)?|alright|great|cool|sweet|not( too)? bad|happy)|(sad|bad|sick|ill|bored))( thank(you|s))?.*/i
      let wellnessRegex = /(i('?| a)m)?.*/i
      .append(/(fine|good|(very well)|well|ok(ay)?|alright|great|cool|sweet|not( too)? bad|happy)/)
      .append(/|(sad|bad|sick|ill|bored|tired)/)
      .append(/( thank(you|s))?.*/)
      console.log (wellnessRegex)
      const clientWellness = trimmedMessage.match(wellnessRegex)
      if(clientWellness){
        console.log(clientWellness)
        clientWellness.forEach((match, index) => console.log(`Group ${index} : ${match}`))
        clientFeelsGood = typeof clientWellness[3] !== 'undefined' ? true : false
        response += clientFeelsGood ?  `I'm glad to hear you're ${clientWellness[3]}. ` : `I'm so sorry to hear you're ${clientWellness[7]}. `
        iGetIt = true
      }
      

      if(trimmedMessage.includes('how are you?', trimmedMessage.length-16)){
        ws.send(response += `I'm fine, Thanks for asking. `)
        return
      }

      if(trimmedMessage.includes('?', trimmedMessage)){
        ws.send(`Hmmmm. I don't know, but you could try Google!`)
        return
      }

      response += iGetIt? '' : `What you just said was so enlightening. I'm learning so much about you. `

      ws.send(response)

    })
  })
}

module.exports = { startWsServer }