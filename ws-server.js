const WebSocket = require('ws');

RegExp.prototype.append = function (re) {
  return new RegExp(this.source + re.source, this.flags);
}

function sendMessage(ws, response) {
  ws.send(response)
}

function listRegMatchGroups(matches) {
  matches.forEach((match, index) => console.log(`Group ${index} : ${match}`))
}

const botQuestions = {
  NO_QUESTION: undefined,
  HOW_ARE_YOU: 'How are you today?',
  WHO_ARE_YOU: `What's your name?`,
  WHERE_ARE_YOU: `Where do you live?`
}

let botQuestion = botQuestions.WHO_ARE_YOU

function handleMessage(ws, message) {
  let clientName

  console.log('received: %s', message)
  console.log(botQuestion)

  const trimmedMessage = message.trim().toLowerCase()
  let iGetIt = false
  let response = ''
  let clientFeelsGood = false
  if (botQuestion === botQuestions.WHO_ARE_YOU) {
    const clientNameRespRegex = /((my|the) name( i|'?)s |([a-zA-Z]+ )?calls? me |i( a|'?)m (called |known as )?|i go by the name )?(([\w-']+ ?)+)/i

    const clientNameGroups = trimmedMessage.match(clientNameRespRegex)
    if (clientNameGroups) {

      // Change name to sentence case
      clientName = clientNameGroups[7].replace(/\b(\w)/g, s => s.toUpperCase())

      clientFirstName = clientName.split(' ')[0]
      botQuestions.HOW_ARE_YOU = `How are you ${clientFirstName}?`
      botQuestion = botQuestions.HOW_ARE_YOU
      response += botQuestion
      iGetIt = true
      sendMessage(ws, response)
      return
    }
  }

  const clientWellnessRegex = /^(i('?| a)m.* )?/i
    .append(/(fine|good|well|ok(ay)?|alright|great|cool|sweet|not( too)? bad|happy)/)
    .append(/|(sad|bad|sick|ill|bored|tired)/)
  // .append(/..?(thank(you|s))?.*/)
  const clientWellness = trimmedMessage.match(clientWellnessRegex)
  if (clientWellness) {
    listRegMatchGroups(clientWellness)
    clientFeelsGood = typeof clientWellness[3] !== 'undefined' ? true : false
    response += clientFeelsGood ? `I'm glad to hear you're ${clientWellness[3]}. ` : `I'm so sorry to hear you're ${clientWellness[6]}. `

    // and you, and yourself, you, u, how are you
    const andYouRegex = /(and )?(how are )?you(rself)?\??/
    const andYouMatches = trimmedMessage.match(andYouRegex)
    if(andYouMatches) {
      listRegMatchGroups(andYouMatches)
      response += `\nI'm fine. Thanks for asking. `
    }

    iGetIt = true
    sendMessage(ws, response)
    botQuestion = botQuestions.NO_QUESTION
    return
  }

  // client asks about bot wellbeing
  const askChatbotWellnessRegex = /((how a?re)? ((yo)?u)|(yourself))\??/i
  console.log(askChatbotWellnessRegex)

  const chatBotWellbeingAsked = trimmedMessage.match(askChatbotWellnessRegex)
  if (chatBotWellbeingAsked) {
    listRegMatchGroups(chatBotWellbeingAsked)

    response += `I'm fine, Thanks for asking. `
    iGetIt = true
    sendMessage(ws, response)
    return
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
  sendMessage(ws, response)

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
    ws.send(`Hi, \n Thanks for joining me for a chat. ${botQuestion}`)
    ws.on('message', (message) => {
      handleMessage(ws, message)
    })
  })
}

module.exports = { startWsServer }