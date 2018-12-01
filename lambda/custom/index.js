/* eslint-disable  func-names */
/* eslint-disable  no-console */

/**
 * @name skill-roll-a-dice
 * @author Caldi Gianfranco
 * @version 1.0.0
 * 
 * @todo  localizzare in en-US (vedi i18next e i18next-sprintf-postprocessor)
 */

/**
 * 
 * @param {Number} min valore minimo (incluso)
 * @param {Number} max valore massimo (incluso)
 * @returns valore random compreso tra min e max
 */
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Number} value valore da controllare
 * @param {Number} min valore minimo
 * @param {Number} max valore massimo
 * @returns ritorna il valore o min/max se fuori range
 */
function range(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * 
 * @param {Object} slot slot da cui estrarre il valore
 * @param {Any} def valore di default nel caso lo slot non ne contenga
 * @returns valore dello slot o def se non ne contiene (compreso null e undefined)
 */
function getSlotValue(slot, def) {
  if (!slot) return def;
  if (slot.value === undefined || slot.value === null) return def;
  return slot.value;
}

/**
 * 
 * @param {Number} ndice numero di dadi lanciati
 * @param {Number} nface numero di facce dei dadi
 * @param {Array<Number>} values array di valori risultante dai lanci
 * @returns stringa formattata per il metodo speak()
 */
function formatResult(ndice, nface, values) {
  if (ndice === 1) {
    // il tag <s> separa foneticamente le parole
    return `<speak>
        Ho lanciato un dado da ${nface}: 
        <s>${values[0]}</s>
      </speak>`;
  } else if (ndice > 1) {
    // estraggo l'ultimo valore per concatenarlo alla fine con una "e"
    const last = values.splice(-1);
    // il tag <s> separa foneticamente le parole, 
    // per l'ultimo valore ci pensa la "e" a tenerlo separato
    return `<speak>
        Ho lanciato ${ndice} dadi da ${nface}: 
        ${values.map(v => '<s>' + v + '</s>')} e ${last}
      </speak>`;
  } else {
    return 'Non ho lanciato dadi';
  }
}
/** utility - end */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Puoi lanciare un massimo di dieci dadi, da due a cento facce.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello', speechText)
      .getResponse();
  },
};

/**
 * Slot:
 * {ndice} numero di dadi (1-10), default 1
 * {nface} numero di facce dei dadi (2-100), default 6
 */
const RollADiceIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RollADiceIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // defaul dado a 6 facce
    const nface = range(+getSlotValue(request.intent.slots.nface, 6), 2, 100);
    // defaul 1 volta
    const ndice = range(+getSlotValue(request.intent.slots.ndice, 1), 1, 10);
    const values = Array.from(new Array(ndice), () => getRandom(1, nface));
    const speechText = formatResult(ndice, nface, values);

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Roll', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = `<speak>
        Prova a dire: 
        <s>lancia due dadi da sei</s>
        oppure
        <s>lancia tre di venti</s>
      </speak>`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Help', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Arrivederci!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Bye', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Scusa, non ho capito.')
      .reprompt('Scusa, non ho capito.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RollADiceIntent,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
