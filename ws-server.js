const WebSocket = require('ws');

RegExp.prototype.append = function (re) {
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

  const botQuestions = {
    NO_QUESTION: undefined,
    HOW_ARE_YOU: 'How are you today?',
    WHO_ARE_YOU: `What's your name?`,
    WHERE_ARE_YOU: `Where do you live?`
  }

  wss.on('connection', (ws) => {
    let botQuestion = botQuestions.WHO_ARE_YOU
    let clientName
    ws.send(`Hi, \n Thanks for joining me for a chat. ${botQuestion}`)

    ws.on('message', (message) => {
      console.log('received: %s', message)

      const trimmedMessage = message.trim().toLowerCase()

      let iGetIt = false
      let response = ''
      let clientFeelsGood = false

      const clientNameRespRegex = /(((my|the) name( i|'?)s )|(([a-zA-Z]+ )?calls? me )|(i(( a|'?)m ))((called? )|(known as ))?|(i go by the name ))?(([\w-']+ ?)+)/igm
      

      if(botQuestion === botQuestions.WHO_ARE_YOU){

        const clientNameGroups = trimmedMessage.match(clientNameRespRegex)
        if(clientNameGroups){
          clientNameGroups.forEach((match, index) => console.log(`Group ${index} : ${match}`))
          clientName = clientNameGroups[14]
          response += `Hi ${clientName}. Great name! `
          iGetIt = true
        }
      }

      const clientWellnessRegex = /(i('?| a)m)?.*/igm
        .append(/\s(fine|good|(very well)|well|ok(ay)?|alright|great|cool|sweet|not( too)? bad|happy)/)
        .append(/|\s(sad|bad|sick|ill|bored|tired)/)
        .append(/\s(thank(you|s))?.*/)

      const clientWellness = trimmedMessage.match(clientWellnessRegex)

      if (clientWellness) {
        console.log(clientWellness)
        clientFeelsGood = typeof clientWellness[3] !== 'undefined' ? true : false
        response += clientFeelsGood ? `I'm glad to hear you're ${clientWellness[3]}. ` : `I'm so sorry to hear you're ${clientWellness[7]}. `
        iGetIt = true
      }


      // client asks about bot wellbeing
      let askChatbotWellnessRegex = /(((and )?(how a?re)? )?((yo)?u)|(yourself))\??/i
      const chatBotWellbeingAsked = trimmedMessage.match(askChatbotWellnessRegex)
      if (chatBotWellbeingAsked) {
        response += `I'm fine, Thanks for asking. `
        iGetIt = true
      }

      if (trimmedMessage.includes('?')) {
        // client asks bot's name
        //(^\w+)$|(my\sname(\si|'?)s)|(i('?|\sa)m)\s(\w+)(\s\w+)?\.?(\swhat's yours(\?)?)?
        // client asks about weather
        // client asks for the time / date
        // else
        ws.send(`Hmmmm. I don't know, but you could try Google!`)
        return
      }

      response += iGetIt ? '' : `What you just said was so enlightening. I'm learning so much about you. `

      ws.send(response)

    })
  })
}

module.exports = { startWsServer }